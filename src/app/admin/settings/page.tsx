"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Bell,
    Building2,
    Key,
    Mail,
    Save,
    Shield,
    Webhook
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { cn } from "@/lib/utils"

const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "api", label: "API & Webhooks", icon: Webhook },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
]

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsSaving(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Admin Settings</h1>
                <p className="text-muted-foreground">
                    Platform configuration and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <GlassCard className="lg:col-span-1 h-fit border-red-500/10">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    activeTab === tab.id
                                        ? "bg-red-500/20 text-red-400"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </GlassCard>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === "general" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">Platform Settings</h2>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Platform Name</Label>
                                            <Input defaultValue="SwiftSocial.AI" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Support Email</Label>
                                            <Input defaultValue="support@swiftsocial.ai" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Default Currency</Label>
                                            <Input defaultValue="INR (₹)" disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Default Timezone</Label>
                                            <Input defaultValue="Asia/Kolkata (IST)" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            className="bg-gradient-to-r from-red-500 to-red-700 text-white"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            <Save className="mr-2 w-4 h-4" />
                                            {isSaving ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            </GradientCard>
                        </motion.div>
                    )}

                    {activeTab === "api" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">API Keys</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                                        <Key className="w-5 h-5 text-red-400" />
                                        <div className="flex-1">
                                            <p className="font-medium">Production API Key</p>
                                            <code className="text-sm text-muted-foreground">
                                                sk_live_••••••••••••••••••••
                                            </code>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-red-500/20">
                                            Regenerate
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                                        <Key className="w-5 h-5 text-blue-400" />
                                        <div className="flex-1">
                                            <p className="font-medium">Test API Key</p>
                                            <code className="text-sm text-muted-foreground">
                                                sk_test_••••••••••••••••••••
                                            </code>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-red-500/20">
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            </GradientCard>

                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">Webhooks</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Webhook URL</Label>
                                        <Input placeholder="https://your-server.com/webhook" />
                                    </div>
                                    <div>
                                        <Label className="mb-3 block">Events to Send</Label>
                                        <div className="space-y-3">
                                            {["call.completed", "call.failed", "agent.created", "subscription.updated"].map((event) => (
                                                <div key={event} className="flex items-center justify-between">
                                                    <span className="text-sm">{event}</span>
                                                    <Switch defaultChecked={event.includes("call")} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </GradientCard>
                        </motion.div>
                    )}

                    {activeTab === "notifications" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">Admin Notifications</h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "New Customer Signup", desc: "When a new customer signs up", default: true },
                                        { title: "Large Transaction", desc: "Transactions over ₹50,000", default: true },
                                        { title: "Customer Churn", desc: "When a customer cancels", default: true },
                                        { title: "System Alerts", desc: "Critical system issues", default: true },
                                        { title: "Weekly Summary", desc: "Platform metrics digest", default: false },
                                    ].map((item) => (
                                        <div key={item.title} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                            <Switch defaultChecked={item.default} />
                                        </div>
                                    ))}
                                </div>
                            </GradientCard>
                        </motion.div>
                    )}

                    {activeTab === "security" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">Security Settings</h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Require 2FA for Admins</p>
                                            <p className="text-sm text-muted-foreground">
                                                Force all admin users to enable 2FA
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Session Timeout</p>
                                            <p className="text-sm text-muted-foreground">
                                                Auto-logout after inactivity
                                            </p>
                                        </div>
                                        <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            <option>30 minutes</option>
                                            <option>1 hour</option>
                                            <option>4 hours</option>
                                            <option>8 hours</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">IP Whitelist</p>
                                            <p className="text-sm text-muted-foreground">
                                                Restrict admin access to specific IPs
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </GradientCard>

                            <GradientCard className="border-red-500/10">
                                <h2 className="text-lg font-semibold mb-6">Audit Log</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Recent admin actions
                                </p>
                                <div className="space-y-3">
                                    {[
                                        { action: "Updated platform settings", user: "Aditya", time: "5 mins ago" },
                                        { action: "Invited new team member", user: "Priya", time: "2 hours ago" },
                                        { action: "Regenerated API key", user: "Aditya", time: "1 day ago" },
                                    ].map((log, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <span className="text-sm">{log.action}</span>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{log.user}</span>
                                                <span>•</span>
                                                <span>{log.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GradientCard>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
