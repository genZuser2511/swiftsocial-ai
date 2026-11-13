"use client"
import { Database, Download, Trash2, AlertTriangle, FileText, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/shared/GradientCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

export function PrivacyTab() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold-400" /> Recording & Consent
                </h2>
                <div className="space-y-5">
                    {[
                        { label: "Caller consent notification", desc: 'Play "This call may be recorded" before every call', on: true },
                        { label: "Record all inbound calls", desc: "Automatically record inbound calls for QA", on: true },
                        { label: "Record all outbound calls", desc: "Automatically record outbound calls for QA", on: false },
                        { label: "Allow callers to opt out", desc: "Callers can press * to stop recording at any time", on: true },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">{s.label}</p>
                                <p className="text-xs text-muted-foreground">{s.desc}</p>
                            </div>
                            <Switch defaultChecked={s.on} />
                        </div>
                    ))}
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold-400" /> Data Retention
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { label: "Call recordings", key: "recordings" },
                        { label: "Call transcripts", key: "transcripts" },
                        { label: "Contact data", key: "contacts" },
                        { label: "Analytics data", key: "analytics" },
                    ].map(d => (
                        <div key={d.key} className="space-y-1.5">
                            <Label>{d.label}</Label>
                            <Select defaultValue="90">
                                <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 days</SelectItem>
                                    <SelectItem value="60">60 days</SelectItem>
                                    <SelectItem value="90">90 days</SelectItem>
                                    <SelectItem value="365">1 year</SelectItem>
                                    <SelectItem value="forever">Forever</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Database className="w-5 h-5 text-gold-400" /> GDPR & Data Rights
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-gold-400/10">
                        <div>
                            <p className="text-sm font-medium">Export My Data</p>
                            <p className="text-xs text-muted-foreground">Download all your data as a ZIP archive</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                            <Download className="w-4 h-4 mr-2" /> Export
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                        <div>
                            <p className="text-sm font-medium text-red-400">Delete Account</p>
                            <p className="text-xs text-muted-foreground">Permanently delete all data. Cannot be undone.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-red-400/30 text-red-400 hover:bg-red-400/10">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-400">SwiftSocial AI is GDPR compliant. Data is stored in ISO 27001 certified data centres. <span className="underline cursor-pointer">Read our privacy policy →</span></p>
                </div>
            </GradientCard>
        </motion.div>
    )
}
