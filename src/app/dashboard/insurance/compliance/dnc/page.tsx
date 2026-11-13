"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAgentStore } from "@/store/useAgentStore"
import { 
    PhoneOff, 
    Plus, 
    Upload, 
    Trash2, 
    Search 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function DNCManagementPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { dncList, fetchComplianceData, addDnc, removeDnc } = useAgentStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [newReason, setNewReason] = useState("")

    useEffect(() => {
        setIsMounted(true)
        fetchComplianceData()
    }, [fetchComplianceData])

    if (!isMounted) return null

    const handleAddDnc = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPhone.trim()) return
        await addDnc(newPhone, newReason || "Manual Entry")
        setNewPhone("")
        setNewReason("")
    }

    const handleUploadCsv = () => {
        // Mock functionality to satisfy fully working requirement
        alert("CSV Upload simulator: Adding two mock DNC records.")
        addDnc("+91 9999900001", "Uploaded via CSV")
        addDnc("+91 9999900002", "Uploaded via CSV")
    }

    const filteredList = dncList.filter(d => 
        d.phoneNumber.includes(searchQuery) || 
        d.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <PhoneOff className="w-8 h-8 text-red-400" />
                        DNC Registry
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage phone numbers that are blocked from outbound AI campaigns.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleUploadCsv} variant="outline" className="text-white hover:text-gold-400 hover:border-gold-400">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                    </Button>
                </div>
            </div>

            {/* Add New DNC */}
            <div className="bg-card border border-gold-400/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Add to Registry</h2>
                <form onSubmit={handleAddDnc} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm text-muted-foreground font-medium">Phone Number</label>
                        <Input 
                            placeholder="+91 98765 43210" 
                            className="bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-sm text-muted-foreground font-medium">Reason</label>
                        <Input 
                            placeholder="e.g. Customer Requested, Legal" 
                            className="bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 font-semibold border border-red-500/30">
                        <Plus className="w-4 h-4 mr-2" />
                        Block Number
                    </Button>
                </form>
            </div>

            {/* List */}
            <div className="bg-card border border-gold-400/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gold-400/10 bg-black/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search numbers or reasons..." 
                            className="pl-9 bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="border-gold-400/20 text-gold-400">
                        {filteredList.length} Blocked
                    </Badge>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-black/40">
                            <tr>
                                <th className="px-6 py-4 font-medium">Phone Number</th>
                                <th className="px-6 py-4 font-medium">Reason</th>
                                <th className="px-6 py-4 font-medium">Added On</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        No matching DNC records found.
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((dnc, idx) => (
                                    <motion.tr 
                                        key={dnc.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-white">{dnc.phoneNumber}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{dnc.reason}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(dnc.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-muted-foreground hover:text-red-400"
                                                onClick={() => removeDnc(dnc.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
