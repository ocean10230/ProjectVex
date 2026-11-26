import { FFmpeg } from "@ffmpeg/ffmpeg"
import { GetPyodide } from "src/downloader/helper/Pyodide"
import { General } from 'src/Config'
import { GetAssets } from "src/downloader/utility/Assets"

let loaded = false
export let ffmpeg: FFmpeg | undefined

export const Config = {
    DisableUnlink: false
}

export const PatchWorker = () => {
    const NativeWorker = self.Worker

    function PatchedWorker(scriptURL: string, options = {}) {
        const opts = Object.assign({}, options, {type: 'classic'})
        return new NativeWorker(scriptURL, opts as any)
    }

    PatchedWorker.prototype = NativeWorker.prototype
    Object.setPrototypeOf(PatchedWorker, NativeWorker)
    self.Worker = PatchedWorker as any
}

const ReadBlob = (blob: Blob) => new Promise<Uint8Array>((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = () => {
        const { result } = fileReader

        if (result instanceof ArrayBuffer) resolve(new Uint8Array(result))
        else resolve(new Uint8Array())
    }

    fileReader.onerror = (event) => {
        reject(Error(`File could not be read! Code=${event?.target?.error?.code || -1}`))
    }

    fileReader.readAsArrayBuffer(blob)
})

