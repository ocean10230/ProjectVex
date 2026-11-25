import { useEffect, useState } from "preact/hooks"
import axios from "axios"

import { General, APIConfig } from "@/Config"

import { ApiKeyPromptBody } from "components/ui/pages/APIKeyPrompt"

import { VideoData } from "hooks/utilities/VideoData"
import { ModalContext } from "hooks/utilities/Modal"
import PreferenceContext from "hooks/preferences/Youtube"

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

async function fetchFirstItem<T>(url: string, signal: AbortSignal, emptyMessage: string) {
    const response = await axios.get(url, { signal })
    const body = response.data as YouTubeListResponse<T>

    if (response.status !== 200) {
        throw new Error(body.error?.message || `YouTube API request failed (HTTP ${response.status})`)
    }

    const item = body.items?.[0]
    if (!item) throw new Error(body.error?.message || emptyMessage)

    return item
}

export function openApiKeyModal(errorMessage?: string) {
    const modal = ModalContext.getState()
    modal.SetContent({
        Title: "YouTube API Key",
        Content: <ApiKeyPromptBody errorMessage={errorMessage} />,
        Actions: [
            <button
                key="save-api-key"
                type="submit"
                form="vex-api-key-form"
                className="accent text-xs"
            >
                Save
            </button>,
        ],
    })
    modal.SetDisplay(true, false)
}

export default function FetchVideoInfo() {
    const apiKey = PreferenceContext(state => state.YoutubeApiKey)
    const [hydrated, setHydrated] = useState(() => PreferenceContext.persist.hasHydrated())

    const url = VideoData(state => state.url)
    const setVideoData = VideoData(state => state.setVideoData)
    const clearVideoData = VideoData(state => state.clearVideoData)
    const setChannel = VideoData(state => state.setChannel)
    const clearChannel = VideoData(state => state.clearChannel)
    const setStatus = VideoData(state => state.setVideoInfoStatus)

    useEffect(() => {
        if (PreferenceContext.persist.hasHydrated()) {
            setHydrated(true)
            return
        }

        const unsub = PreferenceContext.persist.onFinishHydration(() => setHydrated(true))

        PreferenceContext.persist.rehydrate()
        return unsub
    }, [])

    useEffect(() => {
        if (!hydrated) return

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

        const trimmedKey = apiKey.trim()
        if (!trimmedKey) {
            setStatus("error", "Missing YouTube Data API v3 key.")
            openApiKeyModal()
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
        videosUrl.searchParams.set("key", trimmedKey)

        void (async () => {
            try {
                const video = await fetchFirstItem<YoutubeVideoInfo>(
                    videosUrl.toString(),
                    controller.signal,
                    "YouTube returned no video for this URL."
                )

                if (!video.snippet?.channelId) {
                    throw new Error("YouTube returned video data without a channel ID.")
                }

                const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels")
                channelUrl.searchParams.set("part", "snippet,statistics")
                channelUrl.searchParams.set("id", video.snippet.channelId)
                channelUrl.searchParams.set("key", trimmedKey)

                const channel = await fetchFirstItem<Channel>(
                    channelUrl.toString(),
                    controller.signal,
                    "YouTube returned no channel for this video."
                )
                if (!active) return

                setVideoData(video)
                setChannel(channel)
                setStatus("success")

                if (General.ShowLogs.Frontend) console.info("[video-info] metadata loaded", videoId)
            } catch (error) {
                if (!active) return

                if (axios.isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 403)) {
                    const apiReason = (error.response.data as YouTubeListResponse<unknown>)?.error?.message
                        || "Invalid or restricted YouTube API key."
                    setStatus("error", apiReason)
                    openApiKeyModal(apiReason)
                    return
                }

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
    }, [url, apiKey, hydrated, clearChannel, clearVideoData, setChannel, setStatus, setVideoData])
}