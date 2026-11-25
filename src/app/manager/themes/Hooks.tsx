import { useEffect } from "preact/hooks"
import ThemeContext from "hooks/themes/Display"

import { Messages } from "@/Config"

export default function ThemeHandlers() {
    const Theme = ThemeContext()

    useEffect(() => {
        window.postMessage({ type: Messages.IframePosition, Position: Theme.Position })
    }, [Theme.Position])

    useEffect(() => document.body.setAttribute("color", Theme.Color), [Theme.Color])
    useEffect(() => document.body.setAttribute("theme", Theme.Theme), [Theme.Theme])
    useEffect(() => {
        const list = document.body.classList
        if (Theme.Compacted) list.add("compact")
        else list.remove("compact")
    }, [Theme.Compacted])
}