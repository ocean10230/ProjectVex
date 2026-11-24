import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "preact/hooks"

interface CustomDropdownProps {
    options: string[]
    value: string
    onChange?: (value: string) => void
}

export default function Dropdown({ options, value, onChange }: CustomDropdownProps) {
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
                className="flex items-center justify-between gap-3 px-3 py-1 rounded-lg border border-muted/50 hover:border-primary/50 transition-colors bg-background text-foreground text-sm min-w-30 cursor-pointer outline-none"
            >
                <span>{value}</span>
                <ChevronDown className={`size-4 text-muted transition-transform duration-400 compact:hidden ${!isOpen ? "rotate-180" : ""}`} />
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
                                    role="region"
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange?.(option)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full not-compact:px-2.5 py-1 compact:px-1.5 not-compact:text-sm rounded-md smooth cursor-pointer ${
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