import { PlayIcon } from "lucide-react"

export function About() {
    return (
        <div className="leading-4 h-full">
            <p className="font-medium">About</p>
            <p className="text-sm text-muted">Extension info & credits</p>

            <hr className="text-muted/20 my-3" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-linear-135 from-primary to-secondary flex items-center justify-center shrink-0">
                        <PlayIcon className="fill-white size-4" />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-semibold text-base leading-4.5">{chrome.runtime?.getManifest().name || "ProjectVex"}</p>
                        <p className="text-xs text-muted leading-4">{chrome.runtime?.getManifest().version_name || "0.0.0"} · Chrome Extension</p>
                    </div>
                </div>

                <hr className="text-muted/20" />

                <p className="text-xs text-muted/50 leading-4">
                    {chrome.runtime?.getManifest().name || "ProjectVex"} is a separated project. Not affiliated with Youtube or Google LLC
                </p>
            </div>
        </div>
    )
}