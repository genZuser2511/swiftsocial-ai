"use client"
import { useState } from "react"
import { GlassCard, GradientCard } from "@/components/shared/GradientCard"
import { Button } from "@/components/ui/button"
import { Phone, Key, Plus, CheckCircle2, Server, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TelephonySettingsPage() {
    const [twilioSid, setTwilioSid] = useState("")
    const [twilioAuth, setTwilioAuth] = useState("")

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div>
                <Link 
                    href="/dashboard/settings"
                    className="flex items-center text-sm text-muted-foreground hover:text-gold-400 transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Settings Hub
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <Phone className="w-8 h-8 text-gold-400" />
                    Telephony & Providers
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your voice providers, API keys, and phone numbers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GradientCard>
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                        <Key className="w-5 h-5 text-gold-400" />
                        Twilio Configuration
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Account SID</label>
                            <input 
                                type="text" 
                                value={twilioSid}
                                onChange={(e) => setTwilioSid(e.target.value)}
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Auth Token</label>
                            <input 
                                type="password"
                                value={twilioAuth}
                                onChange={(e) => setTwilioAuth(e.target.value)} 
                                placeholder="••••••••••••••••••••••••••••••••"
                                className="w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400"
                            />
                        </div>
                        
                        <Button className="w-full bg-gold-gradient text-black">
                            Save Credentials
                        </Button>
                    </div>
                </GradientCard>

                <GlassCard>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Server className="w-5 h-5 text-gold-400" />
                            Phone Numbers
                        </h2>
                        <Button variant="outline" size="sm" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                            <Plus className="w-4 h-4 mr-1" /> Buy Number
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {/* Mock Phone Number */}
                        <div className="p-3 border border-gold-400/20 bg-gold-400/5 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-gold-400/20 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-gold-400" />
                                </div>
                                <div>
                                    <p className="font-medium tracking-wider">+1 (415) 555-2671</p>
                                    <p className="text-xs text-muted-foreground">Voice · SMS · Twilio</p>
                                </div>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-4 italic">
                            Numbers purchased here will be synced directly to your Twilio account.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    )
}
