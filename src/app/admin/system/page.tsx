"use client"

import { motion } from "framer-motion"
import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Cpu,
    Database,
    HardDrive,
    MemoryStick,
    RefreshCw,
    Server,
    Wifi,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const systemMetrics = [
    { title: "API Uptime", value: "99.99%", status: "healthy", icon: Activity },
    { title: "Avg Response", value: "45ms", status: "healthy", icon: Zap },
    { title: "Active Connections", value: "12,847", status: "healthy", icon: Wifi },
    { title: "Queue Length", value: "23", status: "warning", icon: Clock },
]

const serverHealth = [
    { name: "API Server 1", cpu: 45, memory: 62, status: "healthy", region: "Mumbai" },
    { name: "API Server 2", cpu: 38, memory: 55, status: "healthy", region: "Mumbai" },
    { name: "API Server 3", cpu: 52, memory: 71, status: "healthy", region: "Bangalore" },
    { name: "Voice Server 1", cpu: 78, memory: 82, status: "warning", region: "Mumbai" },
    { name: "Voice Server 2", cpu: 42, memory: 58, status: "healthy", region: "Bangalore" },
]

const recentIncidents = [
    { title: "High latency on Voice Server 1", status: "investigating", time: "10 mins ago" },
    { title: "Database connection spike resolved", status: "resolved", time: "2 hours ago" },
    { title: "Scheduled maintenance completed", status: "resolved", time: "1 day ago" },
]

const services = [
    { name: "Voice API", status: "operational", uptime: "99.99%" },
    { name: "Authentication", status: "operational", uptime: "100%" },
    { name: "Database", status: "operational", uptime: "99.98%" },
    { name: "Analytics", status: "operational", uptime: "99.95%" },
    { name: "Webhooks", status: "degraded", uptime: "98.50%" },
    { name: "File Storage", status: "operational", uptime: "99.99%" },
]

export default function SystemPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">System Health</h1>
                    <p className="text-muted-foreground">
                        Infrastructure monitoring and status
                    </p>
                </div>
                <Button variant="outline" className="border-red-500/20 w-fit">
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* System Metrics */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {systemMetrics.map((metric) => (
                    <motion.div key={metric.title} variants={fadeInUp}>
                        <GlassCard className="border-red-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <metric.icon className="w-6 h-6 text-red-400" />
                                </div>
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${metric.status === "healthy" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                                    }`}>
                                    {metric.status === "healthy" ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {metric.status}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{metric.value}</div>
                            <div className="text-sm text-muted-foreground">{metric.title}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Server Health */}
                <GradientCard className="border-red-500/10">
                    <div className="flex items-center gap-2 mb-6">
                        <Server className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-semibold">Server Health</h2>
                    </div>
                    <div className="space-y-4">
                        {serverHealth.map((server) => (
                            <div key={server.name} className="p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${server.status === "healthy" ? "bg-green-400" : "bg-yellow-400"
                                            }`} />
                                        <span className="font-medium">{server.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{server.region}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                            <Cpu className="w-3 h-3" /> CPU
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${server.cpu > 70 ? "bg-yellow-500" : "bg-green-500"
                                                    }`}
                                                style={{ width: `${server.cpu}%` }}
                                            />
                                        </div>
                                        <span className="text-xs">{server.cpu}%</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                            <MemoryStick className="w-3 h-3" /> Memory
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${server.memory > 70 ? "bg-yellow-500" : "bg-green-500"
                                                    }`}
                                                style={{ width: `${server.memory}%` }}
                                            />
                                        </div>
                                        <span className="text-xs">{server.memory}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Services Status */}
                <div className="space-y-6">
                    <GradientCard className="border-red-500/10">
                        <h2 className="text-lg font-semibold mb-6">Service Status</h2>
                        <div className="space-y-3">
                            {services.map((service) => (
                                <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${service.status === "operational" ? "bg-green-400" : "bg-yellow-400"
                                            }`} />
                                        <span className="font-medium">{service.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">{service.uptime}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${service.status === "operational" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                                            }`}>
                                            {service.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GradientCard>

                    {/* Recent Incidents */}
                    <GlassCard className="border-red-500/10">
                        <h2 className="text-lg font-semibold mb-4">Recent Incidents</h2>
                        <div className="space-y-3">
                            {recentIncidents.map((incident, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <span className={`mt-1 w-2 h-2 rounded-full ${incident.status === "resolved" ? "bg-green-400" : "bg-yellow-400"
                                        }`} />
                                    <div>
                                        <p className="text-sm font-medium">{incident.title}</p>
                                        <p className="text-xs text-muted-foreground">{incident.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
