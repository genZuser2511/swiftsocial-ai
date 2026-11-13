"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/shared/GradientCard"
import {
    User, Building2, Mic, Bot, Bell, Shield, Database,
    Activity, Palette, Phone, ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"

import { ProfileTab } from "@/components/settings/ProfileTab"
import { AccountTab } from "@/components/settings/AccountTab"
import { VoiceTab } from "@/components/settings/VoiceTab"
import { AIModelTab } from "@/components/settings/AIModelTab"
import { NotificationsTab } from "@/components/settings/NotificationsTab"
import { PrivacyTab } from "@/components/settings/PrivacyTab"
import { SecurityTab } from "@/components/settings/SecurityTab"
import { AuditLogTab } from "@/components/settings/AuditLogTab"
import { WhiteLabelTab } from "@/components/settings/WhiteLabelTab"

const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account & Verticals", icon: Building2 },
    { id: "voice", label: "Voice & Language", icon: Mic },
    { id: "ai-model", label: "AI Model", icon: Bot },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Data & Privacy", icon: Database },
    { id: "security", label: "Security", icon: Shield },
    { id: "audit", label: "Audit Log", icon: Activity },
    { id: "white-label", label: "White Label", icon: Palette },
]

const settingsLinks = [
    {
        title: "Profile Settings",
        description: "Manage your personal information and preferences",
        icon: User,
        href: "/dashboard/settings?view=profile",
        color: "text-blue-400",
        bg: "bg-blue-400/10"
    },
    {
        title: "Account & Verticals",
        description: "Configure industry verticals and company details",
        icon: Building2,
        href: "/dashboard/settings?view=account",
        color: "text-indigo-400",
        bg: "bg-indigo-400/10"
    },
    {
        title: "Workspace & Organization",
        description: "Manage teams, roles, and organization details",
        icon: Building2,
        href: "/dashboard/settings/workspace",
        color: "text-gold-400",
        bg: "bg-gold-400/10"
    },
    {
        title: "Telephony & Providers",
        description: "Configure Twilio keys and phone numbers",
        icon: Phone,
        href: "/dashboard/settings/telephony",
        color: "text-green-400",
        bg: "bg-green-400/10"
    },
    {
        title: "Security & Audit",
        description: "View login history and active sessions",
        icon: Shield,
        href: "/dashboard/settings?view=security",
        color: "text-purple-400",
        bg: "bg-purple-400/10"
    },
    {
        title: "Notifications",
        description: "Configure email and SMS alerts",
        icon: Bell,
        href: "/dashboard/settings?view=notifications",
        color: "text-orange-400",
        bg: "bg-orange-400/10"
    },
    {
        title: "White Label",
        description: "Customize platform branding and domain",
        icon: Palette,
        href: "/dashboard/settings?view=white-label",
        color: "text-pink-400",
        bg: "bg-pink-400/10"
    },
    {
        title: "AI Voice & Model",
        description: "Configure agent voices and AI reasoning models",
        icon: Bot,
        href: "/dashboard/settings?view=voice",
        color: "text-teal-400",
        bg: "bg-teal-400/10"
    }
]

function SettingsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const view = searchParams.get("view")
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // If no view is selected, show the Grid Hub
    if (!view) {
        return (
            <div className="space-y-8 pb-10 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Settings Hub</h1>
                    <p className="text-muted-foreground mt-2">
                        Centralized management for your profile, workspaces, and integrations.
                    </p>
                </div>

                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {settingsLinks.map((link) => (
                        <motion.div key={link.title} variants={fadeInUp}>
                            <Link href={link.href}>
                                <GlassCard className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                                    <div className="flex flex-col gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${link.bg}`}>
                                            <link.icon className={`w-6 h-6 ${link.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-gold-400 transition-colors">
                                                {link.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {link.description}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        )
    }

    // Otherwise show the classic sidebar layout for the selected view
    return (
        <div className="space-y-6 pb-10">
            <div>
                <button 
                    onClick={() => router.push("/dashboard/settings")}
                    className="flex items-center text-sm text-muted-foreground hover:text-gold-400 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Settings Hub
                </button>
                <h1 className="text-2xl md:text-3xl font-bold capitalize">{view.replace('-', ' ')} Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your {view.replace('-', ' ')} preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Sidebar Nav */}
                <GlassCard className="lg:col-span-1 h-fit sticky top-6">
                    <nav className="space-y-0.5">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => router.push(`/dashboard/settings?view=${tab.id}`)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    view === tab.id
                                        ? "bg-gold-400/10 text-gold-400"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <tab.icon className="w-4 h-4 shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </GlassCard>

                {/* Tab Content */}
                <div className="lg:col-span-3">
                    {view === "profile" && <ProfileTab />}
                    {view === "account" && <AccountTab />}
                    {view === "voice" && <VoiceTab />}
                    {view === "ai-model" && <AIModelTab />}
                    {view === "notifications" && <NotificationsTab />}
                    {view === "privacy" && <PrivacyTab />}
                    {view === "security" && <SecurityTab />}
                    {view === "audit" && <AuditLogTab />}
                    {view === "white-label" && <WhiteLabelTab />}
                </div>
            </div>
        </div>
    )
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    )
}
