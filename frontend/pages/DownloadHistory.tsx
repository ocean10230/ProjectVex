import { useState, useMemo } from 'react'
import { Clock, Trash2 } from 'lucide-react'
import { UseHistory } from 'hooks/downloads/DownloadHistory'
import Dropdown from 'components/ui/Dropdown'
import { TimeAgo } from 'frontend/functions/Format'

export function DownloadHistory() {
    const [sortOrder, setSortOrder] = useState("Newest")
    const { history, clear, remove } = UseHistory()

    const sortedHistory = useMemo(() => {
        const list = [...history]
        if (sortOrder === "Oldest") return list.sort((a, b) => a.title.localeCompare(b.title))
        if (sortOrder === "Newest") return list.sort((a, b) => b.title.localeCompare(a.title))
        return list
    }, [history, sortOrder])

    return (
        <div className="flex flex-col h-full bg-bg2 p-3 gap-3 overflow-hidden">
            {/* Header with Title and Sorting Dropdown */}
            <div className="flex items-center justify-between shrink-0">
                <p className="font-semibold text-sm text-foreground">Download History</p>
                <Dropdown
                    value={sortOrder}
                    options={["Oldest", "Newest"]}
                    onChange={(val: string) => setSortOrder(val)}
                />
            </div>

            {/* History List - Scrollable */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 min-h-0 pr-1">
                {sortedHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs gap-1">
                        <Clock className="size-8 stroke-1 text-muted/50" />
                        <p>No download history yet</p>
                    </div>
                ) : (
                    sortedHistory.map((item) => (
                        <div 
                            key={item.id} 
                            className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-s2 border border-border/50 text-xs text-foreground transition-all hover:border-border"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-30 h-auto aspect-video flex items-center justify-center overflow-hidden shrink-0 bg-linear-to-br from-primary to-secondary rounded-md">
                                
                                    <img className="w-30 h-auto" referrerpolicy="no-referrer" src={item.thumbnail} />
                                
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.title}</p>
                                    <p className="text-xs text-muted">{item.quality} • {item.size}</p>
                                    <p className="text-[11px] text-muted/70 mt-1">{TimeAgo(item.timestamp)}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => remove(item.id)}
                                className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-s1 transition-colors shrink-0 cursor-pointer"
                                title="Remove"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Clear All Action */}
            {history.length > 0 && (
                <div className="shrink-0 pt-2 border-t border-border flex justify-between items-center">
                    <span className="text-[11px] text-muted">{history.length} items total</span>

                    <button 
                        onClick={clear}
                    >
                        Clear History
                    </button>
                </div>
            )}
        </div>
    )
}