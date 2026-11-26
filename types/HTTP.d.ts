declare interface ProxiedFetch {
    method: string,
    url: string,
    params: string,
    body?: string,
    headers?: string,
    timeout?: number,
    credentials?: boolean
}

declare interface ProxyResult {
    status_code: number
    headers: string
    body: any
}

interface Connection {
    reader: ReadableStreamDefaultReader<Uint8Array>
    intBuffer: Int32Array
    byteBuffer: Uint8Array
    value: Uint8Array | undefined
    curOffset: number
    nextRead: Promise<ReadableStreamReadResult<Uint8Array>> | null
    done: boolean
}

interface CloseMessage {
    close: number
}

interface GetMoreMessage {
    getMore: number
}

interface FetchMessage {
    close?: undefined
    getMore?: undefined
    buffer: SharedArrayBuffer
    url: string
    fetchParams?: RequestInit
}

type WorkerMessage = CloseMessage | GetMoreMessage | FetchMessage