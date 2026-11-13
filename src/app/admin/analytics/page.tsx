"use client"

import { motion } from "framer-motion"
import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    Calendar,
    Download,
    Globe,
    MapPin,
    Phone,
    TrendingUp,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const stats = [
    { title: "Total Calls", value: "2.5M", change: "+23%", changeType: "positive", icon: Phone },
    { title: "Active Users", value: "1,847", change: "+12%", changeType: "positive", icon: Users },
    { title: "Avg Call Duration", value: "2:34", change: "-8%", changeType: "positive", icon: TrendingUp },
    { title: "Success Rate", value: "87.3%", change: "+2.1%", changeType: "positive", icon: BarChart3 },
]

const topRegions = [
    { name: "Maharashtra", calls: "520K", percentage: 21 },
    { name: "Karnataka", calls: "380K", percentage: 15 },
    { name: "Delhi NCR", calls: "340K", percentage: 14 },
    { name: "Tamil Nadu", calls: "290K", percentage: 12 },
    { name: "Gujarat", calls: "250K", percentage: 10 },
]

const callsByHour = [
    { hour: "00", calls: 12000 },
    { hour: "04", calls: 8000 },
    { hour: "08", calls: 45000 },
    { hour: "12", calls: 89000 },
    { hour: "16", calls: 92000 },
    { hour: "20", calls: 56000 },
]

const topAgentTypes = [
    { type: "Customer Support", calls: "1.2M", percentage: 48 },
    { type: "Sales Outreach", calls: "680K", percentage: 27 },
    { type: "Appointment Booking", calls: "380K", percentage: 15 },
    { type: "Survey/Feedback", calls: "240K", percentage: 10 },
]

export default function AdminAnalyticsPage() {
    const maxCalls = Math.max(...callsByHour.map((h) => h.calls))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Platform Analytics</h1>
                    <p className="text-muted-foreground">
                        Usage metrics across all customers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-red-500/20">
                        <Calendar className="mr-2 w-4 h-4" />
                        Last 30 days
                    </Button>
                    <Button variant="outline" className="border-red-500/20">
                        <Download className="mr-2 w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {stats.map((stat) => (
                    <motion.div key={stat.title} variants={fadeInUp}>
                        <GlassCard className="border-red-500/10">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-red-400" />
                                </div>
                                <span className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" : "text-red-400"
                                    }`}>
                                    {stat.changeType === "positive" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.title}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calls by Hour */}
                <GradientCard className="border-red-500/10">
                    <h2 className="text-lg font-semibold mb-6">Calls by Hour (Today)</h2>
                    <div className="h-48 flex items-end gap-4">
                        {callsByHour.map((data) => (
                            <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs">{(data.calls / 1000).toFixed(0)}K</span>
                                <div
                                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-sm"
                                    style={{ height: `${(data.calls / maxCalls) * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{data.hour}:00</span>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Top Regions */}
                <GradientCard className="border-red-500/10">
                    <div className="flex items-center gap-2 mb-6">
                        <MapPin className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-semibold">Top Regions</h2>
                    </div>
                    <div className="space-y-4">
                        {topRegions.map((region) => (
                            <div key={region.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{region.name}</span>
                                    <span className="text-sm text-muted-foreground">{region.calls}</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                        style={{ width: `${region.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Agent Types */}
            <GradientCard className="border-red-500/10">
                <h2 className="text-lg font-semibold mb-6">Calls by Agent Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topAgentTypes.map((agent) => (
                        <div key={agent.type} className="p-4 rounded-lg bg-muted/30 text-center">
                            <div className="text-2xl font-bold text-red-400 mb-1">{agent.calls}</div>
                            <div className="text-sm text-muted-foreground mb-2">{agent.type}</div>
                            <div className="text-xs text-muted-foreground">{agent.percentage}% of total</div>
                        </div>
                    ))}
                </div>
            </GradientCard>
        </div>
    )
}
