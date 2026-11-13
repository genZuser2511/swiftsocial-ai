"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeft,
    Bot,
    Calendar,
    Clock,
    Edit,
    MoreHorizontal,
    Pause,
    Phone,
    Play,
    Settings,
    Trash2,
    Zap,
    MessageSquare,
    Mic,
    Globe,
    Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { AudioPlayer } from "@/components/shared/AudioPlayer"
import { cn } from "@/lib/utils"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useAgentStore } from "@/store/useAgentStore"
import { useKnowledgeStore } from "@/store/useKnowledgeStore"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAgentDeployStatus } from "@/hooks/useAgentDeployStatus"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function AgentDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    
    const [isMounted, setIsMounted] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const agent = useAgentStore((state) => state.agents.find((a) => a.id === id))
    const documents = useKnowledgeStore((state) => state.documents)
    
    const assignedDocsCount = documents.filter(d => d.agentIds.includes(id) && d.type === 'document').length
    const assignedLinksCount = documents.filter(d => d.agentIds.includes(id) && d.type === 'link').length

    const toggleStatus = useAgentStore((state) => state.toggleAgentStatus)
    const deleteAgent = useAgentStore((state) => state.deleteAgent)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const [selectedCall, setSelectedCall] = useState<string | null>(null)

    // Derived deployment status hook
    const { isLive, text: deployText } = useAgentDeployStatus(agent?.createdAt || new Date().toISOString(), agent?.name || "")

    if (!isMounted) return null

    if (!agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Agent Not Found</h2>
                    <p className="text-muted-foreground">The agent you are looking for does not exist or has been deleted.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/agents">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Agents
                    </Link>
                </Button>
            </div>
        )
    }

    const isProtected = agent.name === 'Inbound call agent' || agent.name === 'Outbound call agent';

    const handleDelete = () => {
        if (isProtected) {
            alert("Default agents cannot be deleted.");
            return;
        }
        setIsDeleteDialogOpen(true);
    }
    
    const confirmDelete = () => {
        deleteAgent(agent.id);
        setIsDeleteDialogOpen(false);
        router.push("/dashboard/agents");
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/agents">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center shrink-0">
                            <Bot className="w-10 h-10 text-black" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-bold">{agent.name}</h1>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium",
                                    !isLive ? "bg-blue-500/10 text-blue-400" : 
                                    agent.status === 'active' ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"
                                )}>
                                    {!isLive ? `Deploying in ${deployText}` : agent.status}
                                </span>
                            </div>
                            <p className="text-muted-foreground">Created on {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Today'}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="border-gold-400/20"
                        onClick={() => toggleStatus(agent.id)}
                        disabled={!isLive}
                    >
                        {agent.status === 'active' ? (
                            <><Pause className="mr-2 w-4 h-4" /> Pause Agent</>
                        ) : (
                            <><Play className="mr-2 w-4 h-4" /> Resume Agent</>
                        )}
                    </Button>

                    {isLive ? (
                        <Button 
                            variant="outline" 
                            className="border-gold-400/20"
                            asChild
                        >
                            <Link href={`/dashboard/agents/${agent.id}/edit`}>
                                <Edit className="mr-2 w-4 h-4" /> Edit Agent
                            </Link>
                        </Button>
                    ) : (
                        <Button 
                            variant="outline" 
                            className="border-gold-400/20"
                            disabled
                        >
                            <Edit className="mr-2 w-4 h-4" /> Edit Agent
                        </Button>
                    )}
                    
                    <Button className="bg-gold-gradient text-black font-semibold" disabled={!isLive}>
                        <Zap className="mr-2 w-4 h-4" />
                        Test Agent
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Config & Calls */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats */}
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                        <motion.div variants={fadeInUp}>
                            <GlassCard>
                                <div className="text-sm text-muted-foreground mb-1">Total Calls</div>
                                <div className="text-2xl font-bold">{agent.calls}</div>
                            </GlassCard>
                        </motion.div>
                        <motion.div variants={fadeInUp}>
                            <GlassCard>
                                <div className="text-sm text-muted-foreground mb-1">Avg Duration</div>
                                <div className="text-2xl font-bold">{agent.avgDuration}</div>
                            </GlassCard>
                        </motion.div>
                        <motion.div variants={fadeInUp}>
                            <GlassCard>
                                <div className="text-sm text-muted-foreground mb-1">Success Rate</div>
                                <div className="text-2xl font-bold text-green-400">{agent.successRate}%</div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>

                    {/* Call History Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Recent Calls</h2>
                            <Button variant="ghost" size="sm" className="text-gold-400" asChild>
                                <Link href="/dashboard/calls">View All</Link>
                            </Button>
                        </div>
                        
                        <div className="space-y-3">
                            {(agent.callHistory || []).map((call) => (
                                <GlassCard 
                                    key={call.id} 
                                    className={cn(
                                        "p-4 cursor-pointer transition-all hover:bg-gold-400/5 border-2",
                                        selectedCall === call.id ? "border-gold-400" : "border-transparent"
                                    )}
                                    onClick={() => setSelectedCall(selectedCall === call.id ? null : call.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                call.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                                            )}>
                                                <Phone className={cn(
                                                    "w-5 h-5",
                                                    call.status === 'success' ? 'text-green-400' : 'text-red-400'
                                                )} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{call.caller}</p>
                                                <p className="text-xs text-muted-foreground">{call.date} • {call.time}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-medium">{call.duration}</p>
                                                <p className="text-xs text-muted-foreground">Duration</p>
                                            </div>
                                            <div className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                call.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                                            )}>
                                                {call.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Transcript View */}
                                    {selectedCall === call.id && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="mt-6 pt-6 border-t border-gold-400/10 space-y-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div>
                                                <h4 className="text-xs font-bold uppercase text-gold-400 mb-2 tracking-widest">Call Summary</h4>
                                                <p className="text-sm text-muted-foreground">{call.summary}</p>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-xs font-bold uppercase text-gold-400 tracking-widest">Recording</h4>
                                                    <AudioPlayer src={call.recording} className="w-full max-w-md" />
                                                </div>
                                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {call.transcript.map((line: any, idx: number) => (
                                                        <div key={idx} className={cn(
                                                            "flex flex-col gap-1",
                                                            line.role === 'agent' ? "items-start" : "items-end text-right"
                                                        )}>
                                                            <span className="text-[10px] font-bold uppercase opacity-50">
                                                                {line.role === 'agent' ? agent.name : 'Customer'}
                                                            </span>
                                                            <div className={cn(
                                                                "p-3 rounded-2xl max-w-[85%] text-sm",
                                                                line.role === 'agent' 
                                                                    ? "bg-gold-400/10 text-gold-50" 
                                                                    : "bg-muted/50 text-muted-foreground"
                                                            )}>
                                                                {line.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GradientCard>
                            <div className="flex items-center gap-3 mb-4">
                                <Mic className="w-5 h-5 text-gold-400" />
                                <h3 className="font-semibold">Voice & Language</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-muted/30">
                                    <p className="text-xs text-muted-foreground mb-1">Selected Voice</p>
                                    <p className="font-medium">{agent.voice}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30">
                                    <p className="text-xs text-muted-foreground mb-1">Primary Language</p>
                                    <p className="font-medium">{agent.language}</p>
                                </div>
                            </div>
                        </GradientCard>

                        <GradientCard>
                            <div className="flex items-center gap-3 mb-4">
                                <MessageSquare className="w-5 h-5 text-gold-400" />
                                <h3 className="font-semibold">Personality</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 rounded-lg bg-muted/30">
                                    <p className="text-xs text-muted-foreground mb-1">Character</p>
                                    <p className="font-medium">{agent.personality}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30">
                                    <p className="text-xs text-muted-foreground mb-1">Greeting</p>
                                    <p className="font-medium line-clamp-1">{agent.greeting}</p>
                                </div>
                            </div>
                        </GradientCard>
                    </div>

                    {/* Description */}
                    <GlassCard>
                        <h3 className="font-semibold mb-3">About Agent</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {agent.description || "No description provided for this agent."}
                        </p>
                    </GlassCard>
                </div>

                {/* Right Column: Sidebar info */}
                <div className="space-y-8">
                    {/* Knowledge Base */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Training Data</h3>
                            <Database className="w-4 h-4 text-gold-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                                <span className="text-muted-foreground">Documents</span>
                                <span className="font-medium">{assignedDocsCount}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
                                <span className="text-muted-foreground">Websites</span>
                                <span className="font-medium">{assignedLinksCount}</span>
                            </div>
                            <Button variant="ghost" className="w-full text-gold-400 text-sm" asChild>
                                <Link href="/dashboard/knowledge">Manage Knowledge</Link>
                            </Button>
                        </div>
                    </GlassCard>

                    {/* Danger Zone */}
                    <div className="p-6 rounded-2xl border-2 border-red-500/20 bg-red-500/5">
                        <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Danger Zone
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                            Once you delete an agent, there is no going back. Please be certain.
                        </p>
                        <Button 
                            variant="destructive" 
                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                            onClick={handleDelete}
                            disabled={isProtected}
                        >
                            {isProtected ? "Cannot Delete Default Agent" : "Delete Agent"}
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your agent
                            and remove all of its associated call history and training data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
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
