import { motion } from 'framer-motion'

export default function PageWrapper({ children }: {children: React.ReactNode}) {
    return <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.8, ease: [0,0,0,1] }}
        className="flex flex-col flex-1 overflow-hidden"
    >
        {children}
    </motion.div>
}