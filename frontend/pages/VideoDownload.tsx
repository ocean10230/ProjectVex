import { XCircle, Loader2, Check, CircleX } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { FormatBytes } from 'functions/Format'

import { VideoData } from 'hooks/utilities/VideoData'
import { DebugContext } from 'hooks/utilities/Debugs'
import { UseHistory } from 'hooks/downloads/DownloadHistory'

import VideoPreviewCard from 'components/layout/youtube/VideoPreviewCard'

import { Messages } from 'src/Config'
import { AnimatePresence, motion } from 'framer-motion'
import PreferenceContext from 'hooks/preferences/Youtube'
import Transition from 'frontend/motion/Transitions'

const handleReturnClick = () => {
    const { Status } = DebugContext.getState()

    if (Status === 2) window.postMessage({ type: Messages.ClosePopup }, "*")
    else window.postMessage({ type: Messages.StopDownload }, "*")
}

export function VideoDownloading() {
    const logEndRef = useRef<HTMLDivElement>(null)
    const { selected_media, video, Qualities, selection_id } = VideoData()

    const logs = DebugContext()
    const { SaveHistory } = PreferenceContext()
    const history = UseHistory()

    useEffect(() => {
        window.postMessage({ type: Messages.DownloadVideo, format: selected_media }, "*")
    }, [])

    useEffect(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }) , [logs.logs.length])

    useEffect(() => {
        if (logs.Status !== 2 || !video || !SaveHistory) return

        const videoData = Qualities.find(q => q.id === selection_id)
        const thumbs = video.snippet.thumbnails
        const thumbnail =
            thumbs.standard?.url ||
            thumbs.high?.url ||
            thumbs.medium?.url ||
            thumbs.default?.url ||
            ""

        history.add({
            id: video.id,
            title: video.snippet.title,
            quality: videoData
                ? videoData.extension === "mp4"
                    ? `${videoData.resolution}p`
                    : `${Math.round(videoData.bitrate)}kbps`
                : "Unknown",
            size: videoData ? FormatBytes(videoData.size) : logs.Size || "0 B",
            timestamp: Date.now(),
            thumbnail,
        })
    }, [logs.Status, SaveHistory])

    const sizeStr = logs.Size || ""
    const num = Math.round(parseFloat(sizeStr.match(/\d+(?:\.\d+)?/)?.[0] || "0"))
    const downloadedMB = ((logs.Progress / 100) * num).toFixed(0)

    return (
        <div className="flex flex-1 overflow-hidden w-full h-full">

            <div className="w-1/2 h-full flex flex-col justify-between p-2 border-r border-border">
                <div className="flex flex-col gap-2">
                    <VideoPreviewCard video={video} />

                    {/* current action */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg2 border border-border text-xs">
                        
                        <div className="flex items-center gap-2">
                            { logs.Status === 2 ? (
                                <Check className="size-3.5 text-green-500 shrink-0" />
                            ) : (
                                <Loader2 className="size-3.5 text-primary animate-spin shrink-0" />
                            )}

                            <p className="truncate">{logs.Status === 2 ? "Finished" : logs.Processing || "Preparing download..."}</p>
                            
                        </div>
                    </div>

                    <AnimatePresence>
                        {
                            logs.Status !== 2 &&
                            <motion.div
                                exit={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                                transition={Transition}
                                className="flex flex-col gap-2 p-3 rounded-xl bg-bg2 border border-border w-full min-w-0"
                            >
                                <div className="flex items-center justify-between text-xs font-medium">
                                    <span>{downloadedMB}/{num} MB</span>
                                    <span className="text-primary">{(logs.Progress || 0).toFixed(0)}%</span>
                                </div>

                                <div className="w-full h-1.5 bg-s1 light:border-muted/30 border border-transparent rounded-full overflow-hidden">
                                    <div 
                                        className="h-full primary-element rounded-full transition-all duration-75"
                                        style={{ width: `${logs.Progress || 0}%` }}
                                    />
                                </div>
                            </motion.div>
                        }
                    </AnimatePresence>
                </div>

                <button
                    className="my-0.5 accent"
                    disabled={logs.Processing.toLowerCase().includes("merging") && logs.Status !== 2}
                    onClick={handleReturnClick}
                >
                    {logs.Status === 2 ? (
                        <>
                            <CircleX className="size-4 shrink-0" />
                            Close popup
                        </>
                    ) : (
                        <>
                            <XCircle className="size-4 shrink-0" />
                            Cancel download
                        </>
                    )}
                </button>
            </div>

            {/* RIGHT — logs */}
            <div className="w-1/2 h-full flex flex-col">
                <div className="shrink-0 px-3 py-2 border-b border-border flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wide">Debug logs</p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-0.5 font-mono">
                    {logs.logs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs px-1.5 py-1 rounded-md hover:bg-s1 transition-colors">
                            <span className="text-muted/40 shrink-0 select-none">
                                {new Date(log.time).toTimeString().slice(0, 8)}
                            </span>
                            <span className="text-muted/80 break-all wrap-break-word">
                                {log.text}
                            </span>
                        </div>
                    ))}

                    {logs.Processing.includes("Download") && 
                    
                    <div className="flex items-start gap-2 text-xs px-1.5 py-1 rounded-md hover:bg-s1 transition-colors">
                        Download status: {logs.Speed || "0 B/s"}                
                    </div>}

                    <div ref={logEndRef} />
                </div>

            </div>

        </div>
    )
}