"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    Briefcase, 
    Calendar, 
    Clock, 
    Filter, 
    MoreHorizontal, 
    Plus, 
    Search,
    Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Types
type Stage = "New Lead" | "Assessment" | "Quote Sent" | "Follow-up" | "Closing" | "Won" | "Lost"

interface PipelineCard {
    id: string
    name: string
    policyType: string
    premium: number
    daysInStage: number
    agent: string
    stage: Stage
}

// Mock Data
const STAGES: Stage[] = ["New Lead", "Assessment", "Quote Sent", "Follow-up", "Closing"]

const INITIAL_CARDS: PipelineCard[] = [
    { id: "1", name: "Akash (Ahmedabad)", policyType: "Life", premium: 15000, daysInStage: 1, agent: "Inbound", stage: "New Lead" },
    { id: "2", name: "Rahul (Gujarat)", policyType: "Life", premium: 12000, daysInStage: 0, agent: "Inbound", stage: "Follow-up" },
    { id: "3", name: "Aditya", policyType: "Health", premium: 25000, daysInStage: 1, agent: "Outbound", stage: "Assessment" },
    { id: "4", name: "Pranit", policyType: "Life", premium: 30000, daysInStage: 2, agent: "Outbound", stage: "Closing" },
    { id: "5", name: "Raul", policyType: "Auto", premium: 18000, daysInStage: 1, agent: "Outbound", stage: "Closing" },
]

