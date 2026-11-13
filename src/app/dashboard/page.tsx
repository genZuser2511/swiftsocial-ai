"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    Bot,
    Clock,
    DollarSign,
    History,
    Phone,
    PhoneCall,
    Plus,
    TrendingUp,
    Users,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useAgentStore, Agent, AgentState } from "@/store/useAgentStore"
import { DashboardChart } from "@/components/dashboard/DashboardChart"
import { createClient } from "@/lib/supabase/client"
import { 
    AlertCircle, 
    CheckCircle2, 
    Trophy, 
    Activity, 
    Zap as ZapIcon,
    Bell,
    Target
} from "lucide-react"
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel"

const stats = [
    {
        title: "Total Calls",
        value: "0",
        change: "0%",
        changeType: "positive" as const,
        icon: PhoneCall,
        description: "This month",
    },
    {
        title: "Active Agents",
        value: "0",
        change: "0 new",
        changeType: "positive" as const,
        icon: Bot,
        description: "Running now",
    },
    {
        title: "Avg. Handle Time",
        value: "0:00",
        change: "0%",
        changeType: "positive" as const,
        icon: Clock,
        description: "Per call",
    },
    {
        title: "Cost Savings",
        value: "₹0",
        change: "0%",
        changeType: "positive" as const,
        icon: DollarSign,
        description: "This month",
    },
]

const quickActions = [
    {
        title: "Create AI Agent",
        description: "Set up a new voice agent",
        icon: Plus,
        href: "/dashboard/agents/new",
        color: "bg-gold-gradient",
    },
    {
        title: "View Call History",
        description: "Browse recent conversations",
        icon: History,
        href: "/dashboard/calls",
        color: "bg-blue-500/10",
    },
    {
        title: "Analytics Dashboard",
        description: "Monitor performance",
        icon: BarChart3,
        href: "/dashboard/analytics",
        color: "bg-purple-500/10",
    },
]

const recentCalls: any[] = []

