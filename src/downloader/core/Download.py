
import os
import sys
import io
import json
import importlib
import pyodide_http_fork as pyodide_http

pyodide_http.patch_all()

from pyodide.ffi import run_sync, to_js
from yt_dlp.utils import _utils
from yt_dlp.postprocessor import ffmpeg
from yt_dlp import downloader
from js import ffmpegbridge, Object, Sandbox, AddResolution, AddAudio, set_audio

def run_sync_wrapper(func):
    try:
        return run_sync(func)
    except RuntimeError as e:
        from js import firefox_jspi_warning
        firefox_jspi_warning()

if importlib.util.find_spec("yt_dlp.extractor.youtube.jsc"):
    print("Adding custom challenge solver...")
    from yt_dlp.extractor.youtube.jsc.provider import (
        register_provider,
        register_preference,
    )

    from yt_dlp.extractor.youtube.jsc._builtin.deno import DenoJCP

    @register_provider
    class dlProJCP(DenoJCP):
        PROVIDER_NAME = 'dlPro'
        JS_RUNTIME_NAME = 'dlPro'

        def is_available(self, /) -> bool:
            return True

        def _run_deno(self, stdin, options) -> str:
            print("Requesting JS challenge handler...", file=sys.stderr)
            res = run_sync_wrapper(Sandbox(stdin))
            print("Got challenge result", file=sys.stderr)
            return res

        def _npm_packages_cached(self, stdin: str) -> bool:
            return False

    @register_preference(dlProJCP)
    def preference(*_) -> int:
        return 99999999999999999

def popen_run(cls, args, **kwargs):
    if args[0] in ["ffmpeg", "ffprobe"]:
        return run_sync_wrapper(
            ffmpegbridge(
                args[0],
                to_js(args[1:], dict_converter=Object.fromEntries),
                kwargs.get("stderr", -1) == -2 
            )
        ).to_py()
    raise FileNotFoundError(f"yt-dlp attempted to call {args}, which isn't supported.")

def patched_init(self, args, *remaining, **kwargs):
    stdout, stderr, self.returncode = popen_run(None, args, **kwargs)
    self.stdout = io.StringIO(stdout)
    self.stderr = io.StringIO(stderr)
    self.stdin = io.StringIO("")

_utils.Popen.run = classmethod(popen_run)
_utils.Popen.__init__ = patched_init
_utils.Popen.wait = lambda self, *_: self.returncode

from yt_dlp import YoutubeDL

def live_filter(info, *, incomplete):
    if info.get("is_live"):
        return "Livestreams cannot be downloaded"

os.makedirs(output_folder, exist_ok=True)

ydl_opts = {
    "outtmpl": output_folder + "/%(title)s.%(ext)s",
    "merge_output_format": "mp4",
    "format": "bv*[vcodec^=avc1]+ba[acodec^=m4a]/bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
    "verbose": False,
    "match_filter": live_filter,
    "external_downloader": "native",
    "hls_prefer_native": True,
    "remote_components": ["ejs:github", "ejs:npm"],
}

from yt_dlp.networking.exceptions import NoSupportingHandlers
import traceback

with YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(url, download=False)

    for f in info.get("formats", []):
        vcodec = f.get("vcodec")
        acodec = f.get("acodec")
        protocol = f.get("protocol", "")
        fmt_id = str(f.get("format_id", ""))
        size_bytes = f.get("filesize") or f.get("filesize_approx")

        if protocol not in ("https", "http") or fmt_id.endswith("-drc"):
            continue

        if vcodec != "none":
            AddResolution(f.get("resolution"), f.get("ext"), size_bytes, fmt_id)
        elif vcodec == "none" and acodec != "none":
            note = (f.get("format_note") or "").lower()

            if fmt_id.isdigit() or "original" in note:
                AddAudio(f.get("abr"), f.get("ext"), size_bytes, fmt_id)

    selection = await desired_format
    if isinstance(selection, str):
        fmt = selection
        media_type = None
    else:
        sel_dict = selection.to_py() if hasattr(selection, "to_py") else dict(selection)
        fmt = sel_dict.get("format", "")
        media_type = sel_dict.get("mediaType") or sel_dict.get("type")

    is_audio = (media_type == "audio") or fmt.startswith("worstvideo")

    for stale_key in ("requested_formats", "requested_entries", "format", "format_id", "ext", "url"):
        info.pop(stale_key, None)

    if is_audio:
        set_audio(True)
        print("downloading audio")
        ydl.params["keepvideo"] = True
    
    ydl.params["format"] = fmt
    ydl.format_selector = ydl.build_format_selector(fmt)

    video_data = ydl.process_ie_result(info, download=True)
    downloads = video_data.get("requested_downloads") or []
    merged_path = ydl.prepare_filename(video_data)

    if is_audio and len(downloads) >= 2:
        video_path = downloads[0].get("filepath")
        audio_path = downloads[1].get("filepath")

        print("Kept audio:", audio_path)

        for temp_path in (merged_path, video_path):
            if temp_path and temp_path != audio_path and os.path.exists(temp_path):
                os.remove(temp_path)

        filepath = audio_path
    else:
        if len(downloads) >= 2:
            for d in downloads:
                raw_path = d.get("filepath")
                if raw_path and raw_path != merged_path and os.path.exists(raw_path):
                    os.remove(raw_path)

        filepath = merged_path
        if not os.path.exists(filepath):
            filepath = os.path.splitext(filepath)[0] + ".mp4"