"use client"

import { useEffect, useState } from "react"
import { 
    Zap, 
    Plus, 
    MoreHorizontal, 
    Settings, 
    Play, 
    ArrowRight,
    MessageSquare,
    Mail,
    Tag as TagIcon,
    Webhook,
    CheckCircle2,
    Search,
    Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useAgentStore } from "@/store/useAgentStore"
import { motion } from "framer-motion"
import Link from "next/link"

export default function WorkflowsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { workflows, fetchWorkflows, isLoading, deleteWorkflow, toggleWorkflowStatus } = useAgentStore()
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setIsMounted(true)
        fetchWorkflows()
    }, [fetchWorkflows])

    if (!isMounted) return null

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Workflows</h1>
                    <p className="text-muted-foreground mt-1">Automate actions based on AI conversation outcomes.</p>
                </div>
                <Button className="bg-gold-gradient text-black font-semibold hover:opacity-90" asChild>
                    <Link href="/dashboard/workflows/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Workflow
                    </Link>
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5">
                    <p className="text-sm text-muted-foreground mb-1">Total Workflows</p>
                    <p className="text-2xl font-bold text-white">{workflows.length}</p>
                </div>
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5">
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-400">{workflows.filter(w => w.isActive).length}</p>
                </div>
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5">
                    <p className="text-sm text-muted-foreground mb-1">Automations Ran (24h)</p>
                    <p className="text-2xl font-bold text-white">124</p>
                </div>
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5">
                    <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-gold-400">98.2%</p>
                </div>
            </div>

            {/* Workflow List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                        <div key={i} className="bg-card border border-gold-400/10 rounded-2xl p-6 h-24 animate-pulse" />
                    ))
                ) : workflows.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground border border-dashed border-gold-400/20 rounded-2xl bg-card/20">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <h3 className="text-lg font-semibold text-white">No active workflows</h3>
                        <p className="max-w-xs mx-auto mt-2">Workflows let you automatically send SMS, update contact tags, or trigger webhooks after a call ends.</p>
                    </div>
                ) : (
                    workflows.map((workflow) => (
                        <motion.div 
                            key={workflow.id}
                            className="bg-card border border-gold-400/10 rounded-2xl p-5 flex items-center justify-between group hover:border-gold-400/30 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 shrink-0">
                                    {workflow.actionType === 'send_sms' ? <MessageSquare className="w-6 h-6" /> :
                                     workflow.actionType === 'send_email' ? <Mail className="w-6 h-6" /> :
                                     workflow.actionType === 'webhook' ? <Webhook className="w-6 h-6" /> :
                                     <TagIcon className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">
                                        {workflow.name}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Play className="w-3 h-3 text-gold-400" />
                                            If {workflow.triggerEvent.replace('_', ' ')}
                                        </span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-gold-400" />
                                            Then {workflow.actionType.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Status</p>
                                    <p className={workflow.isActive ? 'text-green-400 text-sm font-medium' : 'text-muted-foreground text-sm font-medium'}>
                                        {workflow.isActive ? 'Active' : 'Disabled'}
                                    </p>
                                </div>
                                <Switch checked={workflow.isActive} onCheckedChange={() => toggleWorkflowStatus(workflow.id)} className="data-[state=checked]:bg-gold-gradient" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem 
                                            className="text-red-400 focus:text-red-400"
                                            onClick={() => deleteWorkflow(workflow.id)}
                                        >
                                            <Trash2 className="mr-2 w-4 h-4" />
                                            Delete Workflow
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>
                    ))
                )}

                {/* Demo Workflow Example (if empty) */}
                {workflows.length === 0 && (
                    <div className="opacity-50 pointer-events-none grayscale">
                         <div className="bg-card border border-gold-400/10 rounded-2xl p-5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 shrink-0">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-1">Post-Call Auto-SMS</h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span>If call_completed</span>
                                        <ArrowRight className="w-3 h-3" />
                                        <span>Then send_sms</span>
                                    </div>
                                </div>
                            </div>
                            <Switch checked={true} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
