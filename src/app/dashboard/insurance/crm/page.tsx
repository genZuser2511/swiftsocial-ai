"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    Calendar, 
    ChevronRight, 
    Download, 
    Filter, 
    MoreHorizontal, 
    Phone, 
    Plus, 
    Search, 
    Shield, 
    User,
    Mail,
    FileText,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/shared/GradientCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Mock Data representing the joined leads + insurance_contacts + insurance_policies
const INITIAL_CONTACTS = [
    { 
        id: "1", 
        name: "Akash (Ahmedabad)", 
        email: "akash@example.com",
        phone: "+91 91234 56789",
        status: "Warm",
        policyType: "Life", 
        premium: 15000, 
        carrier: "Alpha Insurance",
        policyStatus: "Pending",
        nextFollowUp: "Jun 18, 2026", 
        agent: "Inbound Agent",
        claimsCount: 0
    },
    { 
        id: "2", 
        name: "Rahul (Existing)", 
        email: "rahul@example.com",
        phone: "+91 88776 55443",
        status: "Hot",
        policyType: "Health", 
        premium: 20000, 
        carrier: "Alpha Insurance",
        policyStatus: "Active",
        nextFollowUp: "Jun 17, 2026", 
        agent: "Inbound Agent",
        claimsCount: 0
    },
    { 
        id: "3", 
        name: "Rahul (Gujarat)", 
        email: "rahul.g@example.com",
        phone: "+91 99887 77665",
        status: "Warm",
        policyType: "Life", 
        premium: 12000, 
        carrier: "Alpha Insurance",
        policyStatus: "Pending",
        nextFollowUp: "Jun 18, 2026", 
        agent: "Inbound Agent",
        claimsCount: 0
    },
    { 
        id: "4", 
        name: "Pranit", 
        email: "pranit@example.com",
        phone: "+91 98989 89898",
        status: "Qualified",
        policyType: "Life", 
        premium: 30000, 
        carrier: "Alpha Insurance",
        policyStatus: "Active",
        nextFollowUp: "Jun 10, 2026", 
        agent: "Outbound Agent",
        claimsCount: 0
    },
    { 
        id: "5", 
        name: "Aditya", 
        email: "aditya@example.com",
        phone: "+91 87878 78787",
        status: "Hot",
        policyType: "Health", 
        premium: 25000, 
        carrier: "Alpha Insurance",
        policyStatus: "Active",
        nextFollowUp: "Jun 18, 2026", 
        agent: "Outbound Agent",
        claimsCount: 0
    },
    { 
        id: "6", 
        name: "Raul", 
        email: "raul@example.com",
        phone: "+91 76767 67676",
        status: "Qualified",
        policyType: "Auto", 
        premium: 18000, 
        carrier: "Alpha Insurance",
        policyStatus: "Active",
        nextFollowUp: "Jun 12, 2026", 
        agent: "Outbound Agent",
        claimsCount: 0
    },
]

