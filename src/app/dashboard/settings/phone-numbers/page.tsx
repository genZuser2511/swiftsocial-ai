"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Bot,
    Check,
    ChevronDown,
    ChevronUp,
    Globe,
    Lock,
    Mic,
    MicOff,
    Phone,
    PhoneCall,
    PhoneIncoming,
    Plus,
    Search,
    Settings2,
    Trash2,
    Upload,
    Voicemail,
    Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_OWNED_NUMBERS = [
    {
        id: "1",
        number: "+91 80 4567 8901",
        friendlyName: "Sales Inbound",
        type: "local",
        agent: "Inbound Call Agent",
        recording: true,
        retentionDays: 90,
        monthlyCost: 850,
        status: "active",
    },
    {
        id: "2",
        number: "+91 1800 209 0000",
        friendlyName: "Support Toll-Free",
        type: "toll-free",
        agent: null,
        recording: false,
        retentionDays: 30,
        monthlyCost: 1200,
        status: "active",
    },
]

const MOCK_SEARCH_RESULTS = [
    { number: "+91 80 3345 6789", type: "local", city: "Bangalore", monthlyCost: 850 },
    { number: "+91 80 3346 1122", type: "local", city: "Bangalore", monthlyCost: 850 },
    { number: "+91 44 2233 4455", type: "local", city: "Chennai", monthlyCost: 750 },
    { number: "+91 22 4455 6677", type: "local", city: "Mumbai", monthlyCost: 900 },
    { number: "+91 1800 103 1234", type: "toll-free", city: "National", monthlyCost: 1200 },
]

const MOCK_AGENTS = ["Inbound Call Agent", "Outbound Sales Bot", "Appointment Booking"]

const IVR_ACTIONS = ["Transfer to agent", "Play message", "Go to voicemail", "Repeat menu", "Disconnect"]

