"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
    Activity,
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    BarChart3,
    Building2,
    CreditCard,
    DollarSign,
    Phone,
    TrendingUp,
    Users,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useEffect, useState } from "react"

export default function AdminPage() {
    const [metrics, setMetrics] = useState({
        totalOrgs: 0,
        totalCalls: 0,
        totalAgents: 0,
        totalRevenue: 0,
        recentOrgs: [] as any[]
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch("/api/admin/metrics")
                if (res.ok) {
                    const data = await res.json()
                    setMetrics(data.metrics)
                }
            } catch (err) {
                console.error("Failed to fetch admin metrics", err)
            } finally {
                setLoading(false)
            }
        }
        fetchMetrics()
    }, [])

    const stats = [
        {
            title: "Total Revenue",
            value: `₹${(metrics.totalRevenue / 100000).toFixed(1)}L`,
            change: "+18%",
            changeType: "positive",
            icon: DollarSign,
            period: "This month",
        },
        {
            title: "Active Customers",
            value: metrics.totalOrgs.toString(),
            change: "+12",
            changeType: "positive",
            icon: Users,
            period: "vs last month",
        },
        {
            title: "Total Calls",
            value: metrics.totalCalls > 1000 ? `${(metrics.totalCalls / 1000).toFixed(1)}K` : metrics.totalCalls.toString(),
            change: "+23%",
            changeType: "positive",
            icon: Phone,
            period: "This month",
        },
        {
            title: "Active Agents",
            value: metrics.totalAgents.toString(),
            change: "+15%",
            changeType: "positive",
            icon: TrendingUp,
            period: "vs last month",
        },
    ]

    type ActivityItem = { type: string; customer: string; plan: string; time: string; amount?: string };
    const recentActivity: ActivityItem[] = metrics.recentOrgs.map(org => ({
        type: "signup", 
        customer: org.name, 
        plan: "Trial", 
        time: new Date(org.created_at).toLocaleDateString()
    }))

    // Fallback if recentActivity is empty
    if (recentActivity.length === 0) {
        recentActivity.push({ type: "signup", customer: "TechCorp Ltd (Mock)", plan: "Hybrid", time: "5 mins ago" })
    }

    const topCustomers = [
        { name: "TechSupport India", revenue: "₹3.2L", calls: "125K", plan: "Autonomous" },
        { name: "SalesForce Pro", revenue: "₹2.8L", calls: "98K", plan: "Autonomous" },
        { name: "E-Commerce Plus", revenue: "₹1.9L", calls: "67K", plan: "Hybrid" },
        { name: "InsureTech", revenue: "₹1.5L", calls: "52K", plan: "Hybrid" },
    ]

    const systemHealth = [
        { name: "API Uptime", value: "99.99%", status: "healthy" },
        { name: "Avg Response", value: "45ms", status: "healthy" },
        { name: "Active Agents", value: metrics.totalAgents.toString(), status: "healthy" },
        { name: "Queue Length", value: "23", status: "warning" },
    ]
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Admin Overview</h1>
                    <p className="text-muted-foreground">
                        Platform metrics and system health
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-red-500/20">
                        Export Report
                    </Button>
                    <Button className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                        <Zap className="mr-2 w-4 h-4" />
                        Quick Actions
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
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
                                <span
                                    className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    {stat.changeType === "positive" ? (
                                        <ArrowUp className="w-3 h-3" />
                                    ) : (
                                        <ArrowDown className="w-3 h-3" />
                                    )}
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{stat.title}</span>
                                <span className="text-xs text-muted-foreground">{stat.period}</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <GradientCard className="border-red-500/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                        <Button variant="ghost" size="sm" className="text-red-400" asChild>
                            <Link href="/admin/customers">
                                View All
                                <ArrowUpRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === "signup"
                                            ? "bg-green-500/10"
                                            : activity.type === "upgrade"
                                                ? "bg-blue-500/10"
                                                : activity.type === "payment"
                                                    ? "bg-gold-400/10"
                                                    : "bg-red-500/10"
                                        }`}
                                >
                                    {activity.type === "signup" ? (
                                        <Users className="w-5 h-5 text-green-400" />
                                    ) : activity.type === "upgrade" ? (
                                        <TrendingUp className="w-5 h-5 text-blue-400" />
                                    ) : activity.type === "payment" ? (
                                        <CreditCard className="w-5 h-5 text-gold-400" />
                                    ) : (
                                        <ArrowDown className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{activity.customer}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.type === "payment"
                                            ? `Payment: ${activity.amount}`
                                            : `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - ${activity.plan}`}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Top Customers */}
                <GradientCard className="border-red-500/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Top Customers</h2>
                        <Button variant="ghost" size="sm" className="text-red-400" asChild>
                            <Link href="/admin/customers">
                                View All
                                <ArrowUpRight className="ml-1 w-4 h-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {topCustomers.map((customer) => (
                            <div
                                key={customer.name}
                                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{customer.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {customer.calls} calls • {customer.plan}
                                    </p>
                                </div>
                                <span className="font-bold text-green-400">{customer.revenue}</span>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* System Health */}
            <GlassCard className="border-red-500/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">System Health</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-green-400">All Systems Operational</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {systemHealth.map((item) => (
                        <div key={item.name} className="p-4 rounded-lg bg-muted/30 text-center">
                            <div
                                className={`text-2xl font-bold mb-1 ${item.status === "healthy" ? "text-green-400" : "text-yellow-400"
                                    }`}
                            >
                                {item.value}
                            </div>
                            <div className="text-sm text-muted-foreground">{item.name}</div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    )
}
