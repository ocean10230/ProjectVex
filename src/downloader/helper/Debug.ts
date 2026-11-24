import { General, Messages } from "@/Config"

export class Debugger {
    Name: string = "General"
    MessagePort: MessagePort
    private last: string = ""
    private queue: string[] = []

    constructor(Name: string, LoggingPort?: MessagePort) {
        this.Name = Name
        this.MessagePort = LoggingPort || new MessageChannel().port1
    }

    SetLoggingPort(LoggingPort: MessagePort) {
        this.MessagePort = LoggingPort
        for (const text of this.queue) {
            this.MessagePort.postMessage({ type: Messages.Console, text })
        }
        this.queue = []
    }

    private format(args: any[]) {
        const body = args.map(arg => {
            if (arg instanceof Error) return `${arg.message}\n${arg.stack ?? ""}`
            if (typeof arg === "object" && arg !== null) {
                try { return JSON.stringify(arg) } catch { return String(arg) }
            }
            return String(arg)
        }).join(" ")

        return `[${this.Name}] ${body}`
    }

    private emit(level: "log" | "warn" | "error", args: any[]) {
        const stringArg = args.toString()

        if (stringArg === this.last) return
        this.last = stringArg

        if (General.ShowLogs["YT-DLP_Download"] && (stringArg.includes("[download]") && stringArg.includes("/s")))
            console[level](`[${this.Name}]`, ...args)

        const text = this.format(args)

        if (this.MessagePort) {
            this.MessagePort.postMessage({ type: Messages.Console, text })
        } else {
            this.queue.push(text)
        }
    }

    Log(...args: any[]) { this.emit("log", args) }
    Warn(...args: any[]) { this.emit("warn", args) }
    Error(...args: any[]) { this.emit("error", args) }
}