import Switch from "components/ui/Switch"
import CustomDropdown from "components/ui/Dropdown"
import ThemeContext from "hooks/themes/Display"

const Colors: Array<[ColorType, string]> = [
    ["red", "bg-red-500"],
    ["orange", "bg-orange-400"],
    ["yellow", "bg-yellow-400"],
    ["green", "bg-green-400"],
    ["blue", "bg-blue-400"],
    ["indigo", "bg-indigo-400"],
    ["violet", "bg-violet-400"],
    ["pink", "bg-pink-400"],
]

const PositionGrid: Position[] = [
    "tl", "t", "tr",
    "l",  "c", "r",
    "bl", "b", "br",
]

const PositionLabels: Record<Position, string> = {
    tl: "Top Left",
    t: "Top Center",
    tr: "Top Right",
    l: "Middle Left",
    c: "Center",
    r: "Middle Right",
    bl: "Bottom Left",
    b: "Bottom Center",
    br: "Bottom Right",
}

export function Appearance() {
    const Context = ThemeContext()

    return (
        <div className="leading-4 h-full">
            {
                !Context.Compacted && <>
                    <p className="font-medium">Appearance</p>
                    <p className="text-sm text-muted">Themes & visual preferences</p>
                    <hr className="text-muted/20 my-3 compact:my-2" />
                </>
            }

            <div className="flex flex-col compact:gap-1.5 gap-3">
                <div className="z-99 w-full justify-between flex items-center text-sm font-medium">
                    <p>UI Scale</p>
                    <CustomDropdown
                        value={Context.Scale.slice(0, 1).toUpperCase() + Context.Scale.slice(1)}
                        options={["Small", "Normal", "Large"]}
                        onChange={(v) => Context.SetScale(v.toLowerCase() as ScaleType)}
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>Theme</p>
                    <CustomDropdown
                        value={Context.Theme.slice(0, 1).toUpperCase() + Context.Theme.slice(1)}
                        options={["Dark", "Light"]}
                        onChange={(v) => Context.SetTheme(v.toLowerCase() as ThemeType)}
                    />
                </div>

                <div className="compact:my-1 compact:mb-1.5 w-full justify-between flex items-center text-sm font-medium">
                    <p>Color</p>

                    <div className="flex items-center gap-1 compact:gap-0.5 transform">
                        {Colors.map(([name, bgClass]) => (
                            <button
                                key={name}
                                onClick={() => Context.SetColor(name)}
                                role="switch"
                                aria-checked={Context.Color === name}
                                className={[
                                    "size-5 rounded-full cursor-pointer border-2 transition-colors",
                                    bgClass,
                                    Context.Color === name ? "border-white" : "border-transparent",
                                ].join(" ")}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Popup position</p>
                        <p className="compact:hidden text-xs font-normal text-muted">
                            {PositionLabels[Context.Position]}
                        </p>
                    </div>

                    <div
                        className="w-20 grid grid-cols-3 gap-px p-1"
                        role="radiogroup"
                        aria-label="Popup screen position"
                    >
                        {PositionGrid.map((pos, i) => (
                            <button
                                key={pos}
                                type="button"
                                role="switch"
                                title={PositionLabels[pos]}
                                aria-label={PositionLabels[pos]}
                                aria-checked={Context.Position === pos}
                                onClick={() => Context.SetPosition(pos)}
                                className={[
                                    "rounded-none w-full h-3 cursor-pointer transition-colors border",
                                    Context.Position === pos ? "bg-primary border-transparent" : "not-light:bg-s2 not-light:hover:bg-s1 bg-s1 hover:bg-s2 border-transparent hover:border-primary",
                                    i === 0 && "rounded-tl-md",
                                    i === 2 && "rounded-tr-md",
                                    i === 6 && "rounded-bl-md",
                                    i === 8 && "rounded-br-md",
                                    
                                ].join(" ")}
                            />
                        ))}
                    </div>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div className="flex flex-col leading-3.5">
                        <p>Compact mode</p>
                        <p className="compact:hidden text-xs font-normal text-muted w-50">
                            Reduce unnecessary spaces and content to maximize the minimalism
                        </p>
                    </div>
                    <Switch
                        Checked={Context.Compacted}
                        OnChecked={(Checked) => Context.SetCompacted(Checked)}
                    />
                </div>
            </div>
        </div>
    )
}