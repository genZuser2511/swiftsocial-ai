"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    Building2, 
    Phone, 
    Bot, 
    ChevronRight, 
    ChevronLeft, 
    Check, 
    Globe, 
    ShieldCheck,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAgentStore } from "@/store/useAgentStore"

const steps = [
    { id: 1, name: "Organization", icon: Building2, description: "Set up your company profile" },
    { id: 2, name: "Phone Number", icon: Phone, description: "Choose your business line" },
    { id: 3, name: "First Agent", icon: Bot, description: "Launch your first AI voice" },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        orgName: "",
        industry: "",
        region: "US",
        phoneNumber: "",
        agentName: "Aria",
    })

    const handleNext = async () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        } else {
            // Complete onboarding in DB
            try {
                const res = await fetch('/api/onboarding', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        orgName: formData.orgName,
                        region: formData.region,
                        phoneNumber: formData.phoneNumber
                    })
                })
                
                if (res.ok) {
                    useAgentStore.setState({ onboardingCompleted: true })
                } else {
                    console.error("Onboarding failed")
                }
            } catch (err) {
                console.error(err)
            }
            router.push("/dashboard")
        }
    }

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const regionalNumbers: Record<string, string[]> = {
        "US": ["+1 (555) 012-3456", "+1 (555) 987-6543", "+1 (555) 444-2222"],
        "UK": ["+44 20 7946 0001", "+44 20 7946 0002", "+44 20 7946 0003"],
        "International": ["+49 152 54321098", "+61 412 345 678", "+81 90 1234 5678"]
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="w-full max-w-2xl z-10">
                {/* Logo & Progress */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3" />
                        Setup Wizard
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome to SwiftCall</h1>
                    <p className="text-muted-foreground">Let's get your AI call center running in 3 minutes.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                    <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-gold-gradient -translate-y-1/2 transition-all duration-500 z-0" 
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                                currentStep >= step.id 
                                    ? "bg-black border-gold-400 text-gold-400" 
                                    : "bg-black border-muted text-muted-foreground"
                            )}>
                                {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase tracking-tighter mt-2 font-bold",
                                currentStep >= step.id ? "text-gold-400" : "text-muted-foreground"
                            )}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="bg-card/50 border-gold-400/10 p-8 backdrop-blur-xl">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">Company Information</h2>
                                        <p className="text-sm text-muted-foreground">Tell us about your organization to personalize your AI.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gold-400">Organization Name</label>
                                            <Input 
                                                placeholder="e.g. Acme Real Estate" 
                                                className="bg-background/50 border-gold-400/10 focus-visible:ring-gold-400/50"
                                                value={formData.orgName}
                                                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gold-400">Industry</label>
                                            <select className="w-full h-10 px-3 rounded-md bg-background/50 border border-gold-400/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold-400/50">
                                                <option>Real Estate</option>
                                                <option>Insurance</option>
                                                <option>SaaS / Tech</option>
                                                <option>Medical / Healthcare</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2">Assign Your Business Line</h2>
                                        <p className="text-sm text-muted-foreground">Select a dedicated phone number for your AI agents.</p>
                                    </div>
                                    
                                    <div className="flex gap-2 mb-4">
                                        {["US", "UK", "International"].map(r => (
                                            <Button 
                                                key={r}
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    "flex-1 border-gold-400/10",
                                                    formData.region === r ? "bg-gold-400/20 border-gold-400 text-white" : "text-muted-foreground"
                                                )}
                                                onClick={() => setFormData({...formData, region: r, phoneNumber: ""})}
                                            >
                                                {r}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {regionalNumbers[formData.region].map((num) => (
                                            <div 
                                                key={num}
                                                onClick={() => setFormData({...formData, phoneNumber: num})}
                                                className={cn(
                                                    "p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                                                    formData.phoneNumber === num 
                                                        ? "bg-gold-400/10 border-gold-400 text-white" 
                                                        : "bg-background/50 border-gold-400/10 text-muted-foreground hover:bg-gold-400/5"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-gold-400" />
                                                    <span className="font-mono text-lg">{num}</span>
                                                </div>
                                                {formData.phoneNumber === num && <Check className="w-5 h-5 text-gold-400" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center py-4">
                                        <div className="w-20 h-20 rounded-3xl bg-gold-gradient mx-auto flex items-center justify-center text-black mb-4">
                                            <Bot className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Ready to Launch!</h2>
                                        <p className="text-sm text-muted-foreground px-8">
                                            We've prepared your first agent, **{formData.agentName}**, configured for {formData.orgName}. 
                                            You can customize their personality in the dashboard.
                                        </p>
                                    </div>
                                    <div className="bg-gold-400/5 border border-gold-400/10 rounded-xl p-4 flex items-center gap-4">
                                        <ShieldCheck className="w-10 h-10 text-gold-400 shrink-0" />
                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                            Your organization is now compliant and secured with RLS. Your AI is ready to handle calls on <span className="text-white font-mono">{formData.phoneNumber}</span>.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between mt-12 pt-6 border-t border-gold-400/10">
                                <Button 
                                    variant="ghost" 
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    className="text-muted-foreground hover:text-gold-400"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button 
                                    onClick={handleNext}
                                    className="bg-gold-gradient text-black font-bold px-8 h-11 hover:opacity-90"
                                    disabled={currentStep === 1 && !formData.orgName}
                                >
                                    {currentStep === steps.length ? "Get Started" : "Continue"}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Footer Info */}
                <p className="text-center mt-8 text-xs text-muted-foreground">
                    Step {currentStep} of 3 — Secure Setup for {formData.orgName || "Organization"}
                </p>
            </div>
        </div>
    )
}
