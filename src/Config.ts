export const General = {
    OutputFolder: "/yt-dlp",

    ShowLogs: {
        FFMpeg: false,
        Messages: false,
        Frontend: false,
        
        "YT-DLP_Download": false
    }
}

export const Messages = {
    VideoDownloaded: "Downloaded",
    VideoURL: "TargetedVideoURL",

    PushVideoQuality: "AddResolution",
    PushAudioQuality: "AddAudio",

    RequestProxiedFetch: "Proxy",
    ProxyResult: "ProxyResult",
    DownloadVideo: "DownloadFormat",

    RuntimeInitialization: "PyodideInitialized",
    Sandbox: "Evaluate",
    SandboxResult: "EvaluationResult",

    Console: "PushDebugLogs",
    IframePosition: "ChangeIframePosition",

    ClosePopup: "ClosePopup",
    StopDownload: "TerminateDownloadWorker"
}

export const UIConfig = {
    Width: 560,
    Height: 460,
    Inset: 5
}

export const APIConfig = {
    API_KEY: "AIzaSyCp7wiyDh6BxA5z9-UQHFD9uPDt9ClsiXw",
    REQUEST_TIMEOUT_MS: 10000
}