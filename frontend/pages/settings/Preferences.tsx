import Switch from "components/ui/Switch"
import ThemeContext from "frontend/manager/themes/Display"
import PreferenceContext from "hooks/preferences/Youtube"

export function Preference() {
    const Settings = PreferenceContext()
    const Context = ThemeContext()

    return (
        <div className="leading-4 h-full">
            {
                !Context.Compacted && <>
                    <p className="font-medium">Preference</p>
                    <p className="text-sm text-muted">Functionality adjustment</p>
                    <hr className="text-muted/20 my-3 compact:my-2" />
                </>
            }


            <div className="flex flex-col gap-3">
                <div className="w-full justify-between flex flex-col gap-2 text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Youtube API Key <span className="bg-clip-text primary-element text-transparent">*</span></p>
                        <p className="text-xs font-normal text-muted">
                            The key for Youtube's processing interface the popup will use to get the metadata
                            of the video (channel, title, description, etc)
                        </p>
                    </div>

                    <input
                        type="password"
                        value={Settings.YoutubeApiKey}
                        onInput={(e) => Settings.SetYoutubeApiKey((e.target as HTMLInputElement).value)}
                        placeholder="Youtube API V3 Key"
                        className="p-1 px-2 bg-s2 border outline-none border-muted/50 focus-within:border-primary rounded-lg text-sm font-normal disabled:opacity-40"
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Interaction</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Automatically downloads without extra selection (pre-set format)
                        </p>
                    </div>
                    <Switch
                        Checked={Settings.AutoDownload}
                        OnChecked={(v) => Settings.SetAutoDownload(v)}
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Confirmation</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Ask to confirm the downloaded video & format to prevent unneccessary waste of resources
                        </p>
                    </div>
                    <Switch
                        Checked={Settings.Confirmation}
                        OnChecked={(v) => Settings.SetConfirmation(v)}
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Close on completion</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Close this pop-up after done downloading
                        </p>
                    </div>
                    <Switch
                        Checked={Settings.CloseOnCompletion}
                        OnChecked={(v) => Settings.SetCloseOnCompletion(v)}
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Static placeholders</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Uses a skeleton block to represent a loading item instead of a loading screen
                        </p>
                    </div>
                    <Switch
                        Checked={Settings.StaticPlaceholders}
                        OnChecked={(v) => Settings.SetStaticPlaceholders(v)}
                    />
                </div>
            </div>
        </div>
    )
}