"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAgentStore } from "@/store/useAgentStore"
import { 
    UserCheck, 
    UserX, 
    Search,
    Shield,
    Plus,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ConsentManagementPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { consentRecords, fetchComplianceData, addConsent } = useAgentStore()
    const [searchQuery, setSearchQuery] = useState("")

    // Form state
    const [newContactId, setNewContactId] = useState("")
    const [newType, setNewType] = useState<'opt-in' | 'opt-out'>('opt-in')
    const [newExpiry, setNewExpiry] = useState("")

    useEffect(() => {
        setIsMounted(true)
        fetchComplianceData()
    }, [fetchComplianceData])

    if (!isMounted) return null

    const handleAddConsent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newContactId.trim()) return

        await addConsent({
            contactId: newContactId,
            type: newType,
            expiry: newExpiry || undefined
        })
        
        setNewContactId("")
        setNewExpiry("")
    }

    const filteredRecords = consentRecords.filter(c => 
        c.contactId.includes(searchQuery)
    )

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <UserCheck className="w-8 h-8 text-gold-400" />
                        Consent Records
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Track and verify user consent for AI outbound communications.
                    </p>
                </div>
            </div>

            {/* Add New Consent */}
            <div className="bg-card border border-gold-400/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Log Manual Consent</h2>
                <form onSubmit={handleAddConsent} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm text-muted-foreground font-medium">Contact ID</label>
                        <Input 
                            placeholder="UUID of the contact" 
                            className="bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={newContactId}
                            onChange={(e) => setNewContactId(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex-[0.5]">
                        <label className="text-sm text-muted-foreground font-medium">Type</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-gold-400/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as 'opt-in' | 'opt-out')}
                        >
                            <option value="opt-in">Opt-in (Granted)</option>
                            <option value="opt-out">Opt-out (Revoked)</option>
                        </select>
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-sm text-muted-foreground font-medium">Expiry Date (Optional)</label>
                        <Input 
                            type="datetime-local"
                            className="bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={newExpiry}
                            onChange={(e) => setNewExpiry(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="bg-gold-gradient text-black font-semibold hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" />
                        Log Consent
                    </Button>
                </form>
            </div>

            {/* List */}
            <div className="bg-card border border-gold-400/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gold-400/10 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by Contact ID..." 
                            className="pl-9 bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="border-gold-400/20 text-gold-400">
                        {filteredRecords.length} Records
                    </Badge>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-black/40">
                            <tr>
                                <th className="px-6 py-4 font-medium">Contact ID</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Recorded Date</th>
                                <th className="px-6 py-4 font-medium">Expiry</th>
                                <th className="px-6 py-4 font-medium">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No matching consent records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record, idx) => {
                                    const isExpired = record.expiry && new Date(record.expiry) < new Date()
                                    
                                    return (
                                        <motion.tr 
                                            key={record.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            <td className="px-6 py-4 font-medium text-white font-mono text-xs">{record.contactId}</td>
                                            <td className="px-6 py-4">
                                                {record.type === 'opt-in' ? (
                                                    <Badge variant="outline" className="border-green-400/20 text-green-400 bg-green-400/5">
                                                        <Shield className="w-3 h-3 mr-1" /> Opt-in
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-red-400/20 text-red-400 bg-red-400/5">
                                                        <UserX className="w-3 h-3 mr-1" /> Opt-out
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{new Date(record.date).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {record.expiry ? (
                                                    <span className={isExpired ? "text-red-400" : "text-white"}>
                                                        {new Date(record.expiry).toLocaleDateString()}
                                                    </span>
                                                ) : "Never"}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {record.recordingRef ? (
                                                    <Badge variant="outline" className="border-gold-400/20 text-gold-400">Audio Ref</Badge>
                                                ) : "Manual"}
                                            </td>
                                        </motion.tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
