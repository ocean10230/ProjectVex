import { useEffect } from "preact/hooks"
import { VideoData, YoutubeURL } from "hooks/utilities/VideoData"
import { General, APIConfig } from '@/Config'

interface YouTubeListResponse<T> {
    items?: T[]
    error?: { message?: string }
}

function getVideoId(value: string) {
    try {
        const parsed = new URL(value)
        const host = parsed.hostname.toLowerCase()
        const isYouTube = host === "youtu.be"
            || host === "youtube.com" 
            || host.endsWith(".youtube.com")

        if (!isYouTube) return

        const id = host === "youtu.be"
            ? parsed.pathname.split("/").filter(Boolean)[0]
            : parsed.searchParams.get("v")
            ?? parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?]+)/)?.[1]

        return id && /^[\w-]{11}$/.test(id) ? id : undefined
    } catch {
        return
    }
}

async function fetchFirstItem<T>(url: URL, signal: AbortSignal, emptyMessage: string) {
    const response = await fetch(url, { signal })
    const body = await response.json() as YouTubeListResponse<T>

    if (!response.ok) throw new Error(body.error?.message || `YouTube API request failed (HTTP ${response.status})`)

    const item = body.items?.[0]
    if (!item) throw new Error(body.error?.message || emptyMessage)
    

    return item
}

export default function useFetchVideoInfo() {
    const url = YoutubeURL(state => state.url)
    const setVideoData = VideoData(state => state.setVideoData)
    const clearVideoData = VideoData(state => state.clearVideoData)
    const setChannel = VideoData(state => state.setChannel)
    const clearChannel = VideoData(state => state.clearChannel)
    const setStatus = VideoData(state => state.setVideoInfoStatus)

    useEffect(() => {
        clearVideoData()
        clearChannel()

        if (!url) {
            setStatus("idle")
            if (General.ShowLogs.Frontend)
                console.info("[video-info] waiting for a video URL")
            return
        }

        const videoId = getVideoId(url)
        if (!videoId) {
            setStatus("error", "The current URL is not a valid YouTube video URL.")
            if (General.ShowLogs.Frontend)
                console.error("[video-info] invalid YouTube video URL")
            return
        }

        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), APIConfig.REQUEST_TIMEOUT_MS)
        let active = true

        setStatus("loading")

        if (General.ShowLogs.Frontend)
            console.info("[video-info] fetching metadata", videoId)

        const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
        videosUrl.searchParams.set("id", videoId)
        videosUrl.searchParams.set("part", "snippet,contentDetails")
        videosUrl.searchParams.set("key", APIConfig.API_KEY)

        void (async () => {
            try {
                const video = await fetchFirstItem<YoutubeVideoInfo>(
                    videosUrl, controller.signal,
                    "YouTube returned no video for this URL."
                )

                if (!video.snippet?.channelId) {
                    throw new Error("YouTube returned video data without a channel ID.")
                }

                const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
                channelUrl.searchParams.set("part", "snippet,statistics")
                channelUrl.searchParams.set("id", video.snippet.channelId)
                channelUrl.searchParams.set("key", APIConfig.API_KEY)

                const channel = await fetchFirstItem<Channel>(
                    channelUrl,
                    controller.signal,
                    "YouTube returned no channel for this video."
                )
                if (!active) return

                setVideoData(video)
                setChannel(channel)
                setStatus("success")

                if (General.ShowLogs.Frontend)
                    console.info("[video-info] metadata loaded", videoId)
            } catch (error) {
                if (!active) return
                const message = error instanceof Error && error.name === "AbortError"
                    ? `YouTube API request timed out after ${APIConfig.REQUEST_TIMEOUT_MS / 1000} seconds.`
                    : error instanceof Error
                        ? error.message
                        : "An unknown error occurred while fetching video information."
                setStatus("error", message)
                
                console.error("[video-info] metadata request failed", message)
            } finally {
                window.clearTimeout(timeout)
            }
        })()

        return () => {
            active = false
            window.clearTimeout(timeout)
            controller.abort()
        }
    }, [url, clearChannel, clearVideoData, setChannel, setStatus, setVideoData])
}