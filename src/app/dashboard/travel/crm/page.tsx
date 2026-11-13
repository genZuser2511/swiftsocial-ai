"use client"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TravelCRM() {
    const [contacts, setContacts] = useState<any[]>([])
    
    useEffect(() => {
        fetch('/api/travel/contacts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setContacts(data)
                } else {
                    console.error("Failed to fetch contacts:", data)
                    setContacts([])
                }
            })
            .catch(e => {
                console.error("Network error fetching contacts:", e)
                setContacts([])
            })
    }, [])

    const handleDecrypt = async (id: string) => {
        const res = await fetch(`/api/travel/contacts/${id}/decrypt`)
        if (res.ok) {
            const { passport_number } = await res.json()
            setContacts(prev => prev.map(c => c.id === id ? { ...c, passport_number_masked: passport_number, isDecrypted: true } : c))
        } else {
            alert("Unauthorized to decrypt. Admin or Manager role required.")
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Travel CRM</h1>
            
            <div className="rounded-xl border border-gold-400/10 overflow-hidden bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b border-gold-400/10">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Destination</th>
                            <th className="px-6 py-4 font-medium">Passport</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-400/5">
                        {contacts.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4">{c.contacts?.full_name || 'Unknown'}</td>
                                <td className="px-6 py-4">{c.preferred_destinations?.join(', ') || 'None'}</td>
                                <td className="px-6 py-4 font-mono">
                                    {c.passport_number_masked}
                                </td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm" onClick={() => handleDecrypt(c.id)}>
                                        {c.isDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-gold-400" />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No contacts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
