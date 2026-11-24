import { General, Messages } from '@/Config'
import { DynamicPromise } from "@/downloader/utility/Promise"

export let response: null | ReturnType<typeof DynamicPromise<ProxyResult>> = DynamicPromise<ProxyResult>()
let streaming_worker: Worker

export const spawn_worker = async () => {
    streaming_worker = new Worker("/libs/pyodide_http_fork/pyodide_http/http_strea.js")
    await new Promise(resolve => { streaming_worker.onmessage = resolve })
    return streaming_worker
}

export const ProxyFetch = async (request: ProxiedFetch, worker: MessagePort) => {
    if (General.ShowLogs['YT-DLP_Download'])
        console.log("Proxying", request.url)
    
    response = DynamicPromise()
    worker.postMessage({ "type": Messages.RequestProxiedFetch, "request": request })
    const ret = await response.Promise
    response = null
    return ret
}