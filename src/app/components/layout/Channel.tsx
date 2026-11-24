export default function Channel({
    channel
}: { channel?: Channel  }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-bg2 border border-border">
            <div className="flex items-center gap-2">
                <div className="overflow-hidden size-8 bg-linear-135 from-primary to-secondary rounded-full">
                    {
                        channel && <img src={channel?.snippet.thumbnails.high.url} referrerpolicy="no-referrer" />
                    }
                </div>

                <div className="flex flex-col">
                    <p className="text-sm font-medium leading-5 truncate">{channel?.snippet.customUrl}</p>
                    <p className="text-xs text-text/50 leading-3">
                        {
                            new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                compactDisplay: 'short',
                                maximumFractionDigits: 0
                            }).format(channel?.statistics.subscriberCount || 0)
                        } subscribers</p>
                </div>
            </div>

            <button onClick={() => window.open("https://youtube.com/" + channel?.snippet.customUrl)}>Subscribe</button>
        </div>
    )
}