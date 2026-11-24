import { create } from "zustand"

export interface StateManager {
    logs: Array<{ text: string, time: number }>
    Add: (text: string) => void
    Clear: () => void

    Processing: string
    Progress: number
    Status: number
    Speed: string
    Size: string

    SetProgress: (data: Partial<Pick<StateManager, "Size" | "Processing" | "Progress" | "Status" | "Speed">>) => void
    ResetProgress: () => void
}

export const DebugContext = create<StateManager>()((set) => ({
    logs: [],
    Add: (log) => set((state) => ({ logs: [...state.logs.slice(-199), { text: log, time: Date.now() }] })),
    Clear: () => set({ logs: [] }),

    Processing: "",
    Progress: 0,
    Status: 0,
    Speed: "0 B/s",
    Size: "",

    SetProgress: (data) => set((state) => ({ ...state, ...data })),
    ResetProgress: () => set({ Progress: 0, Status: 0, Speed: "0 B/s" }),
}))