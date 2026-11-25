import { Sandbox } from "@/downloader/sandbox/Evaluate"
import { Fetch } from "@/proxy/HttpProxy"
import { General, Messages, UIConfig } from '@/Config'

const { Inset, Width, Height } = UIConfig

const getTargetCoords = (pos: Position): { x: number; y: number } => {
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight

    const leftX = Inset
    const centerX = Math.max(Inset, (vw - Width) / 2)
    const rightX = Math.max(Inset, vw - Width - Inset)

    const topY = Inset
    const centerY = Math.max(Inset, (vh - Height) / 2)
    const bottomY = Math.max(Inset, vh - Height - Inset)

    const map: Record<Position, { x: number; y: number }> = {
        tl: { x: leftX, y: topY },
        t:  { x: centerX, y: topY },
        tr: { x: rightX, y: topY },
        l:  { x: leftX, y: centerY },
        c:  { x: centerX, y: centerY },
        r:  { x: rightX, y: centerY },
        bl: { x: leftX, y: bottomY },
        b:  { x: centerX, y: bottomY },
        br: { x: rightX, y: bottomY },
    }

    return map[pos] ?? map.tr
}

const tweenContainerPosition = (el: HTMLElement, pos: Position, instant = false) => {
    const { x, y } = getTargetCoords(pos)

    if (instant) {
        const prevTransition = el.style.transition
        el.style.transition = "none"
        el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
        void el.offsetHeight
        el.style.transition = prevTransition
        return
    }

    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
}

const start = async () => {
    if (!globalThis.document) return
    if (!location.hostname.includes("youtube.com")) return alert("This extension is specialized to download videos from Youtube, other platforms that are not focused won't be able to be downloaded")
    console.clear()

    const old = document.getElementById("YT-DLP_ProjectVexContainer")
    if (old) old.remove()

    const container = document.createElement("div")
    const iframe = document.createElement("iframe")

    let currentPosition: Position = "tr"

    container.id = "YT-DLP_Container"
    Object.assign(container.style, {
        position: "fixed",
        top: "0px",
        left: "0px",
        width: `${Width}px`,
        height: `${Height}px`,
        zIndex: "99999",
        willChange: "transform",
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
    })

    tweenContainerPosition(container, currentPosition, true)

    Object.assign(iframe.style, {
        width: "100%",
        height: "100%",
        border: "none",
    })

    const onResize = () => tweenContainerPosition(container, currentPosition, true)
    window.addEventListener("resize", onResize)

    iframe.onload = () => {
        const iframe_channel = new MessageChannel()
        const proxy = new MessageChannel()

        const iframe_port = iframe_channel.port1

        iframe.contentWindow?.postMessage("content_init", "*", [iframe_channel.port2, proxy.port2])
        proxy.port1.onmessage = (e) =>
            Fetch(e.data.request).then((result) => iframe_port.postMessage({ type: Messages.ProxyResult, response: result }, [result.body]))

        iframe_port.onmessage = (e) => {
            const message = e.data

            if (General.ShowLogs.Messages)
                console.log("IFrame->Worker", message)

            switch (message.type) {
                case Messages.Sandbox:
                    if (General.ShowLogs.Messages) console.log("[Sandbox] Sandboxing some codes")

                    Sandbox(message.code).then((res) => iframe_port.postMessage({
                        type: Messages.SandboxResult,
                        result: res,
                    }))

                    break
                case Messages.RuntimeInitialization:
                case Messages.PushVideoQuality:
                case Messages.PushAudioQuality:
                case Messages.Console:
                case Messages.DownloadVideo:
                case Messages.VideoDownloaded:
                case Messages.StopDownload:
                    iframe_port.postMessage(message)
                    break
                case Messages.IframePosition: {
                    const nextPos = (message.Position ?? message.position) as Position
                    if (nextPos) {
                        currentPosition = nextPos
                        tweenContainerPosition(container, currentPosition)
                    }
                    break
                }
                case Messages.ClosePopup:
                    container.style.opacity = "0"
                    setTimeout(() => {
                        iframe.remove()
                        container.remove()
                    }, 750)
                    break
            }
        }

        iframe_port.postMessage({ type: Messages.VideoURL, dlurl: location.href })
    }

    iframe.src = chrome.runtime.getURL("/iframe.html")
    container.appendChild(iframe)
    document.body.appendChild(container)
}

start()