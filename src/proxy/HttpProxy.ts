export const Fetch = (request: ProxiedFetch): Promise<ProxyResult> => {
    return new Promise(resolve => {
        let { method, url, params, body, headers, timeout, credentials } = request

        if (params) {
            let urlparams = new URLSearchParams()
            for (const [k, v] of Object.entries(params)) urlparams.append(k, v)
            url += "?" + urlparams.toString()
        }

        let xhr = new XMLHttpRequest()
        if (timeout !== 0) xhr.timeout = timeout || 0
        xhr.responseType = "arraybuffer"

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE)
                resolve({
                    "status_code": xhr.status,
                    "headers": xhr.getAllResponseHeaders(),
                    "body": xhr.response,
                })
        }

        xhr.open(method, url, true)
        if (headers) for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v)
            
        xhr.withCredentials = credentials || false
        xhr.send(body)
    })
}