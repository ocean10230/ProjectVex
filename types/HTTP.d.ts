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

declare interface OpenMessage {
    url: string
    fetchParams?: RequestInit
    buffer: SharedArrayBuffer
    close?: never
    getMore?: never
}

declare interface GetMoreMessage {
    getMore: number
    close?: never
}

declare interface CloseMessage {
    close: number
    getMore?: never
}

type WorkerRequestMessage = OpenMessage | GetMoreMessage | CloseMessage

declare interface ConnectionState {
    reader: ReadableStreamDefaultReader<Uint8Array> | null
    controller: AbortController
    int: Int32Array
    bytes: Uint8Array
    value: Uint8Array | undefined
    curOffset: number
    nextRead: Promise<ReadableStreamReadResult<Uint8Array>> | null
    done: boolean
}