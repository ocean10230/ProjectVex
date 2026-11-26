import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

interface ColorContext extends BaseContext {
    SetColor: (Color: ColorType) => void;
    SetTheme: (Theme: ThemeType) => void;
    SetCompacted: (Compacted: boolean) => void;
    SetScale: (Scale: ScaleType) => void;
    SetPosition: (Position: Position) => void;
}

const extensionStorage: StateStorage = {
    getItem: async (name) => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            const res = await chrome.storage.local.get(name);
            return (res[name] as string) ?? null;
        }
        return localStorage.getItem(name);
    },
    setItem: async (name, value) => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            await chrome.storage.local.set({ [name]: value });
            return;
        }
        localStorage.setItem(name, value);
    },
    removeItem: async (name) => {
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            await chrome.storage.local.remove(name);
            return;
        }
        localStorage.removeItem(name);
    },
};

const ThemeContext = create<ColorContext>()(
    persist(
        (set) => ({
            Color: "red",
            Theme: "dark",
            Compacted: false,
            Scale: "normal",
            Position: "tr",
            SetColor: (Color) => set({ Color }),
            SetTheme: (Theme) => set({ Theme }),
            SetCompacted: (Compacted) => set({ Compacted }),
            SetScale: (Scale) => set({ Scale }),
            SetPosition: (Position) => set({ Position })
        }),
        {
            name: "vex-theme",
            storage: createJSONStorage(() => extensionStorage),
        }
    )
);

export default ThemeContext;