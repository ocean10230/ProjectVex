import { AudioLines, Video } from "lucide-react"

import Switch from "components/ui/Switch"
import CustomDropdown from "components/ui/Dropdown"
import PreferenceContext from "hooks/preferences/Youtube"

const types = [
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-primary to-secondary text-white",
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-bg2 to-bg2"
]

export function DownloadSetting() {
    const Settings = PreferenceContext()

    return (
        <div className="leading-4">
            <p className="font-medium">Downloads</p>
            <p className="text-sm text-muted">File handling and save preferences</p>

            <hr className="text-muted/20 my-3" />

            <div className="flex flex-col gap-3">
                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>Default format</p>

                    <div className="flex items-center p-0.5 rounded-lg bg-s2 w-30.5">
                        <button
                            type="button"
                            onClick={() => Settings.SetDefaultFormat("video")}
                            className={(Settings.DefaultFormat === "video" ? types[0] : types[1]) + " rounded-l-md cursor-pointer"}
                        >
                            <Video className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => Settings.SetDefaultFormat("audio")}
                            className={(Settings.DefaultFormat === "audio" ? types[0] : types[1]) + " rounded-r-md cursor-pointer"}
                        >
                            <AudioLines className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>Default quality</p>

                    <CustomDropdown
                        options={["Best", "Lightest"]}
                        value={Settings.DefaultQuality}
                        onChange={(v) => Settings.SetDefaultQuality(v as DefaultQualityType)}
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>File Name</p>
                    <input
                        type="text"
                        value={Settings.FileNameTemplate}
                        onInput={(e) => Settings.SetFileNameTemplate((e.target as HTMLInputElement).value)}
                        placeholder="{title}/{creator}/{id}"
                        className="p-1 px-2 bg-s2 border outline-none border-muted/50 focus-within:border-primary rounded-lg text-sm font-normal"
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div>
                        <p>Save history</p>
                        <p className="w-3/4 text-xs text-muted">Save metadata of the videos that were downloaded</p>
                    </div>

                    <div>
                        <Switch
                            Checked={Settings.SaveHistory}
                            OnChecked={(v) => Settings.SetSaveHistory(v)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}