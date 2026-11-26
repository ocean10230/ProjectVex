import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

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

const defaultValues = {
    YoutubeApiKey: "",
    AutoDownload: false,
    Confirmation: false,
    CloseOnCompletion: false,
    StaticPlaceholders: false,
    DefaultFormat: "video" as DefaultFormatType,
    DefaultQuality: "Best" as DefaultQualityType,
    FileNameTemplate: "{title}",
    SaveHistory: true,
};

export const PreferenceContext = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultValues,
            SetYoutubeApiKey: (YoutubeApiKey) => set({ YoutubeApiKey }),
            SetAutoDownload: (AutoDownload) => set({ AutoDownload }),
            SetConfirmation: (Confirmation) => set({ Confirmation }),
            SetCloseOnCompletion: (CloseOnCompletion) => set({ CloseOnCompletion }),
            SetStaticPlaceholders: (StaticPlaceholders) => set({ StaticPlaceholders }),
            SetDefaultFormat: (DefaultFormat) => set({ DefaultFormat }),
            SetDefaultQuality: (DefaultQuality) => set({ DefaultQuality }),
            SetFileNameTemplate: (FileNameTemplate) => set({ FileNameTemplate }),
            SetSaveHistory: (SaveHistory) => set({ SaveHistory }),
            ResetSettings: () => set(defaultValues),
        }),
        {
            name: "vex-settings",
            storage: createJSONStorage(() => extensionStorage),
        }
    )
);

export default PreferenceContext;