/// <reference lib="webworker" />

const SUCCESS_HEADER = -1
const SUCCESS_EOF = -2
const ERROR_TIMEOUT = -3
const ERROR_EXCEPTION = -4

const encoder = new TextEncoder()
const connections: Record<number, Connection> = {}
let nextConnectionID = 1

function writeError(intBuffer: Int32Array, byteBuffer: Uint8Array, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    const errorBytes = encoder.encode(message)
    const len = Math.min(errorBytes.length, byteBuffer.length)
    byteBuffer.set(errorBytes.subarray(0, len))
    Atomics.store(intBuffer, 1, len)
    Atomics.store(intBuffer, 0, ERROR_EXCEPTION)
    Atomics.notify(intBuffer, 0)
}

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>): Promise<void> => {
    const data = event.data

    if ("close" in data && data.close !== undefined) {
        const conn = connections[data.close]

        if (conn) {
            delete connections[data.close]
            conn.reader.cancel().catch(() => {})
        }

        return
    }

    if ("getMore" in data && data.getMore !== undefined) {
        const conn = connections[data.getMore]
        if (!conn) return

        const { reader, intBuffer, byteBuffer } = conn
        const maxBytes = byteBuffer.length
        let totalWritten = 0

        try {
            // Pack byteBuffer as full as possible before waking Pyodide
            while (totalWritten < maxBytes) {
                if (!conn.value || conn.curOffset >= conn.value.length) {
                    const readResponse = conn.nextRead
                        ? await conn.nextRead
                        : await reader.read()
                    conn.nextRead = null

                    if (readResponse.done) {
                        if (totalWritten > 0) {
                            conn.done = true
                            break
                        }
                        delete connections[data.getMore]
                        Atomics.store(intBuffer, 0, SUCCESS_EOF)
                        Atomics.notify(intBuffer, 0)
                        return
                    }

                    conn.value = readResponse.value
                    conn.curOffset = 0
                    conn.nextRead = reader.read()
                }

                const available = conn.value.length - conn.curOffset
                const spaceLeft = maxBytes - totalWritten
                const toCopy = Math.min(available, spaceLeft)

                byteBuffer.set(
                    conn.value.subarray(conn.curOffset, conn.curOffset + toCopy),
                    totalWritten
                )

                conn.curOffset += toCopy
                totalWritten += toCopy

                // If we already have substantial data (>= 256 KB) and would block on network, flush immediately
                if (conn.curOffset >= conn.value.length && totalWritten >= 262144) {
                    break
                }
            }

            if (conn.done && totalWritten === 0) {
                delete connections[data.getMore]
                Atomics.store(intBuffer, 0, SUCCESS_EOF)
                Atomics.notify(intBuffer, 0)
                return
            }

            Atomics.store(intBuffer, 0, totalWritten)
            Atomics.notify(intBuffer, 0)
        } catch (error) {
            console.log("Request exception:", error)
            delete connections[data.getMore]
            writeError(intBuffer, byteBuffer, error)
        }
        return
    }

    const connectionID = nextConnectionID++
    const intBuffer = new Int32Array(data.buffer)
    const byteBuffer = new Uint8Array(data.buffer, 8)

    try {
        const response = await fetch(data.url, data.fetchParams)
        const headers: [string, string][] = []
        for (const pair of response.headers.entries()) {
            headers.push([pair[0], pair[1]])
        }

        const headerText = JSON.stringify({
            headers,
            status: response.status,
            connectionID
        })
        const headerBytes = encoder.encode(headerText)
        byteBuffer.set(headerBytes)
        Atomics.store(intBuffer, 1, headerBytes.length)

        if (!response.body) {
            throw new Error("Response body is null")
        }

        const reader = response.body.getReader()

        // Start reading the very first body chunk immediately while Pyodide parses headers
        connections[connectionID] = {
            reader,
            intBuffer,
            byteBuffer,
            value: undefined,
            curOffset: 0,
            nextRead: reader.read(),
            done: false
        }

        Atomics.store(intBuffer, 0, SUCCESS_HEADER)
        Atomics.notify(intBuffer, 0)
    } catch (error) {
        console.log("Request exception:", error)
        writeError(intBuffer, byteBuffer, error)
    }
})

postMessage("ready")