"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { cn } from "@/lib/utils"
import { useAgentStore } from "@/store/useAgentStore"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { fetchAgents, fetchProfile, hasFetched, onboardingCompleted } = useAgentStore()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!hasFetched) {
            fetchAgents()
            fetchProfile()
        }
    }, [hasFetched, fetchAgents, fetchProfile])

    useEffect(() => {
        if (onboardingCompleted === false && pathname !== "/dashboard/onboarding") {
            router.push("/dashboard/onboarding")
        }
    }, [onboardingCompleted, pathname, router])

    const isOnboarding = pathname === "/dashboard/onboarding"

    if (isOnboarding) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                {children}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div
                className={cn(
                    "transition-all duration-300",
                    isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
                )}
            >
                <DashboardHeader />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
