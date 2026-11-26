import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SettingTab({ Title, Icon, Selected, Path }: { Title: string, Icon: LucideIcon, Selected: boolean, Path: string }) {
    const navigate = useNavigate()

    return  <div className={`
        border shadow-[0_0px_15px_5px_rgba(0,0,0,0.1)]
        cursor-pointer flex gap-2 text-sm items-center transition-colors duration-100
        ${Selected ? "shadow-primary/20 border-border bg-s1 hover:bg-s2" : "shadow-transparent border-transparent hover:bg-s1/30 text-muted"} p-2 rounded-lg
    `}
        onClick={() => navigate(Path)}
    >
        <Icon className={"compact:hidden transition-colors duration-150 size-6.5 p-1.5 rounded-lg " + (Selected ? "bg-primary/50" : "bg-s1")} />
        <p>{Title}</p>
    </div>
}