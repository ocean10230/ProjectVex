import Switch from "@/app/components/ui/Switch"
import CustomDropdown from "@/app/components/ui/Dropdown"

export function Preference() {
    return (
        <div className="leading-4 h-full">

            <p className="font-medium">Preference</p>
            <p className="text-sm text-muted">Functionality adjustment</p>

            <hr className="text-muted/20 my-3 compact:my-2" />

            <div className="flex flex-col gap-3">
                <div className="w-full justify-between flex flex-col gap-2 text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Youtube API</p>
                        <p className="text-xs font-normal text-muted">
                            The processing interface this popup will use to display data of the video
                            metadata (channel, title, description, etc)
                        </p>
                    </div>

                    <div className="flex gap-1 items-center">
                        <CustomDropdown
                            options={[ "oEmbeded", "Youtube API V3" ]}
                            value="oEmbeded"
                        />

                        <input type="text" placeholder="Youtube API key (v3)" className="p-1 px-2 bg-s2 border outline-none border-muted/50 focus-within:border-primary rounded-lg text-sm font-normal" />
                    </div>
                </div>


                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Interaction</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Automatically downloads without extra selection (pre-set format)
                        </p>
                    </div>
                    <Switch/>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Confirmation</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Ask to confirm the downloaded video & format to prevent unneccessary waste of resources
                        </p>
                    </div>
                    <Switch/>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Close on completion</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Close this pop-up after done downloading
                        </p>
                    </div>
                    <Switch/>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Static placeholders</p>
                        <p className="text-xs font-normal text-muted w-50">
                            Uses a skeleton block to represent a loading item instead of a loading screen
                        </p>
                    </div>
                    <Switch/>
                </div>
            </div>
        </div>
    )
}