export default function InsurancePipelinePage() {
    const [cards, setCards] = useState<PipelineCard[]>(INITIAL_CARDS)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newDeal, setNewDeal] = useState({
        name: "", policyType: "Life", premium: "", agent: "", stage: "New Lead" as Stage
    })

    const handleAddDeal = (e: React.FormEvent) => {
        e.preventDefault()
        const newCard: PipelineCard = {
            id: Math.random().toString(36).substr(2, 9),
            name: newDeal.name,
            policyType: newDeal.policyType,
            premium: Number(newDeal.premium),
            daysInStage: 0,
            agent: newDeal.agent || "You",
            stage: newDeal.stage
        }
        setCards([...cards, newCard])
        setIsAddOpen(false)
        setNewDeal({ name: "", policyType: "Life", premium: "", agent: "", stage: "New Lead" })
        toast.success("Deal added to pipeline!")
    }

    const filteredCards = cards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = activeFilter === "All" || card.policyType === activeFilter
        return matchesSearch && matchesFilter
    })

    // Helper to get color based on policy type
    const getPolicyColor = (type: string) => {
        switch(type) {
            case "Life": return "bg-gold-400/20 text-gold-400 border-gold-400/30"
            case "Health": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "Auto": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
            case "Home": return "bg-green-500/20 text-green-400 border-green-500/30"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    // Mock drag and drop (simple click to move for demo purposes)
    const moveCard = (cardId: string, direction: 1 | -1) => {
        setCards(cards.map(c => {
            if (c.id === cardId) {
                const currentIndex = STAGES.indexOf(c.stage)
                const nextIndex = currentIndex + direction
                if (nextIndex >= 0 && nextIndex < STAGES.length) {
                    return { ...c, stage: STAGES[nextIndex], daysInStage: 0 }
                }
            }
            return c
        }))
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage active insurance opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search deals..." 
                            className="pl-9 w-[250px] bg-card/50 border-gold-400/20 focus-visible:ring-gold-400/30"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={cn("border-gold-400/20 hover:bg-gold-400/10", activeFilter !== "All" ? "text-white bg-gold-400/10" : "text-gold-400")}>
                                <Filter className="w-4 h-4 mr-2" /> {activeFilter === "All" ? "Filter" : activeFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-gold-400/20 bg-background">
                            {["All", "Life", "Health", "Auto", "Home"].map(type => (
                                <DropdownMenuItem key={type} onClick={() => setActiveFilter(type)} className="hover:bg-muted/50 cursor-pointer">
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-gold-gradient text-black font-semibold hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" /> New Deal
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 h-full min-w-max">
                    {STAGES.map((stage) => {
                        const stageCards = filteredCards.filter(c => c.stage === stage)
                        const stageTotal = stageCards.reduce((acc, curr) => acc + curr.premium, 0)

                        return (
                            <div key={stage} className="flex flex-col w-[320px] bg-card/30 rounded-xl border border-border/50">
                                {/* Column Header */}
                                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card/50 rounded-t-xl">
                                    <div>
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            {stage}
                                            <Badge className="bg-muted text-muted-foreground hover:bg-muted font-normal h-5 px-1.5">
                                                {stageCards.length}
                                            </Badge>
                                        </h3>
                                        <p className="text-xs text-gold-400 mt-1 font-medium">₹{(stageTotal).toLocaleString()}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Column Content */}
                                <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                                    {stageCards.map((card) => (
                                        <motion.div
                                            layoutId={card.id}
                                            key={card.id}
                                            className="bg-card border border-gold-400/10 rounded-xl p-4 shadow-sm hover:border-gold-400/30 transition-colors group cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <Badge className={cn("text-[10px] uppercase tracking-wider font-bold", getPolicyColor(card.policyType))}>
                                                    {card.policyType}
                                                </Badge>
                                                <div className="flex items-center text-xs text-muted-foreground gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3" /> {card.daysInStage}d
                                                </div>
                                            </div>

                                            <h4 className="font-semibold text-sm mb-1">{card.name}</h4>
                                            <p className="text-lg font-bold text-white mb-4">₹{(card.premium).toLocaleString()}</p>

                                            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center text-[10px] font-bold text-gold-400 border border-gold-400/30">
                                                        {card.agent.charAt(0)}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{card.agent}</span>
                                                </div>
                                                
                                                {/* Demo arrows to move cards */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {STAGES.indexOf(card.stage) > 0 && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="w-6 h-6 h-[24px]" 
                                                            onClick={(e) => { e.stopPropagation(); moveCard(card.id, -1) }}
                                                        >
                                                            &larr;
                                                        </Button>
                                                    )}
                                                    {STAGES.indexOf(card.stage) < STAGES.length - 1 && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="w-6 h-6 h-[24px]" 
                                                            onClick={(e) => { e.stopPropagation(); moveCard(card.id, 1) }}
                                                        >
                                                            &rarr;
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Empty State / Add Area */}
                                    <button onClick={() => { setNewDeal({...newDeal, stage}); setIsAddOpen(true) }} className="w-full py-3 rounded-xl border border-dashed border-border/60 text-muted-foreground text-xs hover:text-white hover:border-gold-400/30 hover:bg-gold-400/5 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-3 h-3" /> Add Deal
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Add Deal Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-[#1a1c2e] border-gold-400/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-gold-400 flex items-center gap-2"><Plus className="w-5 h-5"/> Add New Deal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddDeal} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Client Name</Label>
                            <Input required value={newDeal.name} onChange={e => setNewDeal({...newDeal, name: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="John Doe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Policy Type</Label>
                                <Input required value={newDeal.policyType} onChange={e => setNewDeal({...newDeal, policyType: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="Life, Health, Auto..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Expected Premium (₹)</Label>
                                <Input type="number" required value={newDeal.premium} onChange={e => setNewDeal({...newDeal, premium: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="15000" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Agent Name</Label>
                                <Input required value={newDeal.agent} onChange={e => setNewDeal({...newDeal, agent: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="You" />
                            </div>
                            <div className="space-y-2">
                                <Label>Pipeline Stage</Label>
                                <Input required value={newDeal.stage} onChange={e => setNewDeal({...newDeal, stage: e.target.value as Stage})} className="bg-background/50 border-gold-400/20" placeholder="New Lead" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-gold-gradient text-black font-bold mt-6">Create Deal</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
