import { General, Messages } from '@/Config'
import { Debugger } from "@/downloader/helper/Debug"
import { DynamicPromise } from "@/downloader/utility/Promise"

let dlurl = DynamicPromise<string>()
let worker: Worker

let respond: MessagePort
let worker_port: MessagePort // YT-DLP Worker port
let proxy: MessagePort       // Fetch proxy port

const Debug = new Debugger("IFrame")

function content_port_onmessage(event: MessageEvent<any>) {
    const message = event.data
    if (General.ShowLogs.Messages)
        console.debug("Background->IFrame", message)
    
    switch (event.data.type) {
        case Messages.VideoURL:
            dlurl.Resolve(message.dlurl)
            break
        case Messages.ProxyResult:
            worker_port.postMessage(message)
            break
        case Messages.SandboxResult:
            worker_port.postMessage(message)
            break
        case Messages.DownloadVideo:
            worker_port.postMessage(message)
            break
        case Messages.StopDownload:
            worker.terminate()
            respond.postMessage({ type: "ClosePopup" })
            break
    }
}

window.addEventListener('message', event => {
    if (event.data === "content_init") {
        respond = event.ports[0]
        proxy = event.ports[1]
        respond.onmessage = content_port_onmessage

        Debug.SetLoggingPort(respond)

        main().catch(e => {
            console.error(e)
            Debug.Log("Fatal error: " + e.toString() + "\n" + e.stack)
            throw e
        })
    }
})

function WorkerMessageHandler(event: MessageEvent<any>) {
    let message = event.data
    if (General.ShowLogs.Messages)
        console.log("Worker->IFrame", message)

    switch (message.type) {
        case Messages.Console:
            respond.postMessage(message)
            break
        case Messages.Sandbox:
            respond.postMessage(message)
            break
        case Messages.RequestProxiedFetch:
            proxy.postMessage(message)
            break
        case Messages.RuntimeInitialization:
            respond.postMessage(message)
            break
        case Messages.PushVideoQuality:
            respond.postMessage(message)
            break
        case Messages.PushAudioQuality:
            respond.postMessage(message)
            break
        case Messages.VideoDownloaded:
            let a = document.createElement("a")
            document.body.appendChild(a)
            
            a.href = message.blobURL
            a.download = message.Name
            a.click()

            setTimeout(() => {
                window.URL.revokeObjectURL(message.blobURL)
                document.body.removeChild(a)
                respond.postMessage(message)
            }, 500)

            break
    }
}

async function main() {
    worker = new Worker("/scripts/worker.js", { type: "module" })
    const worker_channel = new MessageChannel()
    worker_port = worker_channel.port1
    worker_port.onmessage = WorkerMessageHandler
    
    worker.postMessage(chrome.runtime.getURL("/"), [])
    worker.postMessage("init", [ worker_channel.port2 ])
    worker_port.postMessage({ type: Messages.VideoURL, dlurl: await dlurl.Promise })
}