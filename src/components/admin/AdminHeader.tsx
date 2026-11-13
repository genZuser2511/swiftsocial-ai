"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Bell,
    ChevronDown,
    LogOut,
    Search,
    Settings,
    Shield,
    User
} from "lucide-react"
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

export function AdminHeader() {
    const router = useRouter()
    const [hasNotifications] = useState(true)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <header className="h-16 bg-black-charcoal/80 backdrop-blur-md border-b border-red-500/20 sticky top-0 z-30 px-6">
            <div className="h-full flex items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers, transactions..."
                            className="pl-10 bg-muted/50 border-red-500/20 focus:border-red-500/50"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* Admin Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <Shield className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Admin</span>
                    </div>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative hover:bg-red-500/10">
                        <Bell className="w-5 h-5" />
                        {hasNotifications && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 hover:bg-red-500/10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <span className="hidden md:inline font-medium">Admin</span>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin/settings">
                                    <Settings className="mr-2 w-4 h-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard">
                                    <User className="mr-2 w-4 h-4" />
                                    User Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400">
                                <LogOut className="mr-2 w-4 h-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
