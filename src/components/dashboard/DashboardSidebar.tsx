"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    BarChart3,
    Bot,
    ChevronLeft,
    CreditCard,
    Database,
    FileText,
    History,
    Home,
    LogOut,
    Menu,
    Phone,
    Settings,
    User,
    Users,
    Mail,
    Zap,
    X,
    Shield,
    Briefcase,
    Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useSettingsStore } from "@/store/useSettingsStore"

const sidebarLinks = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "AI Agents", href: "/dashboard/agents", icon: Bot },
    { name: "Contacts", href: "/dashboard/contacts", icon: Users },
    { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
    { name: "Campaigns", href: "/dashboard/campaigns", icon: Zap },
    { name: "Call History", href: "/dashboard/calls", icon: History },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Knowledge Base", href: "/dashboard/knowledge", icon: Database },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const insuranceLinks = [
    { name: "Dashboard", href: "/dashboard/insurance/dashboard", icon: BarChart3 },
    { name: "CRM", href: "/dashboard/insurance/crm", icon: Users },
    { name: "Renewals", href: "/dashboard/insurance/renewals", icon: Activity },
    { name: "Pipeline", href: "/dashboard/insurance/pipeline", icon: Briefcase },
    { name: "Compliance", href: "/dashboard/insurance/compliance", icon: Shield },
]

const travelLinks = [
    { name: "Dashboard", href: "/dashboard/travel/dashboard", icon: BarChart3 },
    { name: "CRM", href: "/dashboard/travel/crm", icon: Users },
    { name: "Pipeline", href: "/dashboard/travel/pipeline", icon: Briefcase },
    { name: "Analytics", href: "/dashboard/travel/analytics", icon: BarChart3 },
    { name: "Compliance", href: "/dashboard/travel/compliance", icon: Shield },
]

interface DashboardSidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

export function DashboardSidebar({ isCollapsed, setIsCollapsed }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const { insuranceEnabled, travelEnabled, fetchSettings } = useSettingsStore()

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard"
        }
        return pathname.startsWith(href)
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-4 border-b border-gold-400/10">
                <Link href="/dashboard" className="flex items-center gap-3">
                    {isCollapsed ? (
                        <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center shrink-0 overflow-hidden">
                            <Image
                                src="/logo.jpg"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="h-full w-full object-cover rounded-lg"
                            />
                        </div>
                    ) : (
                        <>
                            <Image
                                src="/logo.jpg"
                                alt="SwiftSocial.AI Logo"
                                width={40}
                                height={40}
                                className="h-9 w-9 object-cover rounded-lg shrink-0"
                                priority
                            />
                            <span className="font-bold text-lg tracking-tight whitespace-nowrap">SwiftSocial<span className="text-gold-400">AI</span></span>
                        </>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none hover:scrollbar-thin scrollbar-thumb-gold-400/20 scrollbar-track-transparent transition-all">
                {sidebarLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            isActive(link.href)
                                ? "bg-gold-400/10 text-gold-400"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? link.name : undefined}
                    >
                        <link.icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-medium"
                            >
                                {link.name}
                            </motion.span>
                        )}
                    </Link>
                ))}

                {/* Insurance Vertical Section */}
                {insuranceEnabled && (
                    <div className="pt-4 mt-4 border-t border-gold-400/10">
                        {!isCollapsed && (
                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Insurance
                            </p>
                        )}
                    {insuranceLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                isActive(link.href)
                                    ? "bg-gold-400/10 text-gold-400"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? link.name : undefined}
                        >
                            <link.icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-medium"
                                >
                                    {link.name}
                                </motion.span>
                            )}
                        </Link>
                    ))}
                </div>
                )}

                {/* Travel Vertical Section */}
                {travelEnabled && (
                <div className="pt-4 mt-4 border-t border-gold-400/10">
                    {!isCollapsed && (
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Travel
                        </p>
                    )}
                    {travelLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                isActive(link.href)
                                    ? "bg-gold-400/10 text-gold-400"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? link.name : undefined}
                        >
                            <link.icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm font-medium"
                                >
                                    {link.name}
                                </motion.span>
                            )}
                        </Link>
                    ))}
                </div>
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gold-400/10 space-y-2">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors",
                        isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 72 : 256 }}
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-gold-400/10 z-40"
                )}
            >
                <SidebarContent />

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-gold-400 text-black flex items-center justify-center shadow-lg hover:bg-gold-500 transition-colors"
                >
                    <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
                </button>
            </motion.aside>

            {/* Mobile Hamburger */}
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden fixed top-4 left-4 z-50"
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </Button>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-gold-400/10 z-50"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
