"use client"

import { motion } from "framer-motion"
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    CreditCard,
    DollarSign,
    Download,
    TrendingDown,
    TrendingUp,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const stats = [
    {
        title: "Total MRR",
        value: "₹42.5L",
        change: "+18%",
        changeType: "positive",
        icon: DollarSign,
    },
    {
        title: "ARR",
        value: "₹5.1Cr",
        change: "+22%",
        changeType: "positive",
        icon: TrendingUp,
    },
    {
        title: "ARPU",
        value: "₹8,112",
        change: "+5%",
        changeType: "positive",
        icon: Users,
    },
    {
        title: "Churn Rate",
        value: "2.3%",
        change: "-0.5%",
        changeType: "positive",
        icon: TrendingDown,
    },
]

const monthlyRevenue = [
    { month: "Sep", revenue: 28, growth: 12 },
    { month: "Oct", revenue: 31, growth: 10 },
    { month: "Nov", revenue: 35, growth: 13 },
    { month: "Dec", revenue: 38, growth: 8 },
    { month: "Jan", revenue: 42, growth: 10 },
    { month: "Feb", revenue: 42.5, growth: 1 },
]

const revenueByPlan = [
    { plan: "Autonomous", revenue: "₹18.5L", percentage: 44, customers: 156 },
    { plan: "Hybrid", revenue: "₹15.2L", percentage: 36, customers: 234 },
    { plan: "Co-Pilot", revenue: "₹8.8L", percentage: 20, customers: 134 },
]

const recentTransactions = [
    { customer: "TechSupport India", amount: "₹75,000", type: "subscription", date: "Feb 3" },
    { customer: "SalesForce Pro", amount: "₹12,500", type: "usage", date: "Feb 3" },
    { customer: "E-Commerce Plus", amount: "₹45,000", type: "subscription", date: "Feb 2" },
    { customer: "InsureTech", amount: "₹8,200", type: "usage", date: "Feb 2" },
    { customer: "HealthCall Pro", amount: "₹10,000", type: "subscription", date: "Feb 1" },
]

export default function RevenuePage() {
    const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Revenue</h1>
                    <p className="text-muted-foreground">
                        Financial metrics and transaction history
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-red-500/20">
                        <Calendar className="mr-2 w-4 h-4" />
                        Last 6 months
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
                            <div className="text-sm text-muted-foreground">{stat.title}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Chart */}
                <GradientCard className="border-red-500/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Monthly Revenue (₹ Lakhs)</h2>
                    </div>
                    <div className="h-48 flex items-end gap-4">
                        {monthlyRevenue.map((data) => (
                            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-sm font-medium">₹{data.revenue}L</span>
                                <div
                                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-sm"
                                    style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </GradientCard>

                {/* Revenue by Plan */}
                <GradientCard className="border-red-500/10">
                    <h2 className="text-lg font-semibold mb-6">Revenue by Plan</h2>
                    <div className="space-y-6">
                        {revenueByPlan.map((plan) => (
                            <div key={plan.plan}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="font-medium">{plan.plan}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({plan.customers} customers)
                                        </span>
                                    </div>
                                    <span className="font-bold">{plan.revenue}</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                        style={{ width: `${plan.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GradientCard>
            </div>

            {/* Recent Transactions */}
            <GradientCard className="border-red-500/10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                    <Button variant="ghost" size="sm" className="text-red-400">
                        View All
                    </Button>
                </div>
                <div className="space-y-4">
                    {recentTransactions.map((tx, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "subscription" ? "bg-green-500/10" : "bg-blue-500/10"
                                    }`}
                            >
                                <CreditCard
                                    className={`w-5 h-5 ${tx.type === "subscription" ? "text-green-400" : "text-blue-400"
                                        }`}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{tx.customer}</p>
                                <p className="text-sm text-muted-foreground capitalize">{tx.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-400">{tx.amount}</p>
                                <p className="text-xs text-muted-foreground">{tx.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GradientCard>
        </div>
    )
}
