import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"

export interface DownloadItem {
    id: string
    title: string
    quality: string
    size: string
    timestamp: number
    thumbnail: string
}

interface HistoryStore {
    history: DownloadItem[]
    add: (item: DownloadItem) => void
    remove: (id: string) => void
    clear: () => void
}

const chromeLocalStorage: StateStorage = {
    getItem: async (name) => {
        const res = await chrome.storage.local.get(name)
        return (res[name] as string) ?? null
    },
    setItem: async (name, value) => {
        await chrome.storage.local.set({ [name]: value })
    },
    removeItem: async (name) => {
        await chrome.storage.local.remove(name)
    },
}

export const UseHistory = create<HistoryStore>()(
    persist(
        (set) => ({
            history: [],
            add: (item) => {
                const { id, title, quality, size, timestamp, thumbnail } = item
                set((state) => ({
                    history: [
                        { id, title, quality, size, timestamp, thumbnail },
                        ...state.history.slice(0, 19),
                    ],
                }))
            },
            remove: (id) =>
                set((state) => ({
                    history: state.history.filter((entry) => entry.id !== id),
                })),
            clear: () => set({ history: [] }),
        }),
        {
            name: "vex-history",
            storage: createJSONStorage(() => chromeLocalStorage),
        }
    )
)