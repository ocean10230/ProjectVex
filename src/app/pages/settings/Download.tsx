import { AnimatePresence, motion } from "framer-motion"
import { AudioLines, Video, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import Switch from "@/app/components/ui/Switch"

const types = [
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-primary to-secondary text-white",
    "rounded-none justify-center flex-1 flex items-center gap-2 px-2 p-1 bg-linear-135 from-bg2 to-bg2"
]

interface CustomDropdownProps {
    options: string[]
    value: string
    onChange?: (value: string) => void
}

export function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative text-left isolate z-50 w-fit" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-3 px-3 py-1 rounded-lg border border-muted/50 hover:border-primary bg-background text-foreground text-sm min-w-30 cursor-pointer outline-none"
            >
                <span>{value}</span>
                <ChevronDown className={`size-4 text-muted transition-transform duration-400 ${!isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.div
                        className="absolute left-0 right-0 top-full pt-1 z-50"
                        initial={{ y: -5, opacity: 0 }}
                        animate={{ y: 0,  opacity: 1 }}
                        exit=   {{ y: -5, opacity: 0 }}
                        transition={{ ease: [0,0,0,1], duration: 0.2 }}
                    >
                        <div className="bg-s2 rounded-md border border-muted/20 overflow-hidden">
                            {options.map((option) => (
                                <button
                                    // @ts-ignore
                                    no_base
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange?.(option)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-sm rounded-md smooth cursor-pointer ${
                                        option === value 
                                            ? "bg-linear-135 from-primary/20 to-secondary/20 text-[color-mix(in_srgb,var(--color-secondary),white_20%)]" 
                                            : "text-foreground bg-linear-135 from-transparent to-transparent hover:bg-muted/10"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function DownloadSetting() {
    const [quality, setQuality] = useState("Best")

    return (
        <div className="leading-4">
            <p className="font-medium">Downloads</p>
            <p className="text-sm text-muted">File handling and save preferences</p>

            <hr className="text-muted/20 my-3" />

            <div className="flex flex-col  gap-3">
                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>Default format</p>

                    <div className="flex items-center p-0.5 rounded-lg bg-s2 w-30.5">
                        <button className={types[0] + " rounded-l-md"}>
                            <Video className="size-4" />
                        </button>
                        <button className={types[1] + " rounded-r-md"}>
                            <AudioLines className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>Default quality</p>

                    <CustomDropdown 
                        options={["Best", "Lightest"]} 
                        value={quality} 
                        onChange={setQuality} 
                    />
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <p>File Name</p>
                    <input type="text" placeholder="{title}/{creator}/{id}" className="p-1 px-2 bg-s2 border outline-none border-muted/50 focus-within:border-primary rounded-lg text-sm font-normal" />
                </div>
                
                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div>
                        <p>Auto-Nesting</p>
                        <p className="w-50 text-xs text-muted">Nest the videos into folders by the creator's name</p>
                    </div>

                    <div>
                        <Switch />
                    </div>
                </div>

                <div className="w-full justify-between flex items-center text-sm font-medium">
                    <div>
                        <p>Save history</p>
                        <p className="w-3/4 text-xs text-muted">Save metadata of the videos that were downloaded</p>
                    </div>

                    <div>
                        <Switch />
                    </div>
                </div>
            </div>
        </div>
    )
}