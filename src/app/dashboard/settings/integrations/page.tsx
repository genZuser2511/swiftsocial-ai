"use client"

import { useEffect, useState } from "react"
import { 
    Zap, 
    Shield, 
    Key, 
    Webhook, 
    Settings, 
    Check, 
    ExternalLink,
    Mail,
    Phone,
    Bot,
    Plus,
    Trash2,
    RefreshCw,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function IntegrationsPage() {
    const [loading, setLoading] = useState<string | null>(null)
    const [status, setStatus] = useState<Record<string, boolean>>({})

    useEffect(() => {
        fetch('/api/settings/integrations')
            .then(res => res.json())
            .then(data => setStatus(data))
    }, [])

    const handleConnect = async (id: string) => {
        const key = window.prompt(`Enter your ${id.toUpperCase()} API Key:`)
        if (!key) return

        setLoading(id)
        try {
            const res = await fetch('/api/settings/integrations', {
                method: 'POST',
                body: JSON.stringify({ type: id, value: key })
            })
            if (res.ok) {
                setStatus(prev => ({ ...prev, [id]: true }))
                toast.success(`${id.toUpperCase()} connected successfully!`)
            }
        } catch (err) {
            toast.error("Failed to connect integration")
        } finally {
            setLoading(null)
        }
    }

    const integrations = [
        { 
            id: 'vapi', 
            name: 'Vapi.ai', 
            icon: Bot, 
            description: 'AI Voice Agent provider for real-time conversations.',
        },
        { 
            id: 'twilio', 
            name: 'Twilio', 
            icon: Phone, 
            description: 'Send and receive SMS messages via your business lines.',
        },
        { 
            id: 'resend', 
            name: 'Resend', 
            icon: Mail, 
            description: 'High-performance email delivery for your workflows.',
        },
    ]

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Integrations</h1>
                <p className="text-muted-foreground mt-1">Connect your favorite tools to power your AI call center.</p>
            </div>

            {/* Core Integrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((item) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-card border-gold-400/10 p-6 flex flex-col h-full hover:border-gold-400/30 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="outline" className={status[item.id] ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted text-muted-foreground'}>
                                    {status[item.id] ? 'Connected' : 'Not Connected'}
                                </Badge>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-1">
                                {item.description}
                            </p>
                            <Button 
                                onClick={() => handleConnect(item.id)}
                                disabled={loading === item.id}
                                variant={status[item.id] ? 'outline' : 'default'} 
                                className={status[item.id] ? 'border-gold-400/20 text-gold-400 hover:bg-gold-400/10' : 'bg-gold-gradient text-black font-bold'}
                            >
                                {loading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (status[item.id] ? 'Update Key' : 'Connect Account')}
                            </Button>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Webhooks Section */}
            <div className="space-y-6 pt-8 border-t border-gold-400/10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Incoming Webhooks</h2>
                        <p className="text-sm text-muted-foreground">Receive real-time data from external platforms.</p>
                    </div>
                    <Button variant="outline" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Webhook
                    </Button>
                </div>

                <div className="bg-card/50 border border-gold-400/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gold-400/5 border-b border-gold-400/10">
                                <th className="p-4 text-sm font-semibold text-gold-400">Webhook Name</th>
                                <th className="p-4 text-sm font-semibold text-gold-400">Status</th>
                                <th className="p-4 text-sm font-semibold text-gold-400">Last Active</th>
                                <th className="p-4 text-sm font-semibold text-gold-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            <tr>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Webhook className="w-4 h-4 text-gold-400" />
                                        <span className="text-sm font-medium text-white">Post-Call Lead Update</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0 h-5 text-[10px]">ACTIVE</Badge>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">2 mins ago</td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-gold-400">
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-gold-400/5 border border-gold-400/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-bold text-white">Your Universal API Endpoint</h4>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-black/50 border border-gold-400/10 rounded-lg p-3 text-xs text-gold-400 font-mono overflow-x-auto whitespace-nowrap">
                                    https://swiftsocial.ai/api/webhooks/v1/user_4044680
                                </code>
                                <Button size="sm" variant="outline" className="border-gold-400/10">Copy</Button>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Use this endpoint to trigger workflows from platforms like Zapier, Make.com, or directly from your custom app.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
