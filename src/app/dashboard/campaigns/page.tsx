"use client"

import { useEffect, useState } from "react"
import { 
    Zap, 
    Plus, 
    MoreHorizontal, 
    Play, 
    Pause, 
    Users, 
    BarChart3, 
    Calendar,
    Target,
    CheckCircle2,
    Clock,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAgentStore } from "@/store/useAgentStore"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"

const statusColors: Record<string, string> = {
    'active': 'bg-green-500/10 text-green-500 border-green-500/20',
    'paused': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'completed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'draft': 'bg-muted text-muted-foreground border-muted-foreground/20',
}

export default function CampaignsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { campaigns, fetchCampaigns, agents, fetchAgents, isLoading, addCampaign } = useAgentStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newCampaign, setNewCampaign] = useState({ name: '', description: '', agentId: '', status: 'active' })

    const handleAddCampaign = async () => {
        setIsSubmitting(true)
        try {
            await addCampaign({
                name: newCampaign.name,
                description: newCampaign.description,
                agentId: newCampaign.agentId,
                status: newCampaign.status as any
            })
            setIsAddModalOpen(false)
            setNewCampaign({ name: '', description: '', agentId: '', status: 'active' })
        } catch (error) {
            console.error("Failed to add campaign", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        setIsMounted(true)
        fetchCampaigns()
        fetchAgents()
    }, [fetchCampaigns, fetchAgents])

    if (!isMounted) return null

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Campaigns</h1>
                    <p className="text-muted-foreground mt-1">Automate your outbound outreach with AI-powered campaigns.</p>
                </div>
                <Button 
                    className="bg-gold-gradient text-black font-semibold hover:opacity-90"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                            <Play className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Active Campaigns</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gold-400/10 flex items-center justify-center text-gold-400">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Contacts Targeted</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {campaigns.reduce((acc, curr) => acc + curr.totalContacts, 0)}
                    </p>
                </div>
                <div className="bg-card border border-gold-400/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {campaigns.length > 0 
                            ? Math.round((campaigns.reduce((acc, curr) => acc + curr.completedContacts, 0) / 
                              campaigns.reduce((acc, curr) => acc + curr.totalContacts, 0)) * 100) || 0
                            : 0}%
                    </p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center bg-card/50 p-4 rounded-xl border border-gold-400/10 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search campaigns..." 
                        className="pl-10 bg-background/50 border-gold-400/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-card border border-gold-400/10 rounded-2xl p-6 h-64 animate-pulse" />
                    ))
                ) : filteredCampaigns.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-gold-400/20 rounded-2xl">
                        No campaigns found. Create your first campaign to start outbound outreach.
                    </div>
                ) : (
                    filteredCampaigns.map((campaign) => {
                        const agent = agents.find(a => a.id === campaign.agentId)
                        const progress = campaign.totalContacts > 0 
                            ? (campaign.completedContacts / campaign.totalContacts) * 100 
                            : 0

                        return (
                            <motion.div 
                                key={campaign.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-gold-400/10 rounded-2xl p-6 hover:border-gold-400/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className={statusColors[campaign.status]}>
                                        {campaign.status}
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
                                    {campaign.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                                    {campaign.description || 'No description provided.'}
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5 bg-muted" indicatorClassName="bg-gold-gradient" />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{campaign.completedContacts} / {campaign.totalContacts} calls</span>
                                        <span className="flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            {agent?.name || 'No Agent'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gold-400/5">
                                    <div className="flex items-center gap-3">
                                        <Button size="sm" variant="outline" className="h-8 border-gold-400/10 hover:bg-gold-400/10">
                                            Stats
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 border-gold-400/10 hover:bg-gold-400/10">
                                            Leads
                                        </Button>
                                    </div>
                                    {campaign.status === 'active' ? (
                                        <Button size="sm" variant="ghost" className="h-8 text-yellow-500 hover:bg-yellow-500/10">
                                            <Pause className="w-4 h-4 mr-2" />
                                            Pause
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="ghost" className="h-8 text-green-500 hover:bg-green-500/10">
                                            <Play className="w-4 h-4 mr-2" />
                                            Start
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Add Campaign Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-gold-400/20">
                    <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Campaign Name</Label>
                            <Input 
                                id="name" 
                                value={newCampaign.name}
                                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Summer Outreach 2026" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input 
                                id="description" 
                                value={newCampaign.description}
                                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Calling all leads from the summer list" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="agent">AI Agent</Label>
                            <select 
                                id="agent"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gold-400/10 focus-visible:ring-gold-400/50"
                                value={newCampaign.agentId}
                                onChange={(e) => setNewCampaign(prev => ({ ...prev, agentId: e.target.value }))}
                            >
                                <option value="">Select an Agent</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Initial Status</Label>
                            <select 
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gold-400/10 focus-visible:ring-gold-400/50"
                                value={newCampaign.status}
                                onChange={(e) => setNewCampaign(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="active">Active (Start Immediately)</option>
                                <option value="draft">Draft (Setup later)</option>
                                <option value="paused">Paused</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button 
                            className="bg-gold-gradient text-black font-semibold"
                            onClick={handleAddCampaign}
                            disabled={!newCampaign.name || !newCampaign.agentId || isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Campaign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
