export const FormatBytes = (bytes: number): string => {
    if (!bytes) return "N/A"
    
    const mb = bytes / (1024 * 1024)
    if (mb < 1024) return `${Math.round(mb)}MB`
    
    const gb = mb / 1024
    return `${gb.toFixed(1)}GB`
}

export const FormatDuration = (iso?: string): string => {
    if (!iso) return "0:00"

    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"

    const hours = Number(match[1] || 0)
    const minutes = Number(match[2] || 0)
    const seconds = Number(match[3] || 0)

    const pad = (n: number) => String(n).padStart(2, "0")

    return hours > 0
        ? `${hours}:${pad(minutes)}:${pad(seconds)}`
        : `${minutes}:${pad(seconds)}`
}

export const TimeAgo = (timestamp: number | string): string => {
    const ms = typeof timestamp === "number" ? timestamp : Date.parse(timestamp)
    if (isNaN(ms)) return String(timestamp)

    const diff = Math.max(0, Math.floor((Date.now() - ms) / 1000))
    if (diff < 60) return "Just now"

    const mins = Math.floor(diff / 60)
    if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`

    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`

    return new Date(ms).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}
