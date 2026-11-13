"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
    Phone, 
    Mail, 
    MessageSquare, 
    Calendar, 
    Tag as TagIcon, 
    History, 
    Plus, 
    ChevronLeft,
    MoreVertical,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    Info,
    FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgentStore } from "@/store/useAgentStore"
import { motion } from "framer-motion"
import Link from "next/link"

const statusColors: Record<string, string> = {
    'Hot': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Warm': 'bg-gold-400/10 text-gold-400 border-gold-400/20',
    'Cold': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Qualified': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Lost': 'bg-muted text-muted-foreground border-muted-foreground/20',
}

export default function LeadDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { contacts, fetchContacts, fetchMessages, messages, agents } = useAgentStore()
    const [contact, setContact] = useState<any>(null)

    useEffect(() => {
        if (contacts.length === 0) fetchContacts()
        fetchMessages()
    }, [fetchContacts, fetchMessages, contacts.length])

    useEffect(() => {
        if (params.id && contacts.length > 0) {
            const found = contacts.find(l => l.id === params.id)
            setContact(found)
        }
    }, [params.id, contacts])

    if (!contact) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                <p>Loading contact details...</p>
            </div>
        )
    }

    // Filter messages and calls for this lead
    // Note: In a real app, we'd filter calls by phone number if they aren't linked by ID
    const leadMessages = messages.filter(m => m.contactId === contact.id)
    
    // Combine calls and messages into a timeline
    const timelineItems = [
        ...leadMessages.map(m => ({ ...m, timelineType: 'message' })),
        // Mocking calls for now based on phone match if not linked
        ...agents.flatMap(a => a.callHistory)
            .filter(c => c.caller === contact.phone || c.caller.includes(contact.fullName))
            .map(c => ({ ...c, timelineType: 'call' }))
    ].sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())

    return (
        <div className="space-y-6 p-6">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-gold-400"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Contacts
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-gold-400/10 hover:bg-gold-400/10">
                        Edit
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-gold-400/10 rounded-2xl p-6 text-center shadow-lg">
                        <div className="w-24 h-24 rounded-full bg-gold-gradient mx-auto flex items-center justify-center text-black text-3xl font-bold mb-4 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                            {contact.fullName.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-white">{contact.fullName}</h2>
                        <Badge variant="outline" className={`mt-2 ${statusColors[contact.status]}`}>
                            {contact.status}
                        </Badge>
                        
                        <div className="mt-8 space-y-3">
                            <Button className="w-full bg-gold-gradient text-black font-bold h-11 hover:opacity-90">
                                <Phone className="w-4 h-4 mr-2" />
                                Call Now
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    SMS
                                </Button>
                                <Button variant="outline" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-gold-400/10 rounded-2xl p-6 space-y-6 shadow-sm">
                        <div>
                            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-gold-400/5 flex items-center justify-center text-gold-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs">Phone</p>
                                        <p className="text-sm text-white">{contact.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-gold-400/5 flex items-center justify-center text-gold-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs">Email</p>
                                        <p className="text-sm text-white">{contact.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <div className="w-8 h-8 rounded-lg bg-gold-400/5 flex items-center justify-center text-gold-400">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs">Source</p>
                                        <p className="text-sm text-white">{contact.source || 'Direct Entry'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                                Tags
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-gold-400">
                                    <Plus className="w-3 h-3" />
                                </Button>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {contact.tags?.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="bg-muted/50 border-none">
                                        {tag}
                                    </Badge>
                                ))}
                                {(!contact.tags || contact.tags.length === 0) && (
                                    <p className="text-xs text-muted-foreground italic">No tags assigned</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content (Timeline) */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="bg-card border border-gold-400/10 p-1 rounded-xl">
                            <TabsTrigger value="timeline" className="rounded-lg data-[state=active]:bg-gold-gradient data-[state=active]:text-black">
                                <History className="w-4 h-4 mr-2" />
                                Activity Timeline
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="rounded-lg data-[state=active]:bg-gold-gradient data-[state=active]:text-black">
                                <FileText className="w-4 h-4 mr-2" />
                                Internal Notes
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-6">
                            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gold-400/20">
                                {timelineItems.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed border-gold-400/20 rounded-2xl">
                                        No activity recorded for this contact.
                                    </div>
                                ) : (
                                    timelineItems.map((item: any, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="relative"
                                        >
                                            {/* Icon */}
                                            <div className={`absolute -left-8 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-card z-10 ${
                                                item.timelineType === 'call' 
                                                    ? 'bg-gold-400 text-black' 
                                                    : 'bg-muted text-gold-400'
                                            }`}>
                                                {item.timelineType === 'call' ? <Phone className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                                            </div>

                                            {/* Card */}
                                            <div className="bg-card border border-gold-400/10 rounded-xl p-4 shadow-sm hover:border-gold-400/30 transition-all">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-white">
                                                        {item.timelineType === 'call' 
                                                            ? `AI Call — ${item.status === 'success' ? 'Completed' : 'Missed'}`
                                                            : `${item.type.toUpperCase()} ${item.direction === 'inbound' ? 'Received' : 'Sent'}`
                                                        }
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="w-3 h-3" />
                                                        {item.date || new Date(item.createdAt).toLocaleDateString()} at {item.time || new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </div>
                                                
                                                {item.timelineType === 'call' ? (
                                                    <div className="space-y-3">
                                                        <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                                            "{item.summary || 'AI interaction with contact.'}"
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className={`text-[10px] uppercase ${
                                                                item.sentiment === 'positive' ? 'text-green-400 border-green-400/20' :
                                                                item.sentiment === 'negative' ? 'text-red-400 border-red-400/20' : 'text-blue-400 border-blue-400/20'
                                                            }`}>
                                                                {item.sentiment} sentiment
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">{item.duration} duration</span>
                                                        </div>
                                                        <Button variant="link" className="text-gold-400 h-auto p-0 text-xs font-semibold">
                                                            View Transcript
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{item.content}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-6 space-y-4">
                            <div className="bg-card border border-gold-400/10 rounded-xl p-4">
                                <textarea 
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-white resize-none min-h-[100px]"
                                    placeholder="Add a private note about this contact..."
                                />
                                <div className="flex justify-end mt-2">
                                    <Button size="sm" className="bg-gold-gradient text-black font-semibold">
                                        Save Note
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No notes yet.
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
