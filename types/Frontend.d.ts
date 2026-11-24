type RouteItem = [LucideIcon, string, string]

interface RouteCategory {
  title: string
  page: RouteItem[]
}

declare interface QualityItemProps {
    resolution: number | string
    detail: string
    selected: boolean
    onSelect: () => void
}