declare global {
    interface Window {
        AddResolution: (Resolution: string, Extension: string, Size: number, ID: string) => void
        AddAudio: (Bitrate: number, Extension: string, Size: number, ID: string) => void
        
        ffmpegbridge: any
        spawn_worker: () => any
        set_audio: (boolean: boolean) => any
        Sandbox: (code: string) => any
        request_proxied_fetch: (data: any) => Promise<ProxyResult>
    }
}

import { ProxyFetch, response, spawn_worker } from '@/proxy/HttpWorker'
import { DynamicPromise as promise_init } from '@/downloader/utility/Promise'
import { GetPyodide, StandardHandler } from '@/downloader/helper/Pyodide'
import { Config, ffmpegbridge, PatchWorker } from '@/downloader/core/FFmpeg'
import PythonScript from "./Download.py?raw"

import type { PyodideInterface } from 'pyodide'
import { Debugger } from '@/downloader/helper/Debug'
import { GetAssets } from '@/downloader/utility/Assets'
import { General, Messages } from '@/Config'

const Debug = new Debugger("Worker")
let Download = promise_init<string>()
let Format = promise_init<string>()
let Evaluation = promise_init<string>()

let Runtime: PyodideInterface
let Request: MessagePort

const GetWheel = async (name: string) => {
    Debug.Log("Loading library " + name)
    const Response = await fetch(`https://pypi.org/pypi/${name}/json`)
    const Data = await Response.json()
    const Library = Data.urls.find((file: { url: string, packagetype: string }) => file.packagetype === "bdist_wheel")
    return Library.url
}

const Receive = (event: MessageEvent<any>) => {
    let message = event.data

    if (General.ShowLogs.Messages)
        console.log("IFrame->Worker", message)
    
    switch (message.type) {
        case Messages.VideoURL:
            Download.Resolve(message.dlurl)
            break
        case Messages.ProxyResult:
            response?.Resolve(Runtime?.toPy(message.response))
            break
        case Messages.SandboxResult:
            Evaluation.Resolve(message.result)
            break
        case Messages.DownloadVideo:
            Format.Resolve(message.format)
            break
    }
}

async function MainWorker() {
    Debug.Log("Patching stuff")

    self.request_proxied_fetch = (Data) => ProxyFetch(Data, Request)
    PatchWorker()

    Debug.Log("Loading Python")
    const pyodide = await GetPyodide()

    Runtime = pyodide
    Request.postMessage({ type: Messages.RuntimeInitialization })

    const PatchSSL = async () => {
        pyodide.FS.mkdirTree("/usr/lib")
        Debug.Log("Loading cryptography libraries...")
        await Promise.all(["libcrypto.so", "libssl.so"].map(async f => pyodide.FS.writeFile(`/usr/lib/${f}`, new Uint8Array(await (await fetch(GetAssets(`/libs/pyodide/openssl-1.1.1w/${f}`))).arrayBuffer()))))
        await pyodide.loadPackage(GetAssets(`/libs/pyodide/ssl-1.0.0-cp312-cp312-pyodide_2024_0_wasm32.whl`))
    }

    const PatchHTTP = async () => {
        pyodide.FS.mkdirTree("/lib/python3.12/site-packages/pyodide_http_fork")
        Debug.Log("Loading HTTP Proxy client...")
        await Promise.all(["__init__.py", "_core.py", "_requests.py", "_streaming.py", "_urllib.py"].map(async f => pyodide.FS.writeFile(`/lib/python3.12/site-packages/pyodide_http_fork/${f}`, await (await fetch(GetAssets(`/libs/pyodide_http_fork/pyodide_http/${f}`))).text())))
    }

    await Promise.all([ PatchSSL(), PatchHTTP(), pyodide.loadPackage(await Promise.all([ GetWheel('yt-dlp'), GetWheel('yt-dlp-ytse') ])) ])
    Debug.Log("Fully initialized python runtime")

    pyodide.globals.set("url", await Download.Promise)
    pyodide.globals.set("output_folder", General.OutputFolder)
    pyodide.globals.set("desired_format", Format.Promise)

    pyodide.setStdin({error: true});
    pyodide.setStdout({raw: (byte) => StandardHandler(Debug, byte, "stdout")})
    pyodide.setStderr({raw: (byte) => StandardHandler(Debug, byte, "stderr")})

    let IsAudio = false
    Format.Promise.then((Format) => { IsAudio = Format.startsWith("worstvideo") })

    await pyodide.runPythonAsync(PythonScript)
    
    const files = pyodide.FS.readdir(General.OutputFolder).filter((f: string) => f !== '.' && f !== '..' )
    console.log(files)
    
    const filename = files.find((f: string) => (IsAudio ? f.includes("m4a") || f.includes("webm") : true))
    const fileBytes = pyodide.FS.readFile(General.OutputFolder + "/" + filename)
    
    files.forEach(file => pyodide.FS.unlink(General.OutputFolder + "/" + file))

    const blobURL = URL.createObjectURL(new Blob([fileBytes as BlobPart], { type: "video/mp4" }))
    Request.postMessage({ type: Messages.VideoDownloaded, blobURL, Name: filename })
}

onmessage = event => {
    if (event.data === "init") {
        Request = event.ports[0]
        Request.onmessage = Receive

        Debug.SetLoggingPort(Request)
        Debug.Log("Intiailizing download worker...")
        
        self.spawn_worker = spawn_worker
        self.ffmpegbridge = ffmpegbridge
        self.set_audio = (b) => { Config.DisableUnlink = b }

        self.Sandbox = async (code) => {
            Evaluation = promise_init()
            Request.postMessage({ type: Messages.Sandbox, code })
            return await Evaluation.Promise
        }
        
        self.AddResolution = (resolution, extension, size, id) => {
            if (extension.toLowerCase() !== "mp4" || !size) return
            const dimensions = resolution.split('x').map(Number)
            const shortSide = Math.min(...dimensions)
            if (isNaN(shortSide)) return
            Request.postMessage({ 
                type: Messages.PushVideoQuality, 
                resolution: shortSide, 
                size, id 
            })
        }

        self.AddAudio = (bitrate, extension, size, id) => {
            if (isNaN(bitrate) || isNaN(size)) return
            Request.postMessage({ type: Messages.PushAudioQuality, bitrate, size, id, extension })
        }

        MainWorker().catch(e => {
            console.error(e)
            Debug.Log(`Error: \n${e.toString()}\n${e.stack}`)
            throw e
        })
    }
}