import { useEffect } from "preact/hooks"
import { Check } from "lucide-react"

import { VideoData } from "hooks/utilities/VideoData"
import Notify from "components/Notify"

export default function DownloadHandlers () {
    const Data = VideoData()

    useEffect(() => {
        const noUrl = import.meta.env.MODE === "development"
        console.log(noUrl)
        if (noUrl) Data.setURL("https://www.youtube.com/watch?v=2c12kPi-v10")
    }, [])

    useEffect(() => {
        if (Data.pyodide_loaded) Notify("Loaded Python runtime", Check)
    }, [Data.pyodide_loaded])
}