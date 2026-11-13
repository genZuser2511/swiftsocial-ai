"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Crown,
    Mail,
    MoreHorizontal,
    Plus,
    Shield,
    Trash2,
    User,
    UserCog,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"

const teamMembers = [
    {
        id: "1",
        name: "Aditya Sharma",
        email: "aditya@swiftsocial.ai",
        role: "Super Admin",
        status: "active",
        lastActive: "Now",
    },
    {
        id: "2",
        name: "Priya Patel",
        email: "priya@swiftsocial.ai",
        role: "Admin",
        status: "active",
        lastActive: "5 mins ago",
    },
    {
        id: "3",
        name: "Rahul Kumar",
        email: "rahul@swiftsocial.ai",
        role: "Support Manager",
        status: "active",
        lastActive: "1 hour ago",
    },
    {
        id: "4",
        name: "Anita Desai",
        email: "anita@swiftsocial.ai",
        role: "Support Agent",
        status: "active",
        lastActive: "3 hours ago",
    },
    {
        id: "5",
        name: "Vikram Singh",
        email: "vikram@swiftsocial.ai",
        role: "Developer",
        status: "inactive",
        lastActive: "2 days ago",
    },
]

const roles = [
    { name: "Super Admin", permissions: "Full access to all features", count: 1 },
    { name: "Admin", permissions: "Manage customers, revenue, analytics", count: 1 },
    { name: "Support Manager", permissions: "View customers, manage support", count: 1 },
    { name: "Support Agent", permissions: "View customer issues only", count: 1 },
    { name: "Developer", permissions: "System access, API management", count: 1 },
]

export default function TeamPage() {
    const [showInvite, setShowInvite] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Team Management</h1>
                    <p className="text-muted-foreground">
                        Manage admin users and permissions
                    </p>
                </div>
                <Button
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white w-fit"
                    onClick={() => setShowInvite(!showInvite)}
                >
                    <Plus className="mr-2 w-4 h-4" />
                    Invite Member
                </Button>
            </div>

            {/* Invite Form */}
            {showInvite && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GradientCard className="border-red-500/10">
                        <h2 className="text-lg font-semibold mb-4">Invite New Team Member</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input placeholder="email@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option>Admin</option>
                                    <option>Support Manager</option>
                                    <option>Support Agent</option>
                                    <option>Developer</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                                    <Mail className="mr-2 w-4 h-4" />
                                    Send Invite
                                </Button>
                            </div>
                        </div>
                    </GradientCard>
                </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold">5</div>
                    <div className="text-sm text-muted-foreground">Total Members</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-green-400">4</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-yellow-400">1</div>
                    <div className="text-sm text-muted-foreground">Inactive</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-blue-400">0</div>
                    <div className="text-sm text-muted-foreground">Pending Invites</div>
                </GlassCard>
            </div>

            {/* Team Members */}
            <GradientCard className="border-red-500/10">
                <h2 className="text-lg font-semibold mb-6">Team Members</h2>
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                {member.role === "Super Admin" ? (
                                    <Crown className="w-6 h-6 text-white" />
                                ) : member.role === "Admin" ? (
                                    <Shield className="w-6 h-6 text-white" />
                                ) : (
                                    <User className="w-6 h-6 text-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium">{member.name}</p>
                                    {member.role === "Super Admin" && (
                                        <span className="px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400 text-xs">
                                            Owner
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                            <div className="hidden md:block">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === "Super Admin"
                                        ? "bg-gold-400/10 text-gold-400"
                                        : member.role === "Admin"
                                            ? "bg-red-500/10 text-red-400"
                                            : "bg-muted text-muted-foreground"
                                    }`}>
                                    {member.role}
                                </span>
                            </div>
                            <div className="hidden md:block text-right">
                                <span className={`flex items-center gap-1.5 text-sm ${member.status === "active" ? "text-green-400" : "text-muted-foreground"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-green-400" : "bg-muted-foreground"
                                        }`} />
                                    {member.lastActive}
                                </span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <UserCog className="mr-2 w-4 h-4" />
                                        Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400">
                                        <Trash2 className="mr-2 w-4 h-4" />
                                        Remove
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}
                </div>
            </GradientCard>

            {/* Roles */}
            <GradientCard className="border-red-500/10">
                <h2 className="text-lg font-semibold mb-6">Roles & Permissions</h2>
                <div className="space-y-3">
                    {roles.map((role) => (
                        <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-red-400" />
                                <div>
                                    <p className="font-medium">{role.name}</p>
                                    <p className="text-sm text-muted-foreground">{role.permissions}</p>
                                </div>
                            </div>
                            <span className="text-sm text-muted-foreground">{role.count} member(s)</span>
                        </div>
                    ))}
                </div>
            </GradientCard>
        </div>
    )
}
