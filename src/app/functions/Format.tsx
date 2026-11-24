export const FormatBytes = (bytes: number): string => {
    if (!bytes) return "N/A"
    
    const mb = bytes / (1024 * 1024)
    if (mb < 1024) return `${Math.round(mb)}MB`
    
    const gb = mb / 1024
    return `${gb.toFixed(1)}GB`
}