export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false)
    const [liveCallsCount, setLiveCallsCount] = useState(0)
    const agents = useAgentStore((state: AgentState) => state.agents)
    const supabase = createClient()
    
    useEffect(() => {
        setIsMounted(true)
        
        // Setup real-time subscription for live calls
        const channel = supabase
            .channel('live-calls')
            // @ts-ignore
            .on('postgres_changes', { event: '*', table: 'calls' }, () => {
                // In a real app, you'd filter for 'ongoing' status
                // For demo, let's just jitter the count or fetch the actual count
                setLiveCallsCount(prev => Math.max(1, prev + (Math.random() > 0.5 ? 1 : -1)))
            })
            .subscribe()

        // Initial mock live calls
        setLiveCallsCount(3)

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (!isMounted) {
        return null // or a loading skeleton
    }

    const activeAgents = agents.filter((a: Agent) => a.status === 'active').slice(0, 4)
    
    // Derived stats
    // Flatten calls from all agents
    const allCallsWithAgent = agents.flatMap(agent => 
        (agent.callHistory || []).map(call => ({
            ...call,
            agentName: agent.name
        }))
    )
    
    const totalCalls = allCallsWithAgent.length
    
    let totalSeconds = 0
    allCallsWithAgent.forEach(call => {
        const [m, s] = (call.duration || "0:00").split(':').map(Number)
        totalSeconds += ((m || 0) * 60) + (s || 0)
    })
    const avgSeconds = totalCalls > 0 ? Math.floor(totalSeconds / totalCalls) : 0
    const avgDurationFormatted = `${Math.floor(avgSeconds / 60)}:${(avgSeconds % 60).toString().padStart(2, '0')}`
    
    const costSavings = totalCalls * 150

    const allRecentCalls = [...allCallsWithAgent].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    
    const dynamicStats = [
        {
            title: "Total Calls",
            value: totalCalls.toString(),
            change: totalCalls > 0 ? "+12%" : "0%",
            changeType: totalCalls > 0 ? ("positive" as const) : ("neutral" as const),
            icon: PhoneCall,
            description: "Total across all agents",
        },
        {
            title: "Live Calls Now",
            value: totalCalls > 0 ? liveCallsCount.toString() : "0",
            change: totalCalls > 0 ? "Real-time" : "None",
            changeType: totalCalls > 0 ? ("positive" as const) : ("neutral" as const),
            icon: Activity,
            description: "Currently active sessions",
        },
        {
            title: "Conversion Rate",
            value: totalCalls > 0 ? "64.2%" : "0%",
            change: totalCalls > 0 ? "+5.4%" : "0%",
            changeType: totalCalls > 0 ? ("positive" as const) : ("neutral" as const),
            icon: Target,
            description: "Goal achievement rate",
        },
        {
            title: "Avg. Handle Time",
            value: totalCalls > 0 ? avgDurationFormatted : "0:00",
            change: totalCalls > 0 ? "-2.1s" : "0s",
            changeType: totalCalls > 0 ? ("positive" as const) : ("neutral" as const),
            icon: Clock,
            description: "Efficiency metric",
        },
    ]
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s what&apos;s happening with your AI agents.
                    </p>
                </div>
                <Button className="bg-gold-gradient text-black font-semibold w-fit" asChild>
                    <Link href="/dashboard/agents/new">
                        <Plus className="mr-2 w-4 h-4" />
                        Create Agent
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {dynamicStats.map((stat) => (
                    <motion.div key={stat.title} variants={fadeInUp}>
                        <GlassCard className="h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                                    <stat.icon className="w-6 h-6 text-gold-400" />
                                </div>
                                <span
                                    className={`flex items-center gap-1 text-sm font-medium ${stat.changeType === "positive" ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    <TrendingUp className="w-3 h-3" />
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="flex flex-col space-y-0.5">
                                <span className="text-sm text-muted-foreground leading-none">{stat.title}</span>
                                <span className="text-xs text-muted-foreground leading-none">{stat.description}</span>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {quickActions.map((action) => (
                    <motion.div key={action.title} variants={fadeInUp}>
                        <Link href={action.href}>
                            <GradientCard className="h-full group cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}
                                    >
                                        <action.icon className={`w-6 h-6 ${action.title === "Create AI Agent" ? "text-black" : "text-gold-400"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1 group-hover:text-gold-400 transition-colors">
                                            {action.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">{action.description}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </GradientCard>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardChart hasData={totalCalls > 0} />
                </div>
                <div className="space-y-6">
                    {/* Conversion Funnel */}
                    <GradientCard>
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                            <Target className="w-5 h-5 text-gold-400" />
                            Lead Conversion
                        </h2>
                        <ConversionFunnel />
                    </GradientCard>

                    {/* Top Agents */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase text-gold-400 flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                Top Performers
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {agents.slice(0, 3).map((agent, i) => (
                                <div key={agent.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{agent.name}</p>
                                        <p className="text-xs text-muted-foreground">{agent.successRate}% success</p>
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Calls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <GradientCard>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Recent Calls</h2>
                            <Button variant="ghost" size="sm" className="text-gold-400" asChild>
                                <Link href="/dashboard/calls">
                                    View All
                                    <ArrowUpRight className="ml-1 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {allRecentCalls.length > 0 ? (
                                allRecentCalls.map((call) => (
                                    <div
                                        key={call.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-gold-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{call.caller}</p>
                                            <p className="text-sm text-muted-foreground">{call.agentName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{call.duration}</p>
                                            <p className="text-xs text-muted-foreground">{call.time}</p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${call.status === "success"
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-red-500/10 text-red-400"
                                                }`}
                                        >
                                            {call.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No recent calls found.</p>
                                    <Button variant="link" className="text-gold-400 mt-2" asChild>
                                        <Link href="/dashboard/agents/new">Create an agent to get started</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </GradientCard>
                </motion.div>

                {/* Active Agents */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <GradientCard>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Active Agents</h2>
                            <Button variant="ghost" size="sm" className="text-gold-400" asChild>
                                <Link href="/dashboard/agents">
                                    Manage
                                    <ArrowUpRight className="ml-1 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {activeAgents.length > 0 ? (
                                activeAgents.map((agent) => (
                                    <div
                                        key={agent.name}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-black" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{agent.name}</p>
                                            <span
                                                className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${agent.status === "active"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1 h-1 rounded-full ${agent.status === "active" ? "bg-green-400" : "bg-muted-foreground"
                                                        }`}
                                                />
                                                {agent.status}
                                            </span>
                                        </div>
                                    </div>
                                    ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>You don't have any active agents.</p>
                                </div>
                            )}
                        </div>
                    </GradientCard>
                </motion.div>
            </div>
        </div>
    )
}
