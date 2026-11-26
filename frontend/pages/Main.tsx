import { Video, AudioLines, Download, XCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FormatBytes } from 'functions/Format'

import QualitySelectorItem from 'components/ui/pages/QualitySelectorItem'
import Channel from 'components/layout/youtube/Channel'
import VideoPreviewCard from 'components/layout/youtube/VideoPreviewCard'

import { VideoData } from 'hooks/utilities/VideoData'
import Preferences from 'hooks/preferences/Youtube'

import { General } from 'src/Config'
import FetchVideoInfo from 'functions/FetchVideoInfo'

const types = [
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-primary to-secondary text-accent-text",
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-bg2 to-bg2"
]

const MOCK_QUALITIES: Array<VideoQuality | AudioQuality> = [
    { type: "video", resolution: 1080, extension: "mp4", size: 42 * 1024 * 1024, id: "137" },
    { type: "video", resolution: 720, extension: "mp4", size: 24 * 1024 * 1024, id: "136" },
    { type: "video", resolution: 480, extension: "mp4", size: 12 * 1024 * 1024, id: "135" },
    { type: "video", resolution: 360, extension: "mp4", size: 6 * 1024 * 1024, id: "18" },
    { type: "audio", bitrate: 128, extension: "m4a", size: 4 * 1024 * 1024, id: "140" },
    { type: "audio", bitrate: 64, extension: "opus", size: 2 * 1024 * 1024, id: "250" },
]

interface FileTypeTabsProps {
    type: FileType
    onChange: (type: FileType) => void
}

export function FileTypeTabs({ type, onChange }: FileTypeTabsProps) {
    return (
        <div className="flex items-center p-0.5 rounded-lg bg-linear-135 from-s1 to-s2 focus-within:from-primary transition-colors duration-250 focus-within:to-secondary shrink-0 w-full">
            <button 
                className={(type === "video" ? types[0] : types[1]) + " rounded-l-md transition-colors duration-200 cursor-pointer"}
                onClick={() => onChange('video')}
            >
                <Video className="size-4 shrink-0" />
                <span className="truncate">Video</span>
            </button>

            <button 
                className={(type === "audio" ? types[0] : types[1]) + " rounded-r-md transition-colors duration-200 cursor-pointer"}
                onClick={() => onChange('audio')}
            >
                <AudioLines className="size-4 shrink-0" />
                <span className="truncate">Audio</span>
            </button>
        </div>
    )
}

