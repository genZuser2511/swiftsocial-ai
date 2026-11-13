"use client"
import { useState } from "react"
import { Save, Upload, Bell, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/shared/GradientCard"
import { motion } from "framer-motion"

export function ProfileTab() {
    const [saving, setSaving] = useState(false)
    const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false) }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gold-400/10">
                    <div className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center text-black text-2xl font-bold shrink-0">A</div>
                    <div>
                        <p className="font-semibold">Profile Photo</p>
                        <p className="text-sm text-muted-foreground mb-2">JPG, PNG up to 2MB</p>
                        <Button size="sm" variant="outline" className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                            <Upload className="w-3.5 h-3.5 mr-2" /> Upload Photo
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { id: "fullName", label: "Full Name", value: "Aditya Sharma", type: "text" },
                        { id: "email", label: "Email Address", value: "aditya@company.com", type: "email" },
                        { id: "phone", label: "Phone Number", value: "+91 98765 43210", type: "tel" },
                        { id: "role", label: "Role", value: "Admin", type: "text", disabled: true },
                        { id: "timezone", label: "Timezone", value: "Asia/Kolkata (IST +5:30)", type: "text" },
                        { id: "language", label: "Language", value: "English (India)", type: "text" },
                    ].map(f => (
                        <div key={f.id} className="space-y-1.5">
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input id={f.id} type={f.type} defaultValue={f.value} disabled={f.disabled} className="border-gold-400/10 bg-background/50" />
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button className="bg-gold-gradient text-black" onClick={save} disabled={saving}>
                        <Save className="mr-2 w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                    {[
                        { label: "Email notifications", desc: "Receive updates via email", icon: Mail, on: true },
                        { label: "SMS notifications", desc: "Receive alerts via SMS", icon: Phone, on: false },
                        { label: "Push notifications", desc: "Browser push alerts", icon: Bell, on: true },
                    ].map(n => (
                        <div key={n.label} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3">
                                <n.icon className="w-4 h-4 text-gold-400" />
                                <div>
                                    <p className="text-sm font-medium">{n.label}</p>
                                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                                </div>
                            </div>
                            <Switch defaultChecked={n.on} />
                        </div>
                    ))}
                </div>
            </GradientCard>
        </motion.div>
    )
}
