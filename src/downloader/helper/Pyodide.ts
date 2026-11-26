import { loadPyodide, type PyodideInterface } from "pyodide"
import { Debugger } from "src/downloader/helper/Debug"

var cached: null | PyodideInterface = null

export async function GetPyodide() {
    if (cached) return cached
    const base = new URL("/", self.location.href).toString()

    const pyodide = await loadPyodide({
        indexURL: base + "/libs/pyodide/",
        stdLibURL: base + "/libs/pyodide/python_stdlib.zip",
        lockFileURL: base + "/libs/pyodide/pyodide-lock.json",
        fullStdLib: false
    })

    cached = pyodide
    return pyodide
}

let stdout_buf: number[] = []
let stderr_buf: number[] = []

const decoder = new TextDecoder('utf-8')
const delimiters = [0x0a, 0x0d]

export const StandardHandler = (Debug: Debugger, byte: number, mode: "stderr" | "stdout") => {
    if (delimiters.includes(byte)) {
        const chunk = new Uint8Array(mode === "stdout" ? stdout_buf : stderr_buf)
        const text = decoder.decode(chunk)

        if (mode === "stdout") stdout_buf = []
        else stderr_buf = []

        Debug.Log("Pyodide:", text)
    } else
        if (mode === "stdout") stdout_buf.push(byte)
        else stderr_buf.push(byte)
}