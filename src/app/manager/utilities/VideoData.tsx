import { create } from 'zustand'

export type VideoInfoStatus = "idle" | "loading" | "success" | "error"

export interface StateManager {
    url?: string
    setURL: (data: string) => void
    clearURL: () => void

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

export const VideoData = create<StateManager>()((set) => ({
    selection_id: "",
    setSelectionId: (id) => set(prev => ({ ...prev, selection_id: id })),

    Qualities: [],
    videoInfoStatus: "idle",
    selected_media: "bv*[vcodec^=avc1]+ba[acodec^=m4a]/bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",

    setVideoData: (data: YoutubeVideoInfo) => set({ video: data }),
    clearVideoData: () => set({ video: undefined }),

    setChannel: (data: Channel) => set({ channel: data }),
    clearChannel: () => set({ channel: undefined }),

    setQualities: (qualities) => set({ Qualities: qualities }),
    clearQualities: () => set({ Qualities: [] }),

    setVideoInfoStatus: (status, error) => set({
        videoInfoStatus: status,
        videoInfoError: error
    }),

    setDownloadedQualityID: (selected_media) => set(prev => ({ ...prev, selected_media })),

    url: undefined,
    setURL: (data: string) => set({ url: data }),
    clearURL: () => set({ url: undefined }),
}))