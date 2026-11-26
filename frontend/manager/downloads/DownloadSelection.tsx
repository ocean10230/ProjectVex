import { create } from 'zustand'

interface StateManager {
    type: FileType
    change: (type: FileType) => void
}

export const DownloadManager = create<StateManager>()((set) => ({
    type: "video",
    change(type) { set({ type }) }
}))