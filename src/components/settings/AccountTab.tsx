"use client"
import { toast } from "sonner"
import { useState } from "react"
import { Save, Upload, Building2, Globe2, DollarSign, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/shared/GradientCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useEffect } from "react"

export function AccountTab() {
    const { insuranceEnabled, travelEnabled, updateSetting, fetchSettings, isLoading } = useSettingsStore()
    const [saving, setSaving] = useState(false)
    const [industry, setIndustry] = useState("technology")
    const [customIndustry, setCustomIndustry] = useState("")
    
    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false); toast.success("Account settings saved successfully"); }
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6">Company Account</h2>
                <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gold-400/10">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-semibold">Company Logo</p>
                        <p className="text-sm text-muted-foreground mb-2">Displayed in reports and white-label exports</p>
                        <Button size="sm" variant="outline" className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                            <Upload className="w-3.5 h-3.5 mr-2" /> Upload Logo
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label>Company Name</Label>
                        <Input defaultValue="TechCorp India" className="border-gold-400/10 bg-background/50" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                            <SelectTrigger className="border-gold-400/10 bg-background/50">
                                <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {["Technology", "Finance", "Healthcare", "Real Estate", "E-commerce", "Education", "Insurance", "Travel", "Other"].map(i => (
                                    <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {industry === 'other' && (
                            <Input 
                                placeholder="Specify your industry..." 
                                className="border-gold-400/10 bg-background/50 mt-2" 
                                value={customIndustry}
                                onChange={(e) => setCustomIndustry(e.target.value)}
                            />
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label>Timezone</Label>
                        <Select defaultValue="asia_kolkata">
                            <SelectTrigger className="border-gold-400/10 bg-background/50">
                                <Globe2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asia_kolkata">Asia/Kolkata (IST +5:30)</SelectItem>
                                <SelectItem value="asia_dubai">Asia/Dubai (GST +4:00)</SelectItem>
                                <SelectItem value="america_new_york">America/New_York (EST -5:00)</SelectItem>
                                <SelectItem value="europe_london">Europe/London (GMT +0:00)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Currency</Label>
                        <Select defaultValue="inr">
                            <SelectTrigger className="border-gold-400/10 bg-background/50">
                                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[["inr", "₹ INR — Indian Rupee"], ["usd", "$ USD — US Dollar"], ["gbp", "£ GBP — British Pound"], ["aed", "د.إ AED — UAE Dirham"]].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>{l}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Date Format</Label>
                        <Select defaultValue="dd_mm_yyyy">
                            <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dd_mm_yyyy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="mm_dd_yyyy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="yyyy_mm_dd">YYYY-MM-DD</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Company Size</Label>
                        <Select defaultValue="50_200">
                            <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {["1-10", "11-50", "50-200", "200-1000", "1000+"].map(s => (
                                    <SelectItem key={s} value={s.replace("-", "_")}>{s} employees</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gold-400/10">
                    <h3 className="text-md font-semibold mb-4">Industry Modules</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-gold-400/5">
                        <div>
                            <p className="font-medium text-sm">Insurance Vertical</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Enable the Insurance CRM, Pipeline, and specialized Agent templates.</p>
                        </div>
                        <Switch id="insurance-toggle" checked={insuranceEnabled} onCheckedChange={(c) => updateSetting('insurance_enabled', c)} disabled={isLoading} />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-gold-400/5 mt-4">
                        <div>
                            <p className="font-medium text-sm">Travel Vertical</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Enable the Travel CRM, Pipeline, Analytics, and specialized Agent templates.</p>
                        </div>
                        <Switch id="travel-toggle" checked={travelEnabled} onCheckedChange={(c) => updateSetting('travel_enabled', c)} disabled={isLoading} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button className="bg-gold-gradient text-black" onClick={save} disabled={saving}>
                        <Save className="mr-2 w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </GradientCard>
        </motion.div>
    )
}
