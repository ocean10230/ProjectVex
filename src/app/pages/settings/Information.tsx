import { PlayIcon } from "lucide-react"

export function About() {
    return (
        <div className="leading-4 h-full">
            <p className="font-medium">About</p>
            <p className="text-sm text-muted">Extension info & credits</p>

            <hr className="text-muted/20 my-3" />

            <div className="flex flex-col gap-4">
                {/* identity */}
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-linear-135 from-primary to-secondary flex items-center justify-center shrink-0">
                        <PlayIcon className="fill-white size-4" />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-base leading-4.5">ProjectVex</p>
                        <p className="text-xs text-muted leading-4">v0.0.0 · Chrome Extension</p>
                    </div>
                </div>
                <hr className="text-muted/20" />

                {/* links */}
                <div className="flex flex-col gap-2 text-sm">
                    <p className="text-muted font-medium tracking-wide">
                        Dependencies
                    </p>
                    
                    <div className="flex flex-col gap-1 h-30 overflow-y-auto pr-2">
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">@ffmpeg/core@^0.12.10</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">@ffmpeg/ffmpeg@^0.12.15</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">@ffmpeg/util@^0.12.2</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">@tailwindcss/vite@^4.3.3</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">@types/chrome@^0.3.6</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">framer-motion@^14.9.0</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">lucide-react@^1.66.0</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">preact@^10.29.8</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">pyodide@^0.27.7</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">react-router-dom@^7.18.5</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">tailwindcss@^4.3.3</div>
                        <div className="text-sm bg-s1 p-2 px-3 rounded-lg border border-border">zustand@^5.0.16</div>
                    </div>
                </div>

                <hr className="text-muted/20" />

                {/* legal */}
                <p className="text-xs text-muted/50 leading-4">
                    Grabify is a separated project. Not affiliated with Youtube or Google LLC
                </p>
            </div>
        </div>
    )
}