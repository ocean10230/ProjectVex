import { useState } from "preact/hooks"
import { ModalContext } from "hooks/utilities/Modal"
import PreferenceContext from "hooks/preferences/Youtube"
import axios from "axios"

export function ApiKeyPromptBody({ errorMessage }: { errorMessage?: string }) {
    const [keyInput, setKeyInput] = useState(() => PreferenceContext.getState().YoutubeApiKey)
    const [customMsg, setMsg] = useState("")
    const [validating, setValidating] = useState(false)

    const handleSave = async (e: Event) => {
        e.preventDefault()
        const trimmed = keyInput.trim()
        if (!trimmed || validating) return

        setValidating(true)
        setMsg("")

        const videoUrl = new URL("https://www.googleapis.com/youtube/v3/videos")
        videoUrl.searchParams.set("id", "MzGS6WbZNVg")
        videoUrl.searchParams.set("part", "snippet")
        videoUrl.searchParams.set("key", trimmed)

        try {
            const res = await axios.get(videoUrl.toString(), {
                validateStatus: () => true,
            })

            if (res.status === 200) {
                PreferenceContext.getState().SetYoutubeApiKey(trimmed)
                ModalContext.getState().SetDisplay(false)
            } else {
                const reason = res.data?.error?.message || "Validation failed, invalid API key"
                setMsg(reason.replace("API key not valid.", "Invalid API key"))
            }
        } catch {
            setMsg("Network error while verifying API key")
        } finally {
            setValidating(false)
        }
    }

    const activeError = customMsg || errorMessage?.replace("API key not valid.", "Invalid API key")

    return (
        <form id="vex-api-key-form" onSubmit={handleSave} className="flex flex-col gap-2 py-1">
            <p className="text-xs text-muted leading-3.5">
                Enter your YouTube Data API v3 key to load video metadata.
            </p>

            {activeError && (
                <p className="text-xs text-red-400 leading-3.5">{activeError}</p>
            )}

            <input
                type="password"
                autoFocus
                disabled={validating}
                value={keyInput}
                onInput={(e) => setKeyInput((e.target as HTMLInputElement).value)}
                placeholder="AIzaSy..."
                className="w-full p-1.5 px-2 bg-s2 border outline-none border-muted/50 focus:border-primary rounded-lg text-xs text-foreground disabled:opacity-50"
            />
        </form>
    )
}