export function VideoPreviewCard({ video }: { video?: YoutubeVideoInfo }) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-bg2 border border-border w-full min-w-0">
            <div className="w-full flex items-center gap-2 bg-linear-135 from-primary to-secondary p-0 relative rounded-xl overflow-hidden">
                <div className="w-full aspect-video rounded-lg overflow-hidden relative">
                    {
                        video?.snippet.thumbnails &&
                        <img 
                            src={video?.snippet.thumbnails.high.url} 
                            alt={video?.snippet.title || "Video thumbnail"} 
                            className="w-full h-full object-cover"
                        />
                    }
                </div>

                
                <div className="px-2 p-1 absolute bottom-1 right-1 text-xs bg-s1/50 backdrop-blur-xs rounded-full">
                    {video?.contentDetails.duration.replaceAll(/PT|S/g, "").replaceAll(/M|H/g, ":") || "0:00"}
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full min-w-0">
                <div className="flex flex-col items-center justify-between w-full min-w-0">
                    <p
                        className={
                            (!video?.snippet.title && "bg-linear-135 from-primary to-secondary text-transparent") + " rounded-t-lg font-medium truncate w-full"
                        }
                    >
                        {video?.snippet.title || "Loading..."}
                    </p>
                    <p className={
                        "w-full text-xs line-clamp-2 rounded-b-lg  "
                        + (video?.snippet.description ? "text-muted" : "bg-linear-135 from-primary to-secondary text-transparent")
                    }>
                        {video?.snippet.description || "Description"}
                    </p>
                </div>
            </div>
        </div>
    )
}