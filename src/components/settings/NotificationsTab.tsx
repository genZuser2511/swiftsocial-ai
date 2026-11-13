"use client"
import { Bell, Mail, MessageSquare, Phone, AlertTriangle, TrendingDown, Zap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/shared/GradientCard"
import { motion } from "framer-motion"

const NOTIFICATION_GROUPS = [
    {
        title: "Call Alerts",
        icon: Phone,
        items: [
            { key: "missed_call", label: "Missed Calls", desc: "Alert when a call goes unanswered", email: true, sms: false },
            { key: "call_complete", label: "Call Completed", desc: "Summary after every call ends", email: true, sms: false },
            { key: "call_error", label: "Agent Errors", desc: "When an AI agent fails mid-call", email: true, sms: true },
        ]
    },
    {
        title: "Campaign Alerts",
        icon: Zap,
        items: [
            { key: "campaign_complete", label: "Campaign Completed", desc: "When a campaign finishes running", email: true, sms: false },
            { key: "campaign_failed", label: "Campaign Failed", desc: "When a campaign encounters critical errors", email: true, sms: true },
        ]
    },
    {
        title: "Billing Alerts",
        icon: TrendingDown,
        items: [
            { key: "low_balance", label: "Low Minute Balance", desc: "When you're below 20% of minutes", email: true, sms: true },
            { key: "payment_success", label: "Payment Successful", desc: "Confirmation after each payment", email: true, sms: false },
            { key: "payment_failed", label: "Payment Failed", desc: "When a payment attempt is declined", email: true, sms: true },
        ]
    },
    {
        title: "System Alerts",
        icon: AlertTriangle,
        items: [
            { key: "weekly_report", label: "Weekly Report", desc: "Analytics digest every Monday 9 AM", email: true, sms: false },
            { key: "marketing", label: "Product Updates", desc: "New features and announcements", email: false, sms: false },
        ]
    },
]

export function NotificationsTab() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-5 h-5 text-gold-400" />
                    <h2 className="text-lg font-semibold">Notification Preferences</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Choose how and when you receive alerts.</p>

                <div className="flex items-center gap-8 mb-6 pb-4 border-b border-gold-400/10">
                    <div className="flex items-center gap-2 ml-auto">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</span>
                    </div>
                    <div className="flex items-center gap-2 w-14 justify-center">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SMS</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {NOTIFICATION_GROUPS.map(group => (
                        <div key={group.title}>
                            <div className="flex items-center gap-2 mb-4">
                                <group.icon className="w-4 h-4 text-gold-400" />
                                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">{group.title}</h3>
                            </div>
                            <div className="space-y-4">
                                {group.items.map(item => (
                                    <div key={item.key} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <Switch defaultChecked={item.email} />
                                            <div className="w-14 flex justify-center">
                                                <Switch defaultChecked={item.sms} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </GradientCard>
        </motion.div>
    )
}
