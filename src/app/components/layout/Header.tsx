import { Settings, Download, ChevronLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from '@/app/components/layout/Logo'

export default function Header() {
    const navigate = useNavigate()
    const location = useLocation()
    
    const cannotNav = (/\/download/).test(location.pathname)
    const canNavBack = (/\/settings\/(.+)|\/history/).test(location.pathname)

    return <header className="shrink-0 bg-bg2 flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2 font-semibold">
            <Logo />
            ProjectVex
        </div>

        <div className="flex items-center gap-1">
            {
                canNavBack ?
                <button onClick={() => navigate("/")} className="px-2 w-fit flex items-center gap-0.5"><ChevronLeft className="size-4 smooth"/> Back</button>
                : !cannotNav && <>
                    <button title="Settings" onClick={() => navigate("/settings/download")}>
                        <Settings className="size-4" />
                    </button>
                    <button title="History" onClick={() => navigate("/history")}>
                        <Download className="size-4" />
                    </button>
                </>
            }
        </div>
    </header>
}