export default function InsuranceCRMPage() {
    const [contacts, setContacts] = useState(INITIAL_CONTACTS)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<any>(null)
    
    const [newContact, setNewContact] = useState({
        name: "", email: "", phone: "", policyType: "Life", premium: "", carrier: "", policyStatus: "Pending"
    })

    const handleAddContact = (e: React.FormEvent) => {
        e.preventDefault()
        const id = Math.random().toString(36).substr(2, 9)
        const contactToAdd = {
            id,
            name: newContact.name,
            email: newContact.email,
            phone: newContact.phone,
            status: "New",
            policyType: newContact.policyType,
            premium: Number(newContact.premium),
            carrier: newContact.carrier,
            policyStatus: newContact.policyStatus,
            nextFollowUp: "Today",
            agent: "You",
            claimsCount: 0
        }
        setContacts([contactToAdd, ...contacts])
        setIsAddOpen(false)
        setNewContact({ name: "", email: "", phone: "", policyType: "Life", premium: "", carrier: "", policyStatus: "Pending" })
        toast.success("Contact added successfully!")
    }

    const handleDeleteContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id))
        toast.success("Contact deleted")
    }

    const handleInitiateCall = (name: string) => {
        toast.success(`Initiating secure call with ${name}...`)
    }

    const getPolicyColor = (type: string) => {
        switch(type) {
            case "Life": return "bg-gold-400/20 text-gold-400 border-gold-400/30"
            case "Health": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case "Auto": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
            case "Home": return "bg-green-500/20 text-green-400 border-green-500/30"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    const getStatusColor = (status: string) => {
        switch(status) {
            case "Active": return "bg-green-500/10 text-green-400 border-green-500/20"
            case "Pending": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
            case "Lapsed": return "bg-red-500/10 text-red-400 border-red-500/20"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-gold-400" />
                        Policyholders
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your insurance contacts, policies, and claims.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={() => setIsAddOpen(true)} className="bg-gold-gradient text-black font-semibold hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" /> Add Contact
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <GradientCard className="p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email, or policy number..." 
                        className="pl-9 bg-background/50 border-gold-400/10"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="border-gold-400/20 hover:bg-gold-400/10 text-muted-foreground">
                        <Filter className="w-4 h-4 mr-2" /> Policy Type
                    </Button>
                    <Button variant="outline" className="border-gold-400/20 hover:bg-gold-400/10 text-muted-foreground">
                        <User className="w-4 h-4 mr-2" /> Agent
                    </Button>
                </div>
            </GradientCard>

            {/* Data Table */}
            <div className="rounded-xl border border-gold-400/10 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-gold-400/10">
                            <tr>
                                <th className="px-6 py-4 font-medium">Policyholder</th>
                                <th className="px-6 py-4 font-medium">Policy Details</th>
                                <th className="px-6 py-4 font-medium">Premium</th>
                                <th className="px-6 py-4 font-medium">Next Follow-up</th>
                                <th className="px-6 py-4 font-medium">Agent</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {contacts.map((contact, i) => (
                                <motion.tr 
                                    key={contact.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-muted/20 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold border border-gold-400/20">
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{contact.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3" /> {contact.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            <Badge className={cn("text-[10px] uppercase font-bold", getPolicyColor(contact.policyType))}>
                                                {contact.policyType}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground font-medium">{contact.carrier}</p>
                                            <Badge className={cn("text-[10px]", getStatusColor(contact.policyStatus))}>
                                                {contact.policyStatus}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-white">₹{contact.premium.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Annual</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4 text-gold-400/70" />
                                            <span>{contact.nextFollowUp}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">
                                                {contact.agent.charAt(0)}
                                            </div>
                                            <span className="text-sm">{contact.agent}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button onClick={() => handleInitiateCall(contact.name)} variant="ghost" size="icon" className="h-8 w-8 text-gold-400 hover:text-gold-300 hover:bg-gold-400/10">
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button onClick={() => setSelectedContact(contact)} variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40 border-gold-400/20 bg-background">
                                                    <DropdownMenuItem className="hover:bg-muted/50 cursor-pointer">
                                                        Edit Contact
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteContact(contact.id)} className="text-red-400 hover:bg-red-400/10 hover:text-red-300 cursor-pointer">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-gold-400/10 flex items-center justify-between text-sm text-muted-foreground">
                    <p>Showing 1 to 5 of 24 contacts</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="border-gold-400/10">Previous</Button>
                        <Button variant="outline" size="sm" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">Next</Button>
                    </div>
                </div>
            </div>

            {/* Add Contact Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-[#1a1c2e] border-gold-400/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-gold-400 flex items-center gap-2"><Plus className="w-5 h-5"/> Add New Policyholder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddContact} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input required value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input required value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="+91 99999 99999" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" required value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Policy Type</Label>
                                <Input required value={newContact.policyType} onChange={e => setNewContact({...newContact, policyType: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="Life, Health, Auto..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Carrier</Label>
                                <Input required value={newContact.carrier} onChange={e => setNewContact({...newContact, carrier: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="Alpha Insurance" />
                            </div>
                            <div className="space-y-2">
                                <Label>Annual Premium (₹)</Label>
                                <Input type="number" required value={newContact.premium} onChange={e => setNewContact({...newContact, premium: e.target.value})} className="bg-background/50 border-gold-400/20" placeholder="15000" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-gold-gradient text-black font-bold mt-6">Save Contact</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Policy Details Modal */}
            <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
                <DialogContent className="bg-[#1a1c2e] border-gold-400/20 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-blue-400 flex items-center gap-2"><FileText className="w-5 h-5"/> Policy Details</DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4 mt-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-gold-400/10">
                                <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold text-lg border border-gold-400/20">
                                    {selectedContact.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedContact.name}</h3>
                                    <p className="text-muted-foreground text-sm">{selectedContact.email} • {selectedContact.phone}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Policy Type</p>
                                    <Badge className={cn("text-[10px] uppercase font-bold", getPolicyColor(selectedContact.policyType))}>{selectedContact.policyType}</Badge>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                                    <Badge className={cn("text-[10px]", getStatusColor(selectedContact.policyStatus))}>{selectedContact.policyStatus}</Badge>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Carrier</p>
                                    <p className="font-medium text-sm">{selectedContact.carrier}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Annual Premium</p>
                                    <p className="font-medium text-sm">₹{selectedContact.premium.toLocaleString()}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Agent</p>
                                    <p className="font-medium text-sm">{selectedContact.agent}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background/50 border border-gold-400/10">
                                    <p className="text-xs text-muted-foreground mb-1">Next Follow-Up</p>
                                    <p className="font-medium text-sm">{selectedContact.nextFollowUp}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
