"use client"
import { useState } from "react"
import { Save, Bot, Sliders, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/shared/GradientCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"

export function AIModelTab() {
    const [temp, setTemp] = useState(0.7)
    const [saving, setSaving] = useState(false)
    const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 900)); setSaving(false) }

    const models = [
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", badge: "Fast", desc: "Best for high-volume calls with low latency" },
        { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", badge: "Smart", desc: "Best reasoning, ideal for complex conversations" },
        { id: "gpt-4o", name: "GPT-4o", badge: "Popular", desc: "Balanced performance and intelligence" },
        { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", badge: "Reliable", desc: "Excellent for empathetic customer interactions" },
    ]
    const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash")

    const getTempLabel = (v: number) => v <= 0.3 ? "Precise" : v <= 0.6 ? "Balanced" : v <= 0.8 ? "Creative" : "Wild"

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-gold-400" /> LLM Selection
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                    {models.map(m => (
                        <button key={m.id} onClick={() => setSelectedModel(m.id)}
                            className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${selectedModel === m.id ? "border-gold-400/50 bg-gold-400/10" : "border-gold-400/10 hover:border-gold-400/30"}`}>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{m.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${selectedModel === m.id ? "bg-gold-400/20 text-gold-400" : "bg-muted text-muted-foreground"}`}>{m.badge}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{m.desc}</p>
                        </button>
                    ))}
                </div>
            </GradientCard>

            <GradientCard>
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-gold-400" /> Model Parameters
                </h2>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm font-semibold text-gold-400">{temp.toFixed(1)} — {getTempLabel(temp)}</span>
                        </div>
                        <input type="range" min={0} max={1} step={0.1} value={temp}
                            onChange={e => setTemp(Number(e.target.value))}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-yellow-400 bg-muted/50" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0.0 · Precise</span><span>1.0 · Creative</span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Fallback Behavior</Label>
                        <Select defaultValue="transfer">
                            <SelectTrigger className="border-gold-400/10 bg-background/50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transfer">Transfer to human agent</SelectItem>
                                <SelectItem value="voicemail">Send to voicemail</SelectItem>
                                <SelectItem value="callback">Schedule a callback</SelectItem>
                                <SelectItem value="retry">Retry with different prompt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gold-400/10">
                        {[
                            { label: "Enable RAG (Knowledge Base retrieval)", desc: "AI pulls from your knowledge docs" },
                            { label: "Sentiment analysis on calls", desc: "Detect caller mood in real-time" },
                            { label: "Auto-summarize calls", desc: "Generate post-call notes automatically" },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{s.label}</p>
                                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        ))}
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
