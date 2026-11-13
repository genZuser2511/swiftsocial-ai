"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    Bot,
    Copy,
    Edit,
    MoreHorizontal,
    Pause,
    Phone,
    Play,
    Plus,
    Settings,
    Trash2,
    TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useAgentStore, type Agent } from "@/store/useAgentStore"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAgentDeployStatus } from "@/hooks/useAgentDeployStatus"

// Child component so we can use hooks efficiently in the loop mapped render
function AgentGridItem({ 
    agent, 
    toggleAgentStatus, 
    setAgentToDelete 
}: { 
    agent: Agent; 
    toggleAgentStatus: (id: string) => void; 
    setAgentToDelete: (a: Agent) => void; 
}) {
    const { isLive, text: deployText } = useAgentDeployStatus(agent.createdAt || new Date().toISOString(), agent.name)

    return (
        <GradientCard className="h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center relative">
                        <Bot className="w-6 h-6 text-black" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black border border-gold-400 flex items-center justify-center">
                            {agent.agentType === 'inbound' ? <Phone className="w-3 h-3 text-gold-400" /> : <TrendingUp className="w-3 h-3 text-gold-400" />}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            {agent.name}
                            {agent.name.includes('Inbound') || agent.name.includes('Outbound') ? (
                                <span className="text-[10px] bg-gold-400/10 text-gold-400 px-1.5 py-0.5 rounded border border-gold-400/20">System</span>
                            ) : null}
                        </h3>
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                !isLive ? "text-blue-400" :
                                agent.status === "active" ? "text-green-400" : "text-muted-foreground"
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    !isLive ? "bg-blue-400" : 
                                    agent.status === "active" ? "bg-green-400" : "bg-muted-foreground"
                                }`}
                            />
                            {!isLive ? `Deploying in ${deployText}` : agent.status}
                        </span>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isLive ? (
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/agents/${agent.id}/edit`}>
                                    <Edit className="mr-2 w-4 h-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem disabled>
                                <Edit className="mr-2 w-4 h-4" />
                                Edit (Locked)
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled={!isLive}>
                            <Copy className="mr-2 w-4 h-4" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={!isLive}>
                            <Settings className="mr-2 w-4 h-4" />
                            Configure
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => toggleAgentStatus(agent.id)}
                            disabled={!isLive}
                        >
                            {agent.status === "active" ? (
                                <>
                                    <Pause className="mr-2 w-4 h-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 w-4 h-4" />
                                    Resume
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-400 focus:text-red-400"
                            onSelect={(e) => {
                                e.preventDefault();
                                if (agent.name === 'Inbound call agent' || agent.name === 'Outbound call agent') {
                                    alert("Default agents cannot be deleted.");
                                    return;
                                }
                                setAgentToDelete(agent);
                            }}
                            disabled={agent.name === 'Inbound call agent' || agent.name === 'Outbound call agent'}
                        >
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                {agent.description || "No description provided."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                 <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full border border-gold-400/10 text-muted-foreground uppercase tracking-tight">
                    {agent.agentType || 'Both'}
                </span>
                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full border border-gold-400/10 text-muted-foreground truncate max-w-[150px]">
                    Goal: {agent.goalObjective || 'General'}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
                <div className="text-center">
                    <div className="text-lg font-bold">{agent.calls.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Calls</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold">{agent.avgDuration}</div>
                    <div className="text-xs text-muted-foreground">Avg Duration</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{agent.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold-400/10">
                <span className="text-xs text-muted-foreground">
                    {agent.language}
                </span>
                <Button variant="ghost" size="sm" className="text-gold-400" asChild>
                    <Link href={`/dashboard/agents/${agent.id}`}>
                        View Details
                    </Link>
                </Button>
            </div>
        </GradientCard>
    )
}

export default function AgentsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { agents, toggleAgentStatus, deleteAgent, fetchAgents, hasFetched, isLoading } = useAgentStore()
    const [filter, setFilter] = useState<"all" | "active" | "paused">("all")
    const [typeFilter, setTypeFilter] = useState<"all" | "inbound" | "outbound">("all")
    const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)

    useEffect(() => {
        setIsMounted(true)
        fetchAgents() // Force fetch to avoid state caching on client navigation
    }, [fetchAgents])

    if (!isMounted) {
        return null
    }

    const filteredAgents = agents.filter((agent) => {
        // Use fallbacks for status and type to ensure old data shows up
        const agentStatus = agent.status || 'active'
        const agentType = agent.agentType || 'both'

        const matchesStatus = filter === "all" || agentStatus === filter
        
        // Robust type matching: 'both' or missing type matches everything
        const matchesType = 
            typeFilter === "all" || 
            agentType === typeFilter || 
            agentType === 'both';
            
        return matchesStatus && matchesType
    })
    
    const confirmDelete = () => {
        if (agentToDelete) {
            deleteAgent(agentToDelete.id)
            setAgentToDelete(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">AI Agents</h1>
                    <p className="text-muted-foreground">
                        Manage and configure your voice agents
                    </p>
                </div>
                <Button className="bg-gold-gradient text-black font-semibold w-fit" asChild>
                    <Link href="/dashboard/agents/new">
                        <Plus className="mr-2 w-4 h-4" />
                        Create Agent
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mr-2">Status:</span>
                    {["all", "active", "paused"].map((status) => (
                        <Button
                            key={status}
                            variant={filter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(status as any)}
                            className={filter === status ? "bg-gold-gradient text-black" : "border-gold-400/20 hover:text-gold-400"}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mr-2 ml-0 sm:ml-4">Type:</span>
                    {["all", "inbound", "outbound"].map((type) => (
                        <Button
                            key={type}
                            variant={typeFilter === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTypeFilter(type as any)}
                            className={typeFilter === type ? "bg-gold-gradient text-black" : "border-gold-400/20 hover:text-gold-400"}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Agents Grid */}
            <motion.div
                key={filteredAgents.length}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                {filteredAgents.map((agent) => (
                    <motion.div key={agent.id} variants={fadeInUp}>
                        <AgentGridItem 
                            agent={agent} 
                            toggleAgentStatus={toggleAgentStatus} 
                            setAgentToDelete={setAgentToDelete} 
                        />
                    </motion.div>
                ))}

                {/* Create New Agent Card */}
                <motion.div variants={fadeInUp}>
                    <Link href="/dashboard/agents/new">
                        <GlassCard className="h-full min-h-[280px] flex flex-col items-center justify-center gap-4 border-dashed border-2 border-gold-400/20 hover:border-gold-400/40 cursor-pointer transition-colors">
                            <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center">
                                <Plus className="w-8 h-8 text-gold-400" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold mb-1">Create New Agent</h3>
                                <p className="text-sm text-muted-foreground">
                                    Set up a new AI voice agent
                                </p>
                            </div>
                        </GlassCard>
                    </Link>
                </motion.div>
            </motion.div>

            <Dialog open={!!agentToDelete} onOpenChange={(open) => !open && setAgentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete <strong>{agentToDelete?.name}</strong> and remove all of its associated call history and training data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAgentToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Yes, delete agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