// ─── IVR Builder ──────────────────────────────────────────────────────────────
function IVRBuilder() {
    const [keys, setKeys] = useState<Record<string, string>>({
        "1": "Transfer to agent",
        "2": "Play message",
        "0": "Go to voicemail",
    })

    const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Configure keypress routing for your phone menu. Callers hear the greeting then press a key.
            </p>
            <div className="grid grid-cols-3 gap-2">
                {keypad.map(key => (
                    <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 font-bold text-sm shrink-0">
                                {key}
                            </div>
                            <Select
                                value={keys[key] || ""}
                                onValueChange={(v) => setKeys(prev => ({ ...prev, [key]: v }))}
                            >
                                <SelectTrigger className="h-8 text-xs border-gold-400/10 bg-background/50">
                                    <SelectValue placeholder="No action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No action</SelectItem>
                                    {IVR_ACTIONS.map(a => (
                                        <SelectItem key={a} value={a}>{a}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>
            <Button size="sm" className="bg-gold-gradient text-black font-semibold">
                <Check className="w-4 h-4 mr-2" /> Save IVR Config
            </Button>
        </div>
    )
}

// ─── Number Row ───────────────────────────────────────────────────────────────
function NumberRow({ num }: { num: typeof MOCK_OWNED_NUMBERS[0] }) {
    const [expanded, setExpanded] = useState(false)
    const [recording, setRecording] = useState(num.recording)
    const [activeTab, setActiveTab] = useState<"recording" | "ivr" | "voicemail">("recording")

    return (
        <div className="rounded-xl border border-gold-400/10 bg-card/30 overflow-hidden">
            {/* Main Row */}
            <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold font-mono text-sm">{num.number}</p>
                        <Badge className={cn("text-[10px]", num.type === "toll-free" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                            {num.type}
                        </Badge>
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
                            {num.status}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{num.friendlyName} · ₹{num.monthlyCost}/mo</p>
                </div>
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    {num.agent ? (
                        <Badge variant="secondary" className="bg-muted text-xs gap-1">
                            <Bot className="w-3 h-3" /> {num.agent}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-dashed text-xs text-muted-foreground">Unassigned</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="text-muted-foreground hover:text-gold-400 gap-1.5"
                    >
                        <Settings2 className="w-4 h-4" />
                        Configure
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Expanded Config */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gold-400/10 overflow-hidden"
                    >
                        <div className="p-4 space-y-5">
                            {/* Agent Assignment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Assign to Agent</Label>
                                    <Select defaultValue={num.agent || ""}>
                                        <SelectTrigger className="border-gold-400/10 bg-background/50">
                                            <SelectValue placeholder="Select agent..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Unassigned</SelectItem>
                                            {MOCK_AGENTS.map(a => (
                                                <SelectItem key={a} value={a}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Caller ID Override</Label>
                                    <Input defaultValue={num.number} className="border-gold-400/10 bg-background/50 font-mono text-sm" />
                                </div>
                            </div>

                            {/* Sub-tabs */}
                            <div>
                                <div className="flex gap-1 mb-4 bg-muted/30 p-1 rounded-lg w-fit">
                                    {[
                                        { id: "recording" as const, label: "Recording", icon: Mic },
                                        { id: "ivr" as const, label: "IVR Menu", icon: Workflow },
                                        { id: "voicemail" as const, label: "Voicemail", icon: Voicemail },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setActiveTab(t.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                                activeTab === t.id ? "bg-gold-400/10 text-gold-400" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <t.icon className="w-3.5 h-3.5" />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {activeTab === "recording" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Call Recording</p>
                                                <p className="text-xs text-muted-foreground">Record all calls on this number</p>
                                            </div>
                                            <Switch checked={recording} onCheckedChange={setRecording} />
                                        </div>
                                        {recording && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Storage Duration</Label>
                                                    <Select defaultValue={String(num.retentionDays)}>
                                                        <SelectTrigger className="border-gold-400/10 bg-background/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="30">30 days</SelectItem>
                                                            <SelectItem value="60">60 days</SelectItem>
                                                            <SelectItem value="90">90 days</SelectItem>
                                                            <SelectItem value="365">1 year</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                    <p className="text-xs text-blue-400">Caller notification: "This call may be recorded for quality purposes."</p>
                                                    <Switch defaultChecked />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {activeTab === "ivr" && <IVRBuilder />}

                                {activeTab === "voicemail" && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Custom Voicemail Greeting</p>
                                                <p className="text-xs text-muted-foreground">Upload a custom greeting audio file</p>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="border-2 border-dashed border-gold-400/20 rounded-xl p-6 text-center hover:border-gold-400/40 transition-colors cursor-pointer">
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm font-medium">Drop .mp3 or .wav file here</p>
                                            <p className="text-xs text-muted-foreground mt-1">Max 5MB · 30 seconds recommended</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button size="sm" className="bg-gold-gradient text-black font-semibold">
                                    <Check className="w-4 h-4 mr-2" /> Save Changes
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PhoneNumbersPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [countryCode, setCountryCode] = useState("IN")
    const [showResults, setShowResults] = useState(false)
    const [purchasedIds, setPurchasedIds] = useState<string[]>([])
    const [showImport, setShowImport] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const handleSearch = () => setShowResults(true)

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Phone Numbers</h1>
                <p className="text-muted-foreground">Purchase, import, and manage your call center numbers.</p>
            </div>

            {/* My Numbers */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">My Numbers</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400"
                            onClick={() => setShowImport(!showImport)}
                        >
                            <Upload className="w-4 h-4 mr-2" /> Import Number
                        </Button>
                    </div>
                </div>

                {/* Import Form */}
                <AnimatePresence>
                    {showImport && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <GlassCard className="space-y-4">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <PhoneIncoming className="w-4 h-4 text-gold-400" />
                                    Import Existing Number
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Provider</Label>
                                        <Select defaultValue="twilio">
                                            <SelectTrigger className="border-gold-400/10 bg-background/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="twilio">Twilio</SelectItem>
                                                <SelectItem value="plivo">Plivo</SelectItem>
                                                <SelectItem value="exotel">Exotel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Phone Number</Label>
                                        <Input placeholder="+91 98765 43210" className="border-gold-400/10 bg-background/50 font-mono" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Account SID / Token</Label>
                                        <Input placeholder="ACxxxxxxxxxx" className="border-gold-400/10 bg-background/50 font-mono" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => setShowImport(false)}>Cancel</Button>
                                    <Button size="sm" className="bg-gold-gradient text-black font-semibold">Import Number</Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    {MOCK_OWNED_NUMBERS.map(num => (
                        <NumberRow key={num.id} num={num} />
                    ))}
                </div>
            </div>

            {/* Search & Purchase */}
            <GradientCard>
                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gold-400" />
                    Search & Purchase Numbers
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-full sm:w-40 border-gold-400/10 bg-background/50">
                            <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IN">🇮🇳 India</SelectItem>
                            <SelectItem value="US">🇺🇸 United States</SelectItem>
                            <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                            <SelectItem value="SG">🇸🇬 Singapore</SelectItem>
                            <SelectItem value="AE">🇦🇪 UAE</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search by city, area code, or keyword..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 border-gold-400/10 bg-background/50"
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                    />
                    <Button className="bg-gold-gradient text-black font-semibold shrink-0" onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" /> Search
                    </Button>
                </div>

                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <p className="text-xs text-muted-foreground mb-3">{MOCK_SEARCH_RESULTS.length} numbers available</p>
                            {MOCK_SEARCH_RESULTS.map((result, i) => {
                                const isPurchased = purchasedIds.includes(result.number)
                                return (
                                    <motion.div
                                        key={result.number}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 p-3 rounded-xl border border-gold-400/10 hover:border-gold-400/30 hover:bg-gold-400/5 transition-all"
                                    >
                                        <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                                        <p className="font-mono text-sm font-medium flex-1">{result.number}</p>
                                        <Badge className={cn("text-[10px]", result.type === "toll-free" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20")}>
                                            {result.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground hidden sm:block">{result.city}</span>
                                        <span className="text-sm font-semibold text-gold-400 shrink-0">₹{result.monthlyCost}/mo</span>
                                        <Button
                                            size="sm"
                                            disabled={isPurchased}
                                            onClick={() => setPurchasedIds(prev => [...prev, result.number])}
                                            className={cn(
                                                "shrink-0",
                                                isPurchased
                                                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                    : "bg-gold-gradient text-black font-semibold"
                                            )}
                                        >
                                            {isPurchased ? <><Check className="w-3.5 h-3.5 mr-1" />Purchased</> : <><Plus className="w-3.5 h-3.5 mr-1" />Buy</>}
                                        </Button>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </GradientCard>

            {/* SIP/Trunk (Enterprise Gate) */}
            <GlassCard className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">SIP Trunk / Custom Carrier Setup</h3>
                            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px]">Enterprise</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Connect your existing carrier infrastructure via SIP trunking. Supports bring-your-own-carrier (BYOC) configurations with custom routing rules.
                        </p>
                    </div>
                    <Button variant="outline" className="shrink-0 border-orange-400/30 text-orange-400 hover:bg-orange-400/10">
                        Upgrade to Enterprise
                    </Button>
                </div>
            </GlassCard>
        </div>
    )
}
