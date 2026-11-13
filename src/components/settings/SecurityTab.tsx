"use client"
import { Shield, Key, Copy, RefreshCw, Monitor, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/shared/GradientCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useState } from "react"

export function SecurityTab() {
    const [saving, setSaving] = useState(false)
    const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false) }
    const [apiVisible, setApiVisible] = useState(false)
    const MOCK_KEY = "sk_live_SwiftAI_xK9mP2qL8nR4vT7wY3zA6bC0dE5fG1hJ"

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-gold-400" /> Change Password
                </h2>
                <div className="space-y-4 max-w-md">
                    {[
                        { id: "currentPwd", label: "Current Password" },
                        { id: "newPwd", label: "New Password" },
                        { id: "confirmPwd", label: "Confirm New Password" },
                    ].map(f => (
                        <div key={f.id} className="space-y-1.5">
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input id={f.id} type="password" className="border-gold-400/10 bg-background/50" />
                        </div>
                    ))}
                    <Button className="bg-gold-gradient text-black" onClick={save} disabled={saving}>
                        {saving ? "Updating..." : "Update Password"}
                    </Button>
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold-400" /> Two-Factor Authentication
                </h2>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security via authenticator app</p>
                    </div>
                    <Switch />
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                    2FA uses TOTP (Google Authenticator, Authy). Backup codes will be generated on setup.
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-gold-400" /> Session & Access
                </h2>
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Session Timeout</Label>
                        <Select defaultValue="8h">
                            <SelectTrigger className="border-gold-400/10 bg-background/50 max-w-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {[["1h", "1 hour"], ["4h", "4 hours"], ["8h", "8 hours"], ["24h", "24 hours"], ["never", "Never (not recommended)"]].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>{l}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">IP Allowlist</p>
                            <p className="text-xs text-muted-foreground">Restrict access to specific IPs — Enterprise only</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-orange-400/30 text-orange-400 hover:bg-orange-400/10 text-xs">Upgrade</Button>
                    </div>
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-gold-400" /> API Keys
                </h2>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-gold-400/10">
                    <Key className="w-5 h-5 text-gold-400 shrink-0" />
                    <code className="flex-1 text-sm font-mono truncate">
                        {apiVisible ? MOCK_KEY : "sk_live_••••••••••••••••••••••••••••••••••"}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => setApiVisible(!apiVisible)} className="text-muted-foreground hover:text-gold-400 shrink-0">
                        {apiVisible ? "Hide" : "Show"}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400 shrink-0" title="Copy">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
                <Button variant="outline" size="sm" className="mt-3 border-red-400/20 text-red-400 hover:bg-red-400/10">
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Regenerate Key
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Regenerating invalidates the current key immediately.</p>
            </GradientCard>
        </motion.div>
    )
}
