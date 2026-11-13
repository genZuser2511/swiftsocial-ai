"use client"
import { Palette, Globe, Lock, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function WhiteLabelTab() {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Plan Gate Banner */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">White Label — Agency Plan Required</h3>
                        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">Agency</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        Remove SwiftSocial AI branding and use your own custom domain, logo, and color scheme for client-facing dashboards.
                    </p>
                    <Button className="bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 text-sm">
                        Upgrade to Agency Plan
                    </Button>
                </div>
            </div>

            {/* Preview (locked) */}
            <GradientCard className="opacity-50 pointer-events-none select-none">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gold-400" /> Custom Domain
                </h2>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Custom Domain</Label>
                        <div className="flex gap-2">
                            <Input defaultValue="app.yourcompany.com" className="border-gold-400/10 bg-background/50" />
                            <Button variant="outline" className="border-gold-400/20 shrink-0">Verify DNS</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Point a CNAME to dashboard.swiftsocial.ai</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Force HTTPS</p>
                            <p className="text-xs text-muted-foreground">Auto-redirect HTTP to HTTPS</p>
                        </div>
                        <Switch defaultChecked disabled />
                    </div>
                </div>
            </GradientCard>

            <GradientCard className="opacity-50 pointer-events-none select-none">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-gold-400" /> Branding
                </h2>
                <div className="space-y-5">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                            <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">Custom Logo</p>
                            <p className="text-xs text-muted-foreground mb-2">Replaces SwiftSocial AI logo everywhere</p>
                            <Button size="sm" variant="outline" className="border-gold-400/20 text-gold-400" disabled>Upload Logo</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Primary Accent Color", value: "#F5A623" },
                            { label: "Background Color", value: "#0F1117" },
                        ].map(c => (
                            <div key={c.label} className="space-y-1.5">
                                <Label>{c.label}</Label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-9 h-9 rounded-lg border border-gold-400/20 shrink-0" style={{ backgroundColor: c.value }} />
                                    <Input defaultValue={c.value} className="border-gold-400/10 bg-background/50 font-mono text-sm" disabled />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Remove "Powered by SwiftSocial AI"</p>
                            <p className="text-xs text-muted-foreground">Hide all SwiftSocial AI references</p>
                        </div>
                        <Switch disabled />
                    </div>
                </div>
            </GradientCard>
        </motion.div>
    )
}
