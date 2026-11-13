"use client"

import { useState, useEffect } from "react"
import { Bell, Search, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserData {
    email: string
    full_name?: string
    company?: string
}

export function DashboardHeader() {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const getUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser({
                    email: user.email || "",
                    full_name: user.user_metadata?.full_name,
                    company: user.user_metadata?.company,
                })
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <header className="h-16 border-b border-gold-400/10 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents, calls, analytics..."
                        className="pl-10 bg-muted/50 border-gold-400/10"
                    />
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4 ml-auto">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400" />
                </Button>

                {/* User Menu - Wrapped in mounted check to prevent hydration mismatch */}
                {mounted ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gold-400" />
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium">
                                        {user?.full_name || "User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user?.company || user?.email}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings?tab=billing">Billing</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-400 focus:text-red-400"
                                onClick={handleLogout}
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="ghost" className="flex items-center gap-2 opacity-0">
                        <div className="w-8 h-8 rounded-full bg-gold-400/10" />
                        <div className="hidden sm:block w-20 h-4 bg-muted/20 rounded" />
                    </Button>
                )}
            </div>
        </header>
    )
}
