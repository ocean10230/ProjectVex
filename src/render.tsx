import { render } from 'preact'
import { General, Messages } from '@/Config'

import { VideoData, YoutubeURL } from '@/app/manager/utilities/VideoData'
import { DebugContext } from '@/app/manager/utilities/Debugs'
import ThemeContext from '@/app/manager/themes/Display'
import { App } from '@/app/App'
import '@/app/index.css'
import Notify from './app/components/Notify'
import { X } from 'lucide-react'

render(<App />, document.getElementById('app')!)
let respond: MessagePort | undefined

const progressController = {
    currentProgress: 0,
    targetProgress: 0,
    speedSamples: [] as number[],
    rafId: 0 as number,
    active: false,

    parseSpeed(raw: string): number {
        const match = raw.match(/([\d.]+)\s*([KMG]?i?B)\/s/i)
        if (!match) return 0
        const val = parseFloat(match[1])
        const unit = match[2].toUpperCase()
        const multipliers: Record<string, number> = {
            'B': 1,
            'KB': 1e3, 'KIB': 1024,
            'MB': 1e6, 'MIB': 1024 ** 2,
            'GB': 1e9, 'GIB': 1024 ** 3,
        }
        return val * (multipliers[unit] ?? 1)
    },

    formatSpeed(bytesPerSec: number): string {
        if (bytesPerSec <= 0) return '0 B/s'
        const units = ['B/s', 'KB/s', 'MB/s', 'GB/s']
        let idx = 0
        let val = bytesPerSec
        while (val >= 1000 && idx < units.length - 1) {
            val /= 1000
            idx++
        }
        return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
    },

    pushSample(progress: number, rawSpeed: string, size: string) {
        if (progress < this.targetProgress - 15) {
            this.currentProgress = progress
            this.speedSamples = []
        }
        this.targetProgress = progress

        const bps = this.parseSpeed(rawSpeed)
        if (bps > 0) {
            this.speedSamples.push(bps)
            if (this.speedSamples.length > 8) this.speedSamples.shift()
        }

        const avgBps = this.speedSamples.length
            ? this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
            : 0

        DebugContext.getState().SetProgress({
            Size: size,
            Speed: avgBps > 0 ? this.formatSpeed(avgBps) : rawSpeed,
            Status: 1,
        })

        if (!this.active) this.startLoop()
    },

    startLoop() {
        this.active = true
        let lastTime = performance.now()

        const tick = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1)
            lastTime = now

            const diff = this.targetProgress - this.currentProgress
            if (Math.abs(diff) > 0.05) {
                this.currentProgress += diff * Math.min(1, dt * 4.5)
                DebugContext.getState().SetProgress({
                    Progress: Number(this.currentProgress.toFixed(1)),
                })
            }

            if (this.active) {
                this.rafId = requestAnimationFrame(tick)
            }
        }

        this.rafId = requestAnimationFrame(tick)
    },

    stop(finalProgress?: number) {
        this.active = false
        cancelAnimationFrame(this.rafId)
        this.speedSamples = []
        if (finalProgress !== undefined) {
            this.currentProgress = finalProgress
            this.targetProgress = finalProgress
        }
    }
}

window.addEventListener('message', event => {
    if (event.data === "content_init") {
        respond = event.ports[0]

        respond.addEventListener("message", (e) => {
            const message = e.data
            if (General.ShowLogs.Messages) console.log("Background->Frontend")
            const updated = [...VideoData.getState().Qualities]

            switch (message.type) {
                case Messages.VideoURL:
                    YoutubeURL.getState().setURL(message.dlurl)
                    if (General.ShowLogs.Frontend) console.info("[Frontend] received video URL")
                    break

                case Messages.VideoDownloaded: {
                    progressController.stop(100)
                    const state = DebugContext.getState()
                    state.SetProgress({
                        Progress: 100,
                        Status: 2
                    })
                    state.Add("Downloaded file to system!")
                    break
                }

                case Messages.Console: {
                    const text = message.text as string
                    const lower = text.toLowerCase()
                    const state = DebugContext.getState()
                    const isAudio = VideoData.getState().selected_media

                    if (text.includes("Error") && text.includes("pyodide")) {
                        progressController.stop()
                        Notify("Detected unknown error, please report through the github repository", X)
                        state.SetProgress({ Status: 3, Processing: "Unknown Error" })
                        return state.Add(`[Python] Unknown error`)
                    }

                    if (text.includes("Confirm you are on the latest version")) {
                        progressController.stop()
                        Notify("Video downloading CLI is outdated, please wait for update", X)
                        state.SetProgress({ Status: 3, Processing: "Outdated libraries" })
                        return state.Add("[Worker] YT-DLP is outdated, please wait for update...")
                    }

                    if (!["pyodide", "[download]"].some(prefix => lower.includes(prefix)))
                        return state.Add(text)

                    if (lower.includes("merger")) {
                        progressController.stop(100)
                        return [
                            state.SetProgress({
                                Progress: 100,
                                Processing: isAudio ? "Post-processing audio" : `Merging files...`,
                                Status: 1
                            }),
                            state.Add(isAudio ? "Post-processing audio" : "Merging into " + `"${text.split(`formats into "`)[1]?.split("\"")[0] ?? "output"}"`)
                        ]
                    }

                    if (text.includes("[download]")) {
                        if (text.includes("Destination:")) {
                            progressController.stop(0)
                            const file = text.split("Destination:")[1].trim()
                            state.Add(`Downloading ${file.replaceAll(General.OutputFolder + "/", "")} to ${General.OutputFolder}`)
                            state.SetProgress({
                                Progress: 0,
                                Processing: `Downloading ${text.includes("mp4") ? "video" : "audio"}...`,
                                Status: 1
                            })
                            break
                        }

                        const match = text.match(/(\d+(?:\.\d+)?)%\s+of\s+~?\s*([^\s]+).*?at\s+([^\s]+)(?:\s+ETA\s+([^\s]+))?/)

                        if (match) {
                            progressController.pushSample(
                                parseFloat(match[1]),
                                match[3],
                                match[2]
                            )
                        }
                    }
                    break
                }

                case Messages.PushVideoQuality:
                    updated.push({
                        type: "video",
                        resolution: message.resolution,
                        size: message.size,
                        id: message.id,
                        extension: "mp4"
                    })
                    VideoData.setState(prev => ({ ...prev, Qualities: updated }))
                    break

                case Messages.PushAudioQuality:
                    updated.push({
                        type: "audio",
                        bitrate: message.bitrate,
                        size: message.size,
                        id: message.id,
                        extension: message.extension
                    })
                    VideoData.setState(prev => ({ ...prev, Qualities: updated }))
                    break

                case Messages.RuntimeInitialization:
                    VideoData.setState(prev => ({ ...prev, pyodide_loaded: true }))
                    break
            }
        })

        respond.start()

        respond.postMessage({
            type: "IframePosition",
            Position: ThemeContext.getState().Position,
        })
    }
    else if (["DownloadFormat", "Context.Position", "ClosePopup", "StopDownload"].includes(event.data.type)) {
        respond?.postMessage(event.data)
    }
})