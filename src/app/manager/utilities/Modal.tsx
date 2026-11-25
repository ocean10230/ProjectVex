import { type ReactNode } from "preact/compat";
import { create } from "zustand";
import { AnimatePresence, motion } from 'framer-motion'
import { X } from "lucide-react";

type ActionsType = ReactNode[]

interface BaseContext {
    Title: string | ReactNode
    Content: string | ReactNode
    Actions: ActionsType
    CloseButton?: boolean
}

interface ModalContext extends BaseContext {
    Display: boolean
    SetContent: (data: BaseContext) => void
    SetDisplay: (Display: boolean, CloseButton?: boolean) => void
}

export const ModalContext = create<ModalContext>()((set) => ({
    Display: false,
    Title: "",
    Content: "",
    Actions: [],
    CloseButton: false,

    SetContent: ({ Actions, Title, Content, CloseButton = false }) =>
        set((prev) => ({ ...prev, Actions, Title, Content, CloseButton })),
    SetDisplay: (Display, CloseButton) => set((prev) => ({ ...prev, Display, CloseButton })),
}))

export default function ModalRenderer() {
    const Context = ModalContext()

    return (
        <AnimatePresence>
            {Context.Display && (
                <motion.div
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, ease: [0, 0, 0.5, 1] }}
                    className="z-50 pointer-events-none bg-bg/50 backdrop-blur-xs absolute top-0 left-0 w-full h-full flex items-center justify-center"
                >
                    <div className="bg-s1/80 pointer-events-auto backdrop-blur-md p-3 rounded-2xl border border-muted/10 w-64 min-h-40 max-h-68 flex flex-col">
                        <div className="flex items-center justify-between border-b border-muted/20 pb-2">
                            <p className="text-sm font-medium">{Context.Title}</p>
                            {Context.CloseButton && (
                                <button
                                    type="button"
                                    role="region"
                                    className="p-1.5 bg-s2 rounded-md cursor-pointer hover:bg-s1 transition-colors duration-150"
                                    onClick={() => Context.SetDisplay(false)}
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </div>

                        <div className="text-sm my-1 flex-1 text-white/80">
                            {Context.Content}
                        </div>

                        <div className="flex items-center justify-end gap-1">
                            {Context.Actions.map((Action) => Action)}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}