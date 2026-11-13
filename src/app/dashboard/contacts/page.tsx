"use client"

import { useEffect, useState, useRef } from "react"
import { 
    Search, 
    Filter, 
    Plus, 
    MoreHorizontal, 
    Mail, 
    Phone, 
    Tag as TagIcon,
    ArrowUpDown,
    Download,
    Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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

export default function ContactsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { contacts, fetchContacts, isLoading } = useAgentStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("All")
    const { addContact } = useAgentStore()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newContact, setNewContact] = useState({ fullName: '', email: '', phone: '', status: 'Cold', tags: '', source: 'Manual' })
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setIsMounted(true)
        fetchContacts()
    }, [fetchContacts])

    if (!isMounted) return null

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            contact.phone.includes(searchQuery) ||
                            contact.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "All" || contact.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const exportContacts = () => {
        const headers = ["Full Name", "Email", "Phone", "Status", "Tags", "Source"].join(",") + "\n"
        const rows = filteredContacts.map(l => [
            `"${l.fullName}"`,
            `"${l.email || ''}"`,
            `"${l.phone}"`,
            `"${l.status}"`,
            `"${(l.tags || []).join('; ')}"`,
            `"${l.source || 'Manual'}"`
        ].join(",")).join("\n")
        
        const csvContent = "\uFEFF" + headers + rows
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "swiftsocial_leads_export.csv")
        document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, 0)
    }

    const handleAddContact = async () => {
        setIsSubmitting(true)
        try {
            await addContact({
                fullName: newContact.fullName,
                email: newContact.email,
                phone: newContact.phone,
                status: newContact.status as "Qualified" | "Hot" | "Warm" | "Cold" | "Lost",
                tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean),
                source: newContact.source,
                lastContacted: new Date().toISOString()
            })
            setIsAddModalOpen(false)
            setNewContact({ fullName: '', email: '', phone: '', status: 'Cold', tags: '', source: 'Manual' })
        } catch (error) {
            console.error("Failed to add contact", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            const text = event.target?.result as string
            const rows = text.split('\n').filter(Boolean)
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                // Split handling basic quotes
                const cols = rows[i].split(',').map(c => c.replace(/^"|"$/g, '').trim())
                if (cols.length >= 3 && cols[0]) {
                    await addContact({
                        fullName: cols[0],
                        email: cols[1] || '',
                        phone: cols[2] || '',
                        status: (cols[3] || 'Cold') as "Qualified" | "Hot" | "Warm" | "Cold" | "Lost",
                        tags: (cols[4] || '').split(';').map(t => t.trim()).filter(Boolean),
                        source: cols[5] || 'Import',
                        lastContacted: new Date().toISOString()
                    })
                }
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground mt-1">Manage your leads and customer relationships.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400"
                        onClick={exportContacts}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                    </Button>
                    <input type="file" accept=".csv" hidden ref={fileInputRef} onChange={handleFileChange} />
                    <Button 
                        variant="outline" 
                        className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400"
                        onClick={handleImportClick}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button 
                        className="bg-gold-gradient text-black font-semibold hover:opacity-90"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 p-4 rounded-xl border border-gold-400/10 backdrop-blur-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email or phone..." 
                        className="pl-10 bg-background/50 border-gold-400/10 focus-visible:ring-gold-400/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-gold-400/10 bg-background/50 w-full md:w-auto">
                                <Filter className="w-4 h-4 mr-2" />
                                {statusFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-gold-400/10">
                            <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Statuses</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {['Hot', 'Warm', 'Cold', 'Qualified', 'Lost'].map(status => (
                                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400 shrink-0">
                        <ArrowUpDown className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Leads Table */}
            <div className="rounded-xl border border-gold-400/10 bg-card/30 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gold-400/10 bg-gold-400/5">
                                <th className="p-4 font-semibold text-sm text-gold-400">Name</th>
                                <th className="p-4 font-semibold text-sm text-gold-400">Status</th>
                                <th className="p-4 font-semibold text-sm text-gold-400">Contact</th>
                                <th className="p-4 font-semibold text-sm text-gold-400">Tags</th>
                                <th className="p-4 font-semibold text-sm text-gold-400">Last Contact</th>
                                <th className="p-4 font-semibold text-sm text-gold-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td>
                                    </tr>
                                ))
                            ) : filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                                        No contacts found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <motion.tr 
                                        key={contact.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-gold-400/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                                                    {contact.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <Link 
                                                        href={`/dashboard/contacts/${contact.id}`}
                                                        className="font-medium text-white hover:text-gold-400 transition-colors"
                                                    >
                                                        {contact.fullName}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{contact.email || 'No email'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={statusColors[contact.status]}>
                                                {contact.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-sm text-white">
                                                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                                                    {contact.phone}
                                                </div>
                                                {contact.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {contact.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {contact.tags && contact.tags.length > 0 ? (
                                                    contact.tags.slice(0, 2).map(tag => (
                                                        <Badge key={tag} variant="secondary" className="bg-muted/50 text-[10px] py-0 px-1.5 border-none">
                                                            {tag}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No tags</span>
                                                )}
                                                {contact.tags && contact.tags.length > 2 && (
                                                    <span className="text-[10px] text-muted-foreground">+{contact.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-muted-foreground">
                                                {contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-gold-400/10 text-muted-foreground group-hover:text-gold-400">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-gold-400/10">
                                                    <DropdownMenuItem className="cursor-pointer" asChild>
                                                        <Link href={`/dashboard/contacts/${contact.id}`}>View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">Edit Contact</DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer">Add Tag</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10">
                                                        Delete Contact
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Contact Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] border-gold-400/20">
                    <DialogHeader>
                        <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input 
                                id="fullName" 
                                value={newContact.fullName}
                                onChange={(e) => setNewContact(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="John Doe" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email"
                                value={newContact.email}
                                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="john@example.com" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone (E.164 format)</Label>
                            <Input 
                                id="phone" 
                                value={newContact.phone}
                                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder="+1234567890" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input 
                                id="tags" 
                                value={newContact.tags}
                                onChange={(e) => setNewContact(prev => ({ ...prev, tags: e.target.value }))}
                                placeholder="VIP, Inbound" 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button 
                            className="bg-gold-gradient text-black font-semibold"
                            onClick={handleAddContact}
                            disabled={!newContact.fullName || !newContact.phone || isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Contact"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
