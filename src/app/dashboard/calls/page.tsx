"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowUpDown,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    Phone,
    PhoneIncoming,
    PhoneOutgoing,
    Play,
    Search,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"

import { useAgentStore, Call as StoreCall } from "@/store/useAgentStore"

export default function CallsPage() {
    const agents = useAgentStore((state) => state.agents)
    const [search, setSearch] = useState("")
    
    // Aggregate all calls from all agents and add agent name to each call
    const allCalls = agents.flatMap(agent => 
        (agent.callHistory || []).map(call => ({
            ...call,
            agentName: agent.name,
            type: "inbound" // Mocking type as inbound for now as per original UI
        }))
    ).sort((a, b) => {
        // Simple sort by ID or date/time if available
        return b.id.localeCompare(a.id);
    });

    const [selectedCall, setSelectedCall] = useState<any | null>(null)

    const filteredCalls = allCalls.filter(
        (call) =>
            call.caller.includes(search) ||
            call.agentName.toLowerCase().includes(search.toLowerCase()) ||
            call.summary.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Call History</h1>
                    <p className="text-muted-foreground">
                        View and analyze all your AI agent conversations
                    </p>
                </div>
                <Button variant="outline" className="border-gold-400/20 w-fit">
                    <Download className="mr-2 w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <GlassCard>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by phone, agent, or summary..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-muted/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="border-gold-400/20">
                            <Calendar className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="border-gold-400/20">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="border-gold-400/20">
                            <ArrowUpDown className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calls List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredCalls.length > 0 ? (
                        filteredCalls.map((call) => (
                            <motion.div
                                key={call.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setSelectedCall(call)}
                                className={`cursor-pointer transition-all ${selectedCall?.id === call.id ? "ring-2 ring-gold-400" : ""
                                    }`}
                            >
                                <GlassCard className="hover:bg-muted/30">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${call.type === "inbound" ? "bg-blue-500/10" : "bg-green-500/10"
                                                }`}
                                        >
                                            {call.type === "inbound" ? (
                                                <PhoneIncoming className="w-5 h-5 text-blue-400" />
                                            ) : (
                                                <PhoneOutgoing className="w-5 h-5 text-green-400" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium">{call.caller}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {call.date} {call.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-muted-foreground">{call.agentName}</span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-sm text-muted-foreground">{call.duration}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {call.summary}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${call.status === "success"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-red-500/10 text-red-400"
                                                    }`}
                                            >
                                                {call.status === 'success' ? 'Completed' : 'Failed'}
                                            </span>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${call.sentiment === "positive"
                                                        ? "bg-green-500/10 text-green-400"
                                                        : call.sentiment === "negative"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : "bg-muted text-muted-foreground"
                                                    }`}
                                            >
                                                {call.sentiment}
                                            </span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No call history available.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <span className="text-sm text-muted-foreground">
                            Showing {filteredCalls.length} of {allCalls.length} calls
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="border-gold-400/20">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="border-gold-400/20">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Call Details Panel */}
                <div className="lg:col-span-1">
                    {selectedCall ? (
                        <GradientCard className="sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Call Details</h3>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedCall(null)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-gold-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedCall.caller}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCall.type === "inbound" ? "Inbound" : "Outbound"} Call
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                        <p className="font-medium">{selectedCall.duration}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Agent</p>
                                        <p className="font-medium">{selectedCall.agentName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                                        <p className="font-medium">{selectedCall.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Time</p>
                                        <p className="font-medium">{selectedCall.time}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Summary</p>
                                    <p className="text-sm">{selectedCall.summary}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 bg-gold-gradient text-black">
                                        <Play className="mr-2 w-4 h-4" />
                                        Play Recording
                                    </Button>
                                </div>

                                <Button variant="outline" className="w-full border-gold-400/20">
                                    View Full Transcript
                                </Button>
                            </div>
                        </GradientCard>
                    ) : (
                        <GlassCard className="sticky top-24 text-center py-12">
                            <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Select a call to view details
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    )
}
