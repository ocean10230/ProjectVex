import axios from "axios"
import PreferenceContext from "hooks/preferences/Youtube"
import { openApiKeyModal } from "functions/FetchVideoInfo"

export default async function ValidateApiKey(customKey?: string): Promise<boolean> {
    const apiKey = (customKey ?? PreferenceContext.getState().YoutubeApiKey).trim()
    if (!apiKey) return false

    const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
    videoUrl.searchParams.set("id", "MzGS6WbZNVg")
    videoUrl.searchParams.set("part", "snippet")
    videoUrl.searchParams.set("key", apiKey)

    try {
        const res = await axios.get(videoUrl.toString(), {
            validateStatus: () => true,
        })

        if (res.status !== 200) {
            const reason = res.data?.error?.message || "Invalid API Key"
            openApiKeyModal(reason)
            return false
        }

        return true
    } catch {
        openApiKeyModal("Could not reach YouTube API to verify key")
        return false
    }
}