type RouteItem = [LucideIcon, string, string]

interface RouteCategory {
  title: string
  page: RouteItem[]
}

declare interface QualityItemProps {
    resolution: number | string
    detail: string
    selected: boolean
    onSelect: () => void
}

declare type DefaultFormatType = "video" | "audio";
declare type DefaultQualityType = "Best" | "Lightest";

declare interface SettingsState {
    YoutubeApiKey: string;
    AutoDownload: boolean;
    Confirmation: boolean;
    CloseOnCompletion: boolean;
    StaticPlaceholders: boolean;

    DefaultFormat: DefaultFormatType;
    DefaultQuality: DefaultQualityType;
    FileNameTemplate: string;
    SaveHistory: boolean;

    SetYoutubeApiKey: (YoutubeApiKey: string) => void;
    SetAutoDownload: (AutoDownload: boolean) => void;
    SetConfirmation: (Confirmation: boolean) => void;
    SetCloseOnCompletion: (CloseOnCompletion: boolean) => void;
    SetStaticPlaceholders: (StaticPlaceholders: boolean) => void;
    SetDefaultFormat: (DefaultFormat: DefaultFormatType) => void;
    SetDefaultQuality: (DefaultQuality: DefaultQualityType) => void;
    SetFileNameTemplate: (FileNameTemplate: string) => void;
    SetSaveHistory: (SaveHistory: boolean) => void;
    ResetSettings: () => void;
}

declare type VideoInfoStatus = "idle" | "loading" | "success" | "error"

declare interface VideoStateManager {
    video?: YoutubeVideoInfo
    channel?: Channel
    Qualities: Array<AudioQuality | VideoQuality>
    videoInfoStatus: VideoInfoStatus
    videoInfoError?: string

    setVideoData: (data: YoutubeVideoInfo) => void
    clearVideoData: () => void

    setChannel: (data: Channel) => void
    clearChannel: () => void

    setQualities: (qualities: Array<AudioQuality | VideoQuality>) => void
    clearQualities: () => void

    setVideoInfoStatus: (status: VideoInfoStatus, error?: string) => void
    setDownloadedQualityID: (selected_media: string) => void
    setSelectionId: (id: string) => void


    pyodide_loaded?: boolean
    selected_media: string
    selection_id: string
}
