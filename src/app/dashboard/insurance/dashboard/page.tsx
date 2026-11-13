"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Calendar,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    PieChart,
    ShieldAlert,
    TrendingUp,
    Users
} from "lucide-react"
import { GradientCard } from "@/components/shared/GradientCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Area,
    AreaChart,
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts"

// Mock Data
const KPIS = [
    { title: "Total Premium Value", value: "₹42,50,000", change: "+12.5%", icon: DollarSign, color: "text-gold-400", bg: "bg-gold-400/10" },
    { title: "Active Policies", value: "1,248", change: "+5.2%", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Renewals Due (30d)", value: "45", change: "-2.1%", icon: Calendar, color: "text-orange-400", bg: "bg-orange-400/10" },
    { title: "Open Claims", value: "12", change: "+1", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10" },
]

const REVENUE_DATA = [
    { month: "Jan", premium: 2500000 },
    { month: "Feb", premium: 2800000 },
    { month: "Mar", premium: 3100000 },
    { month: "Apr", premium: 3500000 },
    { month: "May", premium: 4250000 },
]

const POLICY_TYPES = [
    { name: "Life", value: 45, color: "#eab308" }, // Gold
    { name: "Health", value: 30, color: "#3b82f6" }, // Blue
    { name: "Auto", value: 15, color: "#8b5cf6" }, // Purple
    { name: "Home", value: 10, color: "#10b981" }, // Green
]

const PIPELINE_DATA = [
    { stage: "New Lead", count: 120 },
    { stage: "Assessment", count: 85 },
    { stage: "Quote Sent", count: 45 },
    { stage: "Follow-up", count: 28 },
    { stage: "Closing", count: 12 },
]

const ALERTS = [
    { id: 1, type: "urgent", message: "8 high-value policies expiring in next 7 days", time: "2 hours ago" },
    { id: 2, type: "warning", message: "4 open claims with no update in 7 days", time: "5 hours ago" },
    { id: 3, type: "info", message: "12 missed follow-ups from yesterday", time: "1 day ago" },
]

export default function InsuranceDashboardPage() {
    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Insurance Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Overview of your agency's performance and active pipeline.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        This Month
                    </Button>
                    <Button className="bg-gold-gradient text-black font-semibold">
                        <Activity className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {KPIS.map((kpi, i) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GradientCard className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.title}</p>
                                    <h3 className="text-2xl font-bold">{kpi.value}</h3>
                                </div>
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", kpi.bg)}>
                                    <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Badge variant="secondary" className={cn(
                                    "bg-opacity-20 border-0",
                                    kpi.change.startsWith("+") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                )}>
                                    {kpi.change}
                                </Badge>
                                <span className="text-xs text-muted-foreground">vs last month</span>
                            </div>
                        </GradientCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Premium Trend */}
                <GradientCard className="lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Premium Revenue Trend</h2>
                            <p className="text-sm text-muted-foreground">Monthly booked premiums (INR)</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400">
                            <TrendingUp className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis 
                                    stroke="#ffffff40" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `₹${value / 100000}L`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f1117", borderColor: "#eab30840", borderRadius: "8px" }}
                                    itemStyle={{ color: "#eab308" }}
                                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Premium"] as any}
                                />
                                <Area type="monotone" dataKey="premium" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorPremium)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GradientCard>

                {/* Alerts Panel */}
                <GradientCard className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            Action Items
                        </h2>
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">{ALERTS.length} Alerts</Badge>
                    </div>
                    <div className="space-y-4 flex-1">
                        {ALERTS.map((alert) => (
                            <div key={alert.id} className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-gold-400/20 transition-colors">
                                <div className="flex gap-3">
                                    <div className="mt-0.5">
                                        {alert.type === 'urgent' && <AlertCircle className="w-4 h-4 text-red-400" />}
                                        {alert.type === 'warning' && <Clock className="w-4 h-4 text-orange-400" />}
                                        {alert.type === 'info' && <Users className="w-4 h-4 text-blue-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-snug">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1.5">{alert.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-gold-400 hover:text-gold-300 hover:bg-gold-400/10">
                        View All Actions <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                </GradientCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pipeline Funnel */}
                <GradientCard>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Active Pipeline</h2>
                            <p className="text-sm text-muted-foreground">Contacts by stage</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gold-400">
                            View Board <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {PIPELINE_DATA.map((stage, i) => {
                            const max = PIPELINE_DATA[0].count;
                            const percentage = (stage.count / max) * 100;
                            
                            return (
                                <div key={stage.stage} className="relative h-12 w-full bg-muted/20 rounded-lg overflow-hidden flex items-center px-4">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="absolute left-0 top-0 bottom-0 bg-gold-400/20 border-r border-gold-400/50"
                                    />
                                    <div className="relative z-10 w-full flex justify-between items-center">
                                        <span className="text-sm font-medium">{stage.stage}</span>
                                        <span className="font-bold text-gold-400">{stage.count}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </GradientCard>

                {/* Policy Distribution */}
                <GradientCard>
                    <h2 className="text-lg font-semibold mb-2">Policy Distribution</h2>
                    <p className="text-sm text-muted-foreground mb-6">Breakdown by policy type</p>
                    
                    <div className="flex items-center justify-center h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={POLICY_TYPES}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {POLICY_TYPES.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: "#0f1117", borderColor: "#333", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {POLICY_TYPES.map(type => (
                            <div key={type.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                <span className="text-sm text-muted-foreground">{type.name}</span>
                                <span className="text-sm font-medium">{type.value}%</span>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>
        </div>
    )
}
