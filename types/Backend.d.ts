declare type AudioQuality = {
    type: "audio"
    extension: "opus" | "m4a"
    bitrate: number
    size: number
    id: string
}

declare type VideoQuality = {
    type: "video"
    extension: "mp4"
    size: number
    id: string
    resolution: number
}

declare module "*.py"