import { Radio } from "../Radio";
import { motion } from 'framer-motion'

export function QualitySelectorItem({ 
    resolution, 
    detail, 
    selected, 
    onSelect, 
    isSkeleton = false 
}: QualityItemProps & { isSkeleton?: boolean }) {
    if (isSkeleton) {
        return (
            <div className="flex items-center justify-between p-2 px-3.25 rounded-xl border border-s1 bg-s shrink-0">
                <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-14 rounded-md bg-linear-to-r from-s1 to-s2 animate-pulse" />
                    <div className="h-3 w-22 rounded-md bg-linear-to-r from-s1 to-s2 animate-pulse" />
                </div>

                <div className="size-4 rounded-full bg-linear-to-r from-s1 to-s2 animate-pulse" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ y: 10, opacity: 0, filter: "blur(5px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 10, opacity: 0, filter: "blur(5px)" }}
            transition={{ duration: 0.2, ease: [0,0,0,1] }}

            onClick={onSelect}
            className={`flex items-center justify-between p-2 px-3.25 rounded-xl border shrink-0 cursor-pointer transition-colors duration-200 ${
                selected ? "bg-primary/20 border-primary/20" : "bg-s border-s1 hover:border-border hover:bg-s2"
            }`}
        >
            <div className="leading-4">
                <p className="font-medium">{resolution}</p>
                <p className="text-xs font-medium text-muted">{detail}</p>
            </div>

            <Radio selected={selected} />
        </motion.div>
    )
}

export default QualitySelectorItem;