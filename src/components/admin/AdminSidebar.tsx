"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    ChevronLeft,
    CreditCard,
    Home,
    LayoutDashboard,
    LogOut,
    Settings,
    Shield,
    Users,
    Activity,
    Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const adminNav = [
    { name: "Overview", href: "/admin", icon: Home },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Revenue", href: "/admin/revenue", icon: CreditCard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "System", href: "/admin/system", icon: Activity },
    { name: "Team", href: "/admin/team", icon: Shield },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="h-screen sticky top-0 bg-black-charcoal border-r border-red-500/20 flex flex-col z-40"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-red-500/20">
                <AnimatePresence mode="wait">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <Image
                                    src="/logo.jpg"
                                    alt="Admin Panel"
                                    width={140}
                                    height={40}
                                    className="h-8 w-auto object-contain rounded-lg"
                                />
                                <span className="font-bold text-sm text-red-400 bg-red-500/10 px-2 py-0.5 rounded ml-2">Admin</span>
                            </motion.div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </AnimatePresence>
                </AnimatePresence>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="shrink-0 hover:bg-red-500/10"
                >
                    <ChevronLeft
                        className={cn(
                            "w-5 h-5 transition-transform",
                            isCollapsed && "rotate-180"
                        )}
                    />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {adminNav.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                isActive
                                    ? "bg-red-500/20 text-red-400"
                                    : "text-muted-foreground hover:bg-red-500/10 hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-red-500/20">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-red-500/10 hover:text-foreground"
                    )}
                >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-medium whitespace-nowrap"
                            >
                                User Dashboard
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
            </div>
        </motion.aside>
    )
}
