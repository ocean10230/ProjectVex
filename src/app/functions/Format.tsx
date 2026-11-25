export const FormatBytes = (bytes: number): string => {
    if (!bytes) return "N/A"
    
    const mb = bytes / (1024 * 1024)
    if (mb < 1024) return `${Math.round(mb)}MB`
    
    const gb = mb / 1024
    return `${gb.toFixed(1)}GB`
}

export function FormatDuration(iso?: string): string {
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