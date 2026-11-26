import { FormatDuration } from "functions/Format"

export default function VideoPreviewCard({ video }: { video?: YoutubeVideoInfo }) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-bg2 border border-border w-full min-w-0">
            <div className="w-full flex items-center gap-2 primary-element p-0 relative rounded-xl overflow-hidden">
                <div className="w-full aspect-video rounded-lg overflow-hidden relative">
                    {
                        video?.snippet.thumbnails && <img 
                            src={video?.snippet.thumbnails.high.url} 
                            alt={video?.snippet.title || "Video thumbnail"} 
                            className="w-full h-full object-cover"
                        />
                    }
                </div>

                
                <div className="px-2 p-1 absolute bottom-1 right-1 text-xs bg-linear-135 from-primary/50 to-secondary/50 backdrop-blur-xs rounded-full">
                    {FormatDuration(video?.contentDetails.duration)}
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full min-w-0">
                <div className="flex flex-col items-center justify-between w-full min-w-0">
                    <p
                        className={
                            (!video?.snippet.title && "primary-element text-transparent")
                            + " rounded-t-lg font-medium w-full truncate"
                        }
                    >
                        {video?.snippet.title || "Loading..."}
                    </p>
                    
                    <p className={
                        "whitespace-pre wrap-break-word w-full text-xs rounded-b-lg line-clamp-2 "
                        + (video?.snippet.description ? "text-muted" : "primary-element text-transparent")
                    }>
                        {video?.snippet.description || "Description"}
                    </p>
                </div>
            </div>
        </div>
    )
}