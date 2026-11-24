import { AnimatePresence, motion } from 'framer-motion'
import { Check,  X, type LucideIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Notify(message: string, Icon?: LucideIcon) {
    const isError = Icon === X
    const isSuccess = Icon === Check

    const borderColor = isError 
        ? "border-red-500/50 bg-red-400/50" 
        : isSuccess 
            ? "border-green-400/50 bg-green-400/50" 
            : "border-border/50 bg-s2"

    toast.custom(
        (t) => (
            <AnimatePresence>
                {t.visible && (
                    <motion.div 
                        className={`flex items-center gap-2 p-2.25 border ${borderColor} rounded-xl shadow-lg`}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        transition={{ ease: [0, 0, 0, 1], duration: 0.3 }}
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