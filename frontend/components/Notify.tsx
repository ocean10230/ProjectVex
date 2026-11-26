import { AnimatePresence, motion } from 'framer-motion'
import { Check,  X, type LucideIcon } from 'lucide-react'
import toast from 'react-hot-toast'

import Transition from "frontend/motion/Transitions"

export default function Notify(message: string, Icon?: LucideIcon) {
    const isError = Icon === X
    const isSuccess = Icon === Check

    const borderColor = isError 
        ? "border-red-500/30 bg-red-400/30" 
        : isSuccess 
            ? "border-green-400/30 bg-green-400/30" 
            : "border-border/50 bg-s2"

    toast.custom(
        (t) => (
            <AnimatePresence mode="wait">
                {t.visible && (
                    <motion.div 
                        className={`backdrop-blur-xl flex items-center gap-2 p-1.5 not-compacted:p-2.25 border ${borderColor} rounded-xl shadow-lg`}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        transition={{ duration: Transition.Duration - 0.2, ease: Transition.Easing }}
                    >
                        {Icon && <Icon className={"size-4 shrink-0 " + (Icon.displayName?.includes("Loader") && "animate-spin duration-250")} />}
                        <span className="text-xs">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        ), 
        { duration: 5000 }
    )
}