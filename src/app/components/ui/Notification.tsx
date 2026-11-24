import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export function Call(children: React.ReactNode) {
    toast.custom((t) => (
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ 
          x: t.visible ? 0 : 35, 
          opacity: t.visible ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: [0,0,0,1] }}
        className="flex items-center gap-1 bg-s1 min-w-50 p-2 rounded-lg border border-border/50 pointer-events-auto"
      >
        {children}
      </motion.div>
    ))
}