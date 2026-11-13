"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Zap, CheckCircle2, ChevronRight, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { WORKFLOW_TEMPLATES } from "@/lib/constants/workflow-templates"
import { useAgentStore } from "@/store/useAgentStore"

export default function NewWorkflowPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [activeVerticalTab, setActiveVerticalTab] = useState<"general" | "insurance">("general")
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        triggerEvent: "",
        actionType: "",
    })

    const applyTemplate = (template: any) => {
        setSelectedTemplate(template)
        setFormData({
            name: template.name,
            triggerEvent: template.triggerEvent,
            actionType: template.actionType,
        })
        setCurrentStep(2)
    }

    const { addWorkflow } = useAgentStore()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSave = async () => {
        setIsSubmitting(true)
        await addWorkflow({
            name: formData.name,
            triggerEvent: formData.triggerEvent,
            condition: "default",
            actionType: formData.actionType,
            actionConfig: {},
            isActive: true
        })
        setIsSubmitting(false)
        router.push("/dashboard/workflows")
    }

    return (
        <div className="flex-1 overflow-y-auto bg-black min-h-screen">
            <div className="max-w-5xl mx-auto p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-white rounded-full">
                            <Link href="/dashboard/workflows">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Create Workflow</h1>
                            <p className="text-muted-foreground text-sm mt-1">Automate tasks based on AI conversation outcomes.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar Steps */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="bg-card/30 border border-gold-400/20 rounded-xl p-4 backdrop-blur-sm sticky top-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Workflow Setup</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors", currentStep >= 1 ? "bg-gold-400 text-black" : "bg-muted text-muted-foreground")}>
                                        {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                                    </div>
                                    <span className={cn("text-sm font-medium", currentStep >= 1 ? "text-white" : "text-muted-foreground")}>Select Template</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors", currentStep >= 2 ? "bg-gold-400 text-black" : "bg-muted text-muted-foreground")}>
                                        {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                                    </div>
                                    <span className={cn("text-sm font-medium", currentStep >= 2 ? "text-white" : "text-muted-foreground")}>Configure Triggers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-9">
                        <div className="bg-card/30 border border-gold-400/20 rounded-xl p-6 backdrop-blur-sm">
                            
                            {/* Step 1: Templates */}
                            {currentStep === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-2 border-b border-gold-400/20 pb-2">
                                            <Button 
                                                variant="ghost" 
                                                type="button"
                                                onClick={() => setActiveVerticalTab('general')}
                                                className={cn("text-sm font-medium rounded-none border-b-2 px-4 h-9", activeVerticalTab === 'general' ? "border-gold-400 text-gold-400 bg-gold-400/10" : "border-transparent text-muted-foreground hover:text-foreground")}
                                            >
                                                General Templates
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                type="button"
                                                onClick={() => setActiveVerticalTab('insurance')}
                                                className={cn("text-sm font-medium rounded-none border-b-2 px-4 h-9", activeVerticalTab === 'insurance' ? "border-gold-400 text-gold-400 bg-gold-400/10" : "border-transparent text-muted-foreground hover:text-foreground")}
                                            >
                                                Insurance Templates
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {Object.entries(WORKFLOW_TEMPLATES)
                                                .filter(([_, t]) => (t.vertical || 'general') === activeVerticalTab)
                                                .map(([key, template]) => (
                                                <Button
                                                    key={key}
                                                    type="button"
                                                    variant="outline"
                                                    className="h-auto p-4 flex flex-col items-start text-left border-gold-400/20 hover:border-gold-400 bg-muted/30 transition-all hover:bg-gold-400/5 group"
                                                    onClick={() => applyTemplate(template)}
                                                >
                                                    <div className="flex items-center justify-between w-full mb-2">
                                                        <span className="font-bold text-xs text-gold-400 uppercase"><Zap className="w-3 h-3 inline-block mr-1" /> Template</span>
                                                    </div>
                                                    <span className="font-semibold text-sm truncate w-full mb-1">{template.name}</span>
                                                    <span className="text-xs text-muted-foreground font-normal line-clamp-2">{template.description}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-gold-400/10">
                                        <div className="text-sm text-muted-foreground">Select a template to continue</div>
                                        <Button disabled variant="outline" className="border-gold-400/20">Next Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Configure Workflow */}
                            {currentStep === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-white">Workflow Name</label>
                                            <Input 
                                                value={formData.name} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="bg-black border-gold-400/30 text-white focus:border-gold-400"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">Trigger Event</label>
                                                <Input 
                                                    value={formData.triggerEvent}
                                                    disabled
                                                    className="bg-muted border-gold-400/10 text-muted-foreground"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-white">Action Type</label>
                                                <Input 
                                                    value={formData.actionType}
                                                    disabled
                                                    className="bg-muted border-gold-400/10 text-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gold-400/5 border border-gold-400/20 p-4 rounded-lg mt-4">
                                            <div className="flex items-center gap-2 text-gold-400 font-medium text-sm mb-2">
                                                <Settings className="w-4 h-4" />
                                                <span>Configuration Preset</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                This template comes pre-configured with conditions and actions suitable for {formData.name}. 
                                                In this version, configuration parameters are fixed to the template defaults.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-gold-400/10 mt-6">
                                        <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-muted-foreground hover:text-white">
                                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                        </Button>
                                        <Button onClick={handleSave} className="bg-gold-gradient text-black font-bold">
                                            Save Workflow
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
