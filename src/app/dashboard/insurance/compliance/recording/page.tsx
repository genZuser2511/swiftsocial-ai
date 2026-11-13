"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    ShieldCheck, 
    PlayCircle,
    Scissors,
    Save,
    Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function RecordingCompliancePage() {
    const [isRedacting, setIsRedacting] = useState(false)
    const [hasSaved, setHasSaved] = useState(false)

    const handleSimulateRedaction = () => {
        setIsRedacting(true)
        setHasSaved(false)
        setTimeout(() => {
            setIsRedacting(false)
            setHasSaved(true)
        }, 2000)
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Lock className="w-8 h-8 text-gold-400" />
                        Recording & Redaction
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage call recording retention policies and redact sensitive PII/PCI data from transcripts and audio.
                    </p>
                </div>
                <Badge variant="outline" className="border-gold-400/20 text-gold-400 px-4 py-2 text-sm">
                    Retention: 180 Days
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Policy Panel */}
                <div className="bg-card border border-gold-400/10 rounded-2xl p-6 lg:col-span-1 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Data Protection Policy</h2>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Automatic PII Scrubbing</p>
                                <p className="text-xs text-muted-foreground mt-1">SSN, Credit Cards, and DOBs are automatically redacted from transcripts.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Encryption at Rest</p>
                                <p className="text-xs text-muted-foreground mt-1">All audio files are encrypted using AES-256 before storage.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">Audit Trail</p>
                                <p className="text-xs text-muted-foreground mt-1">Every playback or download of a recording is logged.</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Interactive Redaction Simulator */}
                <div className="bg-card border border-gold-400/10 rounded-2xl p-6 lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Manual Audio Redaction Tool</h2>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">Simulation Mode</Badge>
                    </div>

                    <div className="flex-1 bg-black/40 border border-gold-400/5 rounded-xl p-6 flex flex-col items-center justify-center space-y-6">
                        <div className="w-full max-w-md h-24 bg-black/60 rounded-xl border border-gold-400/20 relative overflow-hidden flex items-center justify-center">
                            {/* Audio Waveform Mock */}
                            <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-50">
                                {[...Array(40)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-1 bg-gold-400 rounded-full" 
                                        style={{ height: `${Math.random() * 60 + 10}%` }}
                                    />
                                ))}
                            </div>
                            
                            {/* Redaction Overlay Mock */}
                            {hasSaved && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                    className="absolute left-1/4 w-1/4 h-full bg-black/80 backdrop-blur-sm flex items-center justify-center border-x border-red-500/50"
                                >
                                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Redacted</span>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="text-white border-gold-400/20 hover:text-gold-400 hover:border-gold-400">
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Preview Audio
                            </Button>
                            <Button 
                                onClick={handleSimulateRedaction} 
                                disabled={isRedacting}
                                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-semibold"
                            >
                                <Scissors className="w-4 h-4 mr-2" />
                                {isRedacting ? "Processing..." : "Apply Redaction Selection"}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button 
                            disabled={!hasSaved} 
                            className="bg-gold-gradient text-black font-semibold hover:opacity-90 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {hasSaved ? "Saved Successfully" : "Save Changes"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    )
}
