"use client"
import { Activity, Filter } from "lucide-react"
import { GradientCard } from "@/components/shared/GradientCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const MOCK_AUDIT_LOGS = [
    { id: "1", action: "Agent Created", resource: "Inbound Call Agent", user: "Aditya Sharma", ip: "103.21.58.x", time: "2 mins ago", type: "create" },
    { id: "2", action: "Campaign Started", resource: "May Outreach 2025", user: "Aditya Sharma", ip: "103.21.58.x", time: "1 hour ago", type: "update" },
    { id: "3", action: "Lead Imported", resource: "CSV Import (234 rows)", user: "Aditya Sharma", ip: "103.21.58.x", time: "3 hours ago", type: "create" },
    { id: "4", action: "Plan Upgraded", resource: "Starter → Growth", user: "Aditya Sharma", ip: "103.21.58.x", time: "Yesterday", type: "billing" },
    { id: "5", action: "API Key Regenerated", resource: "sk_live_••••", user: "Aditya Sharma", ip: "103.21.58.x", time: "Yesterday", type: "security" },
    { id: "6", action: "Agent Paused", resource: "Outbound Sales Bot", user: "Aditya Sharma", ip: "103.21.58.x", time: "2 days ago", type: "update" },
    { id: "7", action: "User Login", resource: "Web Dashboard", user: "Aditya Sharma", ip: "103.21.58.x", time: "2 days ago", type: "auth" },
    { id: "8", action: "Settings Updated", resource: "Notification Prefs", user: "Aditya Sharma", ip: "103.21.58.x", time: "3 days ago", type: "update" },
]

const TYPE_COLORS: Record<string, string> = {
    create: "bg-green-500/10 text-green-400 border-green-500/20",
    update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    billing: "bg-gold-400/10 text-gold-400 border-gold-400/20",
    security: "bg-red-500/10 text-red-400 border-red-500/20",
    auth: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

export function AuditLogTab() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gold-400" /> Audit Log
                    </h2>
                    <Button variant="outline" size="sm" className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                        <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                    </Button>
                </div>

                <div className="rounded-xl border border-gold-400/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gold-400/10 bg-gold-400/5">
                                {["Action", "Resource", "User", "IP", "Time"].map(h => (
                                    <th key={h} className="p-3 text-xs font-semibold text-gold-400 whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {MOCK_AUDIT_LOGS.map((log, i) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="hover:bg-gold-400/5 transition-colors"
                                >
                                    <td className="p-3">
                                        <Badge variant="outline" className={cn("text-[10px] whitespace-nowrap", TYPE_COLORS[log.type] || "")}>
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-sm text-muted-foreground max-w-[160px] truncate">{log.resource}</td>
                                    <td className="p-3 text-sm whitespace-nowrap">{log.user}</td>
                                    <td className="p-3 text-xs font-mono text-muted-foreground">{log.ip}</td>
                                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{log.time}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold-400">Load more →</Button>
                </div>
            </GradientCard>
        </motion.div>
    )
}
