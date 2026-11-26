import { Fragment } from "preact/compat"
import { useLocation, Outlet } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { Download, Info, Palette, PersonStanding, type LucideIcon } from "lucide-react"

import { SettingTab } from "components/ui/pages/SettingTab"
import ColorContext from "hooks/themes/Display"

type RouteItem = [LucideIcon, string, string];

interface RouteCategory {
    title: string;
    page: RouteItem[];
}

const Routes: RouteCategory[] = [
    {
        title: "General",
        page: [
            [Download, "Download", "/settings/download"],
            [Palette, "Appearance", "/settings/appearance"],
            [PersonStanding, "Preference", "/settings/preference"],
        ],
    },
    {
        title: "",
        page: [[Info, "About", "/settings/about"]],
    },
];

export function Settings() {
    const location = useLocation();
    const colors = ColorContext()

    return (
        <div className="flex items-center gap-1 h-full">
            {/* Sidebar */}
            <div className="transform p-2 px-3 h-full flex flex-col gap-2 compact:w-[36%] w-4/10 shrink-0 bg-bg2 border-r border-border">
                {Routes.map((Route, i) => (
                    <Fragment key={i}>
                        <div className="flex flex-col gap-1.5">
                        {Route.title && !colors.Compacted && <p className="text-muted text-sm">{Route.title}</p>}

                        {Route.page.map((pg) => (
                            <SettingTab
                                key={pg[2]}
                                Selected={location.pathname.includes(pg[2])}
                                Title={pg[1]}
                                Icon={pg[0]}
                                Path={pg[2]}
                            />
                        ))}
                        </div>

                        {i < Routes.length - 1 && <hr className="opacity-10 my-1" />}
                    </Fragment>
                ))}
            </div>

            {/* Dynamic Content Display Area */}
            <div className="h-full flex-1 p-2 overflow-y-auto relative">
                <AnimatePresence>
                    <Outlet />
                </AnimatePresence>

                <div className="left-0 -bottom-5 sticky w-full h-17.5 bg-linear-to-b from-transparent to-bg" />
            </div>
        </div>
    );
}