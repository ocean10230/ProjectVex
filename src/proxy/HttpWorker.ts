import { General, Messages } from 'src/Config'
import { DynamicPromise } from "src/downloader/utility/Promise"

export let Response: null | ReturnType<typeof DynamicPromise<ProxyResult>> = DynamicPromise<ProxyResult>()
let streaming_worker: Worker

export const SpawnWorker = async () => {
    streaming_worker = new Worker("/scripts/http_stream.js")
    await new Promise(resolve => { streaming_worker.onmessage = resolve })
    return streaming_worker
}

export const ProxyFetch = async (request: ProxiedFetch, worker: MessagePort) => {
    if (General.ShowLogs.Proxies) console.log("Proxying", request.url)
    Response = DynamicPromise()
    worker.postMessage({ "type": Messages.RequestProxiedFetch, "request": request })
    if (General.ShowLogs.Proxies) console.log('Proxied', request.url)
    return await Response.Promise
}