const FetchFile = async (file: string | URL | File | Blob) => {
    let data: ArrayBuffer | Uint8Array | number[]

    if (typeof file === "string") {
        if (/data:_data\/([a-zA-Z]*)base64,([^"]*)/.test(file)) {
            data = atob(file.split(",")[1])
                .split("")
                .map((c) => c.charCodeAt(0))
        } else {
            data = await (await fetch(file)).arrayBuffer()
        }
    } else if (file instanceof URL) {
        data = await (await fetch(file)).arrayBuffer()
    } else if (file instanceof File || file instanceof Blob) {
        data = await ReadBlob(file)
    } else {
        return new Uint8Array()
    }

    return new Uint8Array(data)
}

const LoadFFMpeg = async () => {
    General.ShowLogs.FFMpeg && console.log("[ffmpeg] loading")
    ffmpeg = new FFmpeg()

    await ffmpeg.load({
        coreURL: GetAssets("/libs/ffmpeg/ffmpeg-core.js"),
        wasmURL: GetAssets("/libs/ffmpeg/ffmpeg-core.wasm")
    })

    loaded = true
    General.ShowLogs.FFMpeg && console.log("[ffmpeg] loaded")
    return Bridge
}

export async function Bridge(mode: "ffmpeg" | "ffprobe", args: any[], joint_out: boolean) {
    try {
        if (!loaded) await LoadFFMpeg()

        let temp_count = 0
        const movedFromPyodide = new Set<string>()
        const copiedToProbe = new Set<string>()

        const pyodide = await GetPyodide()
        if (!pyodide || !ffmpeg) return

        if (mode === "ffmpeg") {
            let is_input = false
            for (let [index, arg] of args.entries()) {
                if (arg === "-i") {
                    is_input = true
                    continue
                }
                if (is_input) {
                    let file = String(arg)
                    if (file.startsWith("file:")) file = file.slice(5)

                    if (file.includes("://")) {
                        const temp_name = `temp${temp_count}`
                        await ffmpeg.writeFile(temp_name, await FetchFile(file))
                        args[index] = temp_name
                        temp_count += 1
                    } else if (file.startsWith("/")) {
                        const basename = file.split("/").pop()!
                        args[index] = basename

                        if (!movedFromPyodide.has(file)) {
                            movedFromPyodide.add(file)
                            General.ShowLogs.FFMpeg && console.log(`moving file ${file} from pyodide to ffmpeg (${basename})`)
                            await ffmpeg.writeFile(basename, pyodide.FS.readFile(file))
                            
                            if (!(file.includes("m4a") || file.includes("webm")))
                                pyodide.FS.unlink(file)
                        }
                    }
                    is_input = false
                }
            }

            const lastIdx = args.length - 1
            if (lastIdx >= 0 && !String(args[lastIdx]).startsWith("-")) {

                let outArg = String(args[lastIdx])
                if (outArg.startsWith("file:")) outArg = outArg.slice(5)
                if (outArg.startsWith(General.OutputFolder + "/")) args[lastIdx] = outArg.split("/").pop()!
            }

            for (let i = 0; i < args.length; i++)
                if (args[i] === "-headers") {
                    args.splice(i, 2)
                    i--
                }
            
        } else if (mode === "ffprobe") {
            for (let i = 0; i < args.length; i++) {
                let candidate = String(args[i])
                const isNextArg = candidate === "-i" && i + 1 < args.length
                if (isNextArg) candidate = String(args[i + 1])
                else if (!candidate.startsWith(General.OutputFolder + "/") && !candidate.startsWith("file:")) continue
                
                const cleanPath = candidate.startsWith("file:") ? candidate.slice(5) : candidate
                if (cleanPath.startsWith(General.OutputFolder + "/")) {
                    const basename = cleanPath.split("/").pop()!
                    if (isNextArg) args[i + 1] = basename
                    else args[i] = basename

                    if (!copiedToProbe.has(cleanPath)) {
                        copiedToProbe.add(cleanPath)
                        General.ShowLogs.FFMpeg && console.log(`moving file ${cleanPath} from pyodide to ffprobe (${basename})`)
                        await ffmpeg.writeFile(basename, pyodide.FS.readFile(cleanPath))
                    }
                }
            }
        }

        General.ShowLogs.FFMpeg && console.log(`running ${mode} command`, args)

        let stdout = ""
        let stderr = ""

        const logcallback = ({ type, message }: { type: string; message: string }) => {
            switch (type) {
                case "stdout":
                    stdout += message
                    General.ShowLogs.FFMpeg && console.log("[ffmpeg]", message)
                    break
                case "stderr":
                    if (joint_out) 
                        stdout += message
                    else 
                        stderr += message
                    
                    General.ShowLogs.FFMpeg && console.log("[ffmpeg err]", message)
                    break
                default:
                    console.warn("unknown log type", type, message)
            }
        }
        ffmpeg.on("log", logcallback)

        const progresscallback = ({ progress, time }: { progress: number; time: number }) => (General.ShowLogs.FFMpeg) && console.log("[ffmpeg progress]", progress, time)
        
        ffmpeg.on("progress", progresscallback)

        let code: number

        if (mode === "ffmpeg") code = await ffmpeg.exec(args)
        else code = await ffmpeg.ffprobe(args)

        ffmpeg.off("log", logcallback)
        ffmpeg.off("progress", progresscallback)

        if (code !== 0) {
            General.ShowLogs.FFMpeg && console.log(`${mode} command failed with code ${code}`)
        } else if (mode === "ffmpeg") {
            const lastarg = String(args.at(-1) ?? "")
            if (lastarg && !lastarg.startsWith("-") && !lastarg.includes(":")) {
                const pyodideOut = `${General.OutputFolder}/${lastarg}`
                General.ShowLogs.FFMpeg && console.log(`moving file ${lastarg} from ffmpeg to pyodide (${pyodideOut})`)
                pyodide.FS.writeFile(pyodideOut, await ffmpeg.readFile(lastarg))
                await ffmpeg.deleteFile(lastarg)
            }
        }

        General.ShowLogs.FFMpeg && console.log("deleting ffmpeg files")
        
        for (const file of await ffmpeg.listDir("/")) {
            if (!file.isDir && file.name !== "." && file.name !== "..") {
                await ffmpeg.deleteFile("/" + file.name).catch(() => {})
            }
        }

        General.ShowLogs.FFMpeg && console.log("ffmpeg command finished")
        return [stdout, stderr, code]
    } catch (err) {
        const e = err as Error

        console.debug("[ffmpeg error]", e, e.toString())
        throw e
    }
}