export function DownloadSidebar({ type, setType }: { type: FileType; setType: (t: FileType) => void }) {
    const qualities = VideoData((state) => state.Qualities)
    const defaultQuality = Preferences((state) => state.DefaultQuality)
    const data = VideoData()
    
    const [selectedVideoId, setSelectedVideoId] = useState<string>("")
    const [selectedAudioId, setSelectedAudioId] = useState<string>("")

    const videoQualities = qualities
        .filter((q): q is VideoQuality => q.type === "video" && q.resolution <= 1080 && q.size <= Math.pow(2, 32))
        .sort((a, b) => b.resolution - a.resolution)

    const audioQualities = qualities
        .filter((q): q is AudioQuality => q.type === "audio" && q.size <= Math.pow(2, 32))
        .sort((a, b) => b.bitrate - a.bitrate)

    useEffect(() => {
        if (videoQualities.length > 0 && !videoQualities.some(q => q.id === selectedVideoId)) {
            const pick = defaultQuality === "Lightest" ? videoQualities[videoQualities.length - 1] : videoQualities[0]
            setSelectedVideoId(pick.id)
        }
        if (audioQualities.length > 0 && !audioQualities.some(q => q.id === selectedAudioId)) {
            const pick = defaultQuality === "Lightest" ? audioQualities[audioQualities.length - 1] : audioQualities[0]
            setSelectedAudioId(pick.id)
        }
    }, [qualities, defaultQuality])

    const currentQualities = type === "video" ? videoQualities : audioQualities
    const currentSelection = type === "video" ? selectedVideoId : selectedAudioId
    const handleSelect = type === "video" ? setSelectedVideoId : setSelectedAudioId

    const navigate = useNavigate()

    useEffect(() => {
        if (!currentSelection) return

        const format = type === "video"
            ? `${currentSelection}+ba[acodec^=mp4a]/${currentSelection}+ba[ext=m4a]/${currentSelection}+ba/${currentSelection}`
            : `worstvideo[ext=mp4]+${currentSelection}`

        data.setDownloadedQualityID(format)
        data.setSelectionId(currentSelection)
    }, [type, currentSelection])

    return (
        <div className="flex flex-col w-40/100 shrink-0 bg-bg2 h-full border-r border-border overflow-hidden">
            <div className="p-2 flex flex-col h-full min-h-0">
                <FileTypeTabs type={type} onChange={setType} />

                <div className="flex flex-col gap-1 mt-2 overflow-y-auto pr-1 flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        {currentQualities.length < 1 ? (
                            <>
                                <QualitySelectorItem onSelect={() => {}} isSkeleton={true} detail='' selected={false} resolution='' />
                                <QualitySelectorItem onSelect={() => {}} isSkeleton={true} detail='' selected={false} resolution='' />
                                <QualitySelectorItem onSelect={() => {}} isSkeleton={true} detail='' selected={false} resolution='' />
                                <QualitySelectorItem onSelect={() => {}} isSkeleton={true} detail='' selected={false} resolution='' />
                            </>
                        ) : (
                            currentQualities.map((item) => {
                                const label = item.type === "video" ? item.resolution + "p" : `${Math.round(item.bitrate)} kbps`
                                const bytes = FormatBytes(item.size)

                                if (bytes === "N/A") return null
                                const detail = `${item.extension.toUpperCase()} • ${bytes}`

                                return (
                                    <QualitySelectorItem
                                        key={item.id}
                                        resolution={label}
                                        detail={detail}
                                        selected={currentSelection === item.id}
                                        onSelect={() => handleSelect(item.id)}
                                    />
                                )
                            })
                        )}
                    </AnimatePresence>
                </div>

                <button 
                    onClick={() => navigate("/download")} 
                    disabled={!currentSelection}
                    className="w-full mt-3 accent shrink-0"
                >
                    <Download className="size-4 shrink-0" />
                    <span>Download</span>
                </button>
            </div>
        </div>
    )
}

export function RightPanel() {
    const { video, channel } = VideoData()

    return (
        <div className="flex flex-col justify-between flex-1 min-w-0 overflow-hidden h-full">
            <div className="px-2 pt-2 flex flex-col gap-2 min-h-0 overflow-y-auto pr-1 w-full flex-1">
                <VideoPreviewCard video={video} />
                <Channel channel={channel} />
            </div>
        </div>
    )
}

export function Main() {
    const { DefaultFormat, StaticPlaceholders } = Preferences()
    const { url, channel, videoInfoStatus, videoInfoError } = VideoData()
    const [type, setType] = useState<FileType>(DefaultFormat)

    if (!channel)
        FetchVideoInfo()

    
    useEffect(() => setType(DefaultFormat), [DefaultFormat])

    useEffect(() => {
        if (import.meta.env.MODE === "development") {
            VideoData.setState((prev) => ({
                ...prev,
                pyodide_loaded: true,
                Qualities: prev.Qualities.length > 0 ? prev.Qualities : MOCK_QUALITIES,
            }))
        }
    }, [])

    const isLoading = !url || videoInfoStatus === "idle" || videoInfoStatus === "loading"

    if (isLoading && !StaticPlaceholders) {
        return (
            <div className="flex items-center justify-center flex-col gap-1 w-full h-full">
                <div className="flex gap-2 items-center bg-linear-135 from-primary to-secondary text-transparent text-2xl font-semibold bg-clip-text">
                    <Loader2 className="size-8 animate-spin duration-500 text-primary" />
                    <p className="flex items-center gap-2">Loading content</p>
                </div>

                <p className="text-muted w-1/2 text-center leading-4">This should really take long unless something wrong happens</p>
            </div>
        )
    }

    if (videoInfoStatus === "error") 
        return <div className="flex items-center justify-center flex-col gap-1 w-full h-full">
            <p className="flex items-center gap-2 text-red-500 text-2xl font-semibold"><XCircle /> Video fetch error</p>
            <p className="w-1/2 text-center text-text/85">{videoInfoError || "Could not load information for this video."}</p>
        </div>
    

    return (
        <div className="flex flex-1 overflow-hidden w-full h-screen">
            <DownloadSidebar type={type} setType={setType} />
            <RightPanel />
        </div>
    )
}