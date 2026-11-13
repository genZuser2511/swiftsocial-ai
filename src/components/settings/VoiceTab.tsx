"use client"
import { useState } from "react"
import { Save, Mic, Languages, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/shared/GradientCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

function SliderInput({ label, min, max, value, onChange, unit = "" }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void; unit?: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between">
                <Label>{label}</Label>
                <span className="text-sm font-semibold text-gold-400">{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-yellow-400 bg-muted/50" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{min}{unit}</span><span>{max}{unit}</span>
            </div>
        </div>
    )
}

export function VoiceTab() {
    const [speed, setSpeed] = useState(1.0)
    const [pitch, setPitch] = useState(0)
    const [saving, setSaving] = useState(false)
    const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false) }

    const voices = [
        { id: "priya_f", name: "Priya", gender: "Female", accent: "Indian English", preview: "🎙️" },
        { id: "arjun_m", name: "Arjun", gender: "Male", accent: "Indian English", preview: "🎙️" },
        { id: "sarah_f", name: "Sarah", gender: "Female", accent: "American English", preview: "🎙️" },
        { id: "james_m", name: "James", gender: "Male", accent: "British English", preview: "🎙️" },
    ]
    const [selectedVoice, setSelectedVoice] = useState("priya_f")

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-gold-400" /> Voice Settings
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {voices.map(v => (
                        <button key={v.id} onClick={() => setSelectedVoice(v.id)}
                            className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                selectedVoice === v.id ? "border-gold-400/50 bg-gold-400/10" : "border-gold-400/10 hover:border-gold-400/30")}>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">{v.preview}</div>
                            <div>
                                <p className="font-semibold text-sm">{v.name}</p>
                                <p className="text-xs text-muted-foreground">{v.gender} · {v.accent}</p>
                            </div>
                            {selectedVoice === v.id && <div className="ml-auto w-2 h-2 rounded-full bg-gold-400" />}
                        </button>
                    ))}
                </div>
                <div className="space-y-6">
                    <SliderInput label="Speaking Speed" min={0.5} max={2.0} value={speed} onChange={setSpeed} unit="x" />
                    <SliderInput label="Pitch Adjustment" min={-10} max={10} value={pitch} onChange={setPitch} />
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-gold-400" /> Language & Region
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label>Default Language</Label>
                        <Select defaultValue="en_in">
                            <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en_in">English (India)</SelectItem>
                                <SelectItem value="en_us">English (US)</SelectItem>
                                <SelectItem value="hi_in">Hindi (India)</SelectItem>
                                <SelectItem value="ta_in">Tamil (India)</SelectItem>
                                <SelectItem value="te_in">Telugu (India)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Fallback Language</Label>
                        <Select defaultValue="en_us">
                            <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en_us">English (US)</SelectItem>
                                <SelectItem value="en_in">English (India)</SelectItem>
                            </SelectContent>
                        </Select>
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
