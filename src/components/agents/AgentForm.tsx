"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Check,
    Database,
    Globe,
    Loader2,
    MessageSquare,
    Mic,
    Plus,
    Search,
    Sparkles,
    FileText,
    Play,
    Pause,
    Cloud,
    Loader2 as Spinner
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAgentStore, Agent } from "@/store/useAgentStore"
import { useKnowledgeStore } from "@/store/useKnowledgeStore"

import { AGENT_TEMPLATES, AgentTemplate } from "@/lib/constants/agent-templates"
import { 
    Settings, 
    Target, 
    Route, 
    Zap, 
    FileJson, 
    LayoutTemplate,
    PhoneForwarded,
    ShieldAlert
} from "lucide-react"

const agentSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    voice: z.string().optional(),
    language: z.string().optional(),
    personality: z.string().optional(),
    greeting: z.string().min(1, "Greeting message is required"),
    agentType: z.enum(['inbound', 'outbound', 'both']),
    goalObjective: z.string().optional(),
    successCriteria: z.string().optional(),
    postCallAction: z.enum(['sms', 'email', 'webhook', 'none']),
    transferNumber: z.string().optional(),
    escalationTrigger: z.string().optional(),
    voicemailDetection: z.boolean().optional(),
    fallbackMessage: z.string().optional(),
    maxSilenceSeconds: z.coerce.number().min(1).max(60).optional(),
    maxCallDuration: z.coerce.number().min(30).max(3600).optional(),
    webhookUrl: z.string().optional().or(z.literal("")),
    webhookMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH']).optional(),
})

type AgentFormData = z.infer<typeof agentSchema>

const steps = [
    { id: 1, title: "Identity", icon: LayoutTemplate },
    { id: 2, title: "Voice", icon: Mic },
    { id: 3, title: "Behavior", icon: MessageSquare },
    { id: 4, title: "Logic", icon: Target },
    { id: 5, title: "Knowledge", icon: Database },
    { id: 6, title: "Advanced", icon: Settings },
    { id: 7, title: "Review", icon: Check },
]

const voices = [
    { id: "priya", name: "Priya", description: "Warm, friendly female voice", language: "Hindi/English" },
    { id: "arjun", name: "Arjun", description: "Professional male voice", language: "Hindi/English" },
    { id: "sarah", name: "Sarah", description: "Clear, neutral female voice", language: "English" },
    { id: "james", name: "James", description: "Confident male voice", language: "English" },
]

const personalities = [
    { id: "professional", name: "Professional", desc: "Formal, business-focused" },
    { id: "friendly", name: "Friendly", desc: "Warm, conversational" },
    { id: "efficient", name: "Efficient", desc: "Quick, to-the-point" },
    { id: "empathetic", name: "Empathetic", desc: "Understanding, supportive" },
]

interface AgentFormProps {
    initialData?: Agent;
    mode: "create" | "edit";
}

export function AgentForm({ initialData, mode }: AgentFormProps) {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeVerticalTab, setActiveVerticalTab] = useState<"general" | "insurance">("general")
    
    // Find initial voice and personality IDs
    const initialVoiceId = initialData ? voices.find(v => v.name === initialData.voice)?.id || "" : ""
    const initialPersonalityId = initialData ? personalities.find(p => p.name === initialData.personality)?.id || "" : ""

    const [selectedVoice, setSelectedVoice] = useState(initialVoiceId)
    const [selectedPersonality, setSelectedPersonality] = useState(initialPersonalityId)

    const [elevenLabsVoices, setElevenLabsVoices] = useState<any[]>([])
    const [isLoadingVoices, setIsLoadingVoices] = useState(false)
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const fetchElevenLabsVoices = async () => {
        setIsLoadingVoices(true)
        try {
            const res = await fetch("https://api.elevenlabs.io/v1/voices")
            const data = await res.json()
            if (data.voices) {
                setElevenLabsVoices(data.voices.slice(0, 10))
            }
        } catch (e) {
            console.error("Failed to load 11labs voices", e)
        }
        setIsLoadingVoices(false)
    }

    const togglePlay = (e: React.MouseEvent, voiceId: string, previewUrl: string) => {
        e.stopPropagation()
        if (playingVoiceId === voiceId) {
            audioRef.current?.pause()
            setPlayingVoiceId(null)
        } else {
            if (audioRef.current) {
                audioRef.current.pause()
            }
            if (!previewUrl) return;
            const audio = new Audio(previewUrl)
            audioRef.current = audio
            audio.play()
            setPlayingVoiceId(voiceId)
            audio.onended = () => setPlayingVoiceId(null)
        }
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger,
        reset,
        control,
    } = useForm<AgentFormData>({
        resolver: zodResolver(agentSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            voice: initialVoiceId,
            language: initialData?.language || "en-IN",
            personality: initialPersonalityId,
            greeting: initialData?.greeting || "Hello! Thank you for calling. How can I assist you today?",
            agentType: initialData?.agentType || 'both',
            goalObjective: initialData?.goalObjective || "",
            successCriteria: initialData?.successCriteria || "",
            postCallAction: initialData?.postCallAction || 'none',
            transferNumber: initialData?.transferNumber || "",
            escalationTrigger: initialData?.escalationTrigger || "",
            voicemailDetection: initialData?.voicemailDetection || false,
            fallbackMessage: initialData?.fallbackMessage || "",
            maxSilenceSeconds: initialData?.maxSilenceSeconds || 10,
            maxCallDuration: initialData?.maxCallDuration || 600,
            webhookUrl: initialData?.webhookUrl || "",
            webhookMethod: "POST",
        },
    })

    const applyTemplate = (template: AgentTemplate) => {
        setValue("name", template.name)
        setValue("description", template.description)
        setValue("greeting", template.greeting)
        setValue("agentType", template.agentType || "both")
        setValue("goalObjective", template.goalObjective || "")
        setValue("successCriteria", template.successCriteria || "")
        setValue("postCallAction", template.postCallAction || "none")
        setValue("fallbackMessage", template.fallbackMessage || "")
        setValue("maxSilenceSeconds", template.maxSilenceSeconds || 10)
        setValue("maxCallDuration", template.maxCallDuration || 600)
        
        const voiceId = voices.find(v => v.name === template.voice)?.id || ""
        const personalityId = personalities.find(p => p.name === template.personality)?.id || ""
        
        setSelectedVoice(voiceId)
        setSelectedPersonality(personalityId)
        
        // Move to next step automatically
        setCurrentStep(2)
    }

    const addAgent = useAgentStore((state) => state.addAgent)
    const updateAgent = useAgentStore((state) => state.updateAgent)
    const { documents, assignToAgent, unassignFromAgent } = useKnowledgeStore()

    const initialAssignedDocs = mode === "edit" && initialData
        ? documents.filter(d => d.agentIds.includes(initialData?.id || '')).map(d => d.id)
        : []
        
    const [selectedDocs, setSelectedDocs] = useState<string[]>(initialAssignedDocs)
    const [searchQuery, setSearchQuery] = useState('')

    const formValues = watch()

    // Hydration safeguard
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => setIsMounted(true), [])

    const handleFormSubmit = (data: AgentFormData) => {
        if (currentStep < steps.length) {
            nextStep()
        }
    }

    const createAgent = async (data: AgentFormData) => {
        
        setIsSubmitting(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        const agentData = {
            name: data.name,
            description: data.description || "",
            voice: voices.find((v) => v.id === selectedVoice)?.name || "Unknown",
            language: data.language || "en-IN",
            personality: personalities.find((p) => p.id === selectedPersonality)?.name || "Unknown",
            greeting: data.greeting,
            agentType: data.agentType,
            goalObjective: data.goalObjective,
            successCriteria: data.successCriteria,
            postCallAction: data.postCallAction,
            transferNumber: data.transferNumber,
            escalationTrigger: data.escalationTrigger,
            voicemailDetection: data.voicemailDetection,
            fallbackMessage: data.fallbackMessage,
            maxSilenceSeconds: data.maxSilenceSeconds,
            maxCallDuration: data.maxCallDuration,
            webhookUrl: data.webhookUrl,
            webhookMethod: data.webhookMethod
        }

        let agentId = initialData?.id;

        if (mode === "edit" && initialData) {
            await updateAgent(initialData.id, agentData)
        } else {
            const newAgentId = await addAgent(agentData)
            if (newAgentId) agentId = newAgentId
        }

        if (agentId) {
            documents.forEach(doc => {
                const wasAssigned = initialAssignedDocs.includes(doc.id)
                const isNowAssigned = selectedDocs.includes(doc.id)
                
                if (isNowAssigned && !wasAssigned) {
                    assignToAgent(doc.id, agentId)
                } else if (!isNowAssigned && wasAssigned) {
                    unassignFromAgent(doc.id, agentId)
                }
            })
        }
        
        setIsSubmitting(false)
        router.push(mode === "edit" ? `/dashboard/agents/${initialData?.id}` : "/dashboard/agents")
    }

    const nextStep = async () => {
        let fieldsToValidate: (keyof AgentFormData)[] = []
        if (currentStep === 1) fieldsToValidate = ["name", "description", "agentType"]
        if (currentStep === 3) fieldsToValidate = ["greeting", "fallbackMessage", "maxSilenceSeconds"]
        if (currentStep === 4) fieldsToValidate = ["goalObjective", "successCriteria", "postCallAction"]
        if (currentStep === 6) fieldsToValidate = ["maxCallDuration", "webhookUrl"]
        
        const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate) : true
        
        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length))
        }
    }
    const prevStep = () => {
        if (currentStep === 1) {
            if (mode === "edit" && initialData) {
                router.push(`/dashboard/agents/${initialData.id}`)
            } else {
                router.push("/dashboard/agents")
            }
            return
        }
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground w-full h-[40vh]">
                <Spinner className="w-8 h-8 animate-spin text-gold-400 mb-4" />
                <p>Loading agent framework...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        <div
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors",
                                currentStep >= step.id
                                    ? "bg-gold-gradient"
                                    : "bg-muted"
                            )}
                        >
                            <step.icon
                                className={cn(
                                    "w-5 h-5",
                                    currentStep >= step.id ? "text-black" : "text-muted-foreground"
                                )}
                            />
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "h-1 flex-1 mx-2 rounded-full transition-colors",
                                    currentStep > step.id ? "bg-gold-400" : "bg-muted"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Step 1: Identity & Templates */}
                {currentStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        {mode === "create" && (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {Object.entries(AGENT_TEMPLATES)
                                        .filter(([_, t]) => (t.vertical || 'general') === activeVerticalTab)
                                        .map(([key, template]) => (
                                        <Button
                                            key={key}
                                            type="button"
                                            variant="outline"
                                            className="h-auto p-3 flex flex-col items-start text-left border-gold-400/20 hover:border-gold-400 bg-muted/30 transition-all hover:bg-gold-400/5"
                                            onClick={() => applyTemplate(template)}
                                        >
                                            <span className="font-bold text-xs text-gold-400 uppercase mb-1">Template</span>
                                            <span className="font-semibold text-sm truncate w-full">{template.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5 text-gold-400" />
                                Basic Information
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Agent Name</Label>
                                        <Input id="name" placeholder="e.g., Customer Support Bot" {...register("name")} />
                                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="agentType">Agent Type</Label>
                                        <select 
                                            id="agentType" 
                                            {...register("agentType")}
                                            className="w-full bg-muted border-gold-400/20 rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-gold-400 outline-none"
                                        >
                                            <option value="both">Both (Inbound & Outbound)</option>
                                            <option value="inbound">Inbound Only</option>
                                            <option value="outbound">Outbound Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" placeholder="What will this agent do?" rows={2} {...register("description")} />
                                </div>
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 2: Voice & Language */}
                {currentStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <GradientCard>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2 m-0">
                                    <Mic className="w-5 h-5 text-gold-400" />
                                    Voice & Language
                                </h2>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={fetchElevenLabsVoices}
                                    disabled={isLoadingVoices}
                                    className="border-gold-400/20 hover:bg-gold-400/10 text-gold-400"
                                >
                                    {isLoadingVoices ? <Spinner className="w-4 h-4 animate-spin mr-2" /> : <Cloud className="w-4 h-4 mr-2" />}
                                    Load ElevenLabs Voices
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {voices.map((voice) => (
                                    <div
                                        key={voice.id}
                                        onClick={() => setSelectedVoice(voice.id)}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                            selectedVoice === voice.id
                                                ? "border-gold-400 bg-gold-400/10"
                                                : "border-gold-400/20 hover:border-gold-400/40"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center">
                                                <Mic className="w-5 h-5 text-black" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{voice.name}</p>
                                                <p className="text-xs text-muted-foreground">{voice.language}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{voice.description}</p>
                                    </div>
                                ))}
                                {elevenLabsVoices.map((voice) => (
                                    <div
                                        key={voice.voice_id}
                                        onClick={() => setSelectedVoice(voice.voice_id)}
                                        className={cn(
                                            "p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between",
                                            selectedVoice === voice.voice_id
                                                ? "border-gold-400 bg-gold-400/10"
                                                : "border-gold-400/20 hover:border-gold-400/40"
                                        )}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                        <Cloud className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{voice.name} <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-1">11Labs</span></p>
                                                        <p className="text-xs text-muted-foreground">{voice.labels?.accent || "English"}</p>
                                                    </div>
                                                </div>
                                                {voice.preview_url && (
                                                    <Button 
                                                        type="button" 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={(e) => togglePlay(e, voice.voice_id, voice.preview_url)}
                                                        className="h-8 w-8 rounded-full hover:bg-gold-400/20"
                                                    >
                                                        {playingVoiceId === voice.voice_id ? <Pause className="w-4 h-4 text-gold-400" /> : <Play className="w-4 h-4 text-gold-400" />}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{voice.labels?.description || "High-quality realistic voice"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 3: Behavior & Conversation */}
                {currentStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gold-400" />
                                Conversation Settings
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {personalities.map((p) => (
                                        <div
                                            key={p.id}
                                            onClick={() => setSelectedPersonality(p.id)}
                                            className={cn(
                                                "p-4 rounded-lg border-2 cursor-pointer transition-all text-center",
                                                selectedPersonality === p.id
                                                    ? "border-gold-400 bg-gold-400/10"
                                                    : "border-gold-400/20 hover:border-gold-400/40"
                                            )}
                                        >
                                            <p className="font-medium mb-1">{p.name}</p>
                                            <p className="text-sm text-muted-foreground">{p.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="greeting">Greeting Message</Label>
                                        <Textarea id="greeting" placeholder="How should the agent greet callers?" rows={3} {...register("greeting")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fallbackMessage">Fallback Message</Label>
                                        <Textarea id="fallbackMessage" placeholder="What to say when confused?" rows={2} {...register("fallbackMessage")} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="maxSilenceSeconds">Max Silence (seconds)</Label>
                                            <Input type="number" id="maxSilenceSeconds" {...register("maxSilenceSeconds")} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 4: Goals & Routing */}
                {currentStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-gold-400" />
                                Goal Achievement
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="goalObjective">Call Goal / Objective</Label>
                                    <Input id="goalObjective" placeholder="e.g., Book an appointment" {...register("goalObjective")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postCallAction">Post-Call Action</Label>
                                    <select 
                                        id="postCallAction" 
                                        {...register("postCallAction")}
                                        className="w-full bg-muted border-gold-400/20 rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-gold-400 outline-none"
                                    >
                                        <option value="none">None</option>
                                        <option value="sms">Send SMS</option>
                                        <option value="email">Send Email</option>
                                        <option value="webhook">Trigger Webhook</option>
                                    </select>
                                    {watch("postCallAction") === "webhook" && (
                                        <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded border border-gold-400/10">
                                            <strong>What is a Webhook?</strong> It is an automated message sent to another app. When a call finishes, we will instantly send the call data (transcript, summary, etc.) to your custom server, CRM, or automation tool like Zapier.
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="successCriteria">Success Criteria</Label>
                                    <Textarea id="successCriteria" placeholder="How do we know the goal was met?" rows={2} {...register("successCriteria")} />
                                </div>
                            </div>
                        </GradientCard>

                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Route className="w-5 h-5 text-gold-400" />
                                Routing & Escalation
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="transferNumber">Transfer Number (Internal/Expert)</Label>
                                    <Input id="transferNumber" placeholder="+91 XXXX XXXX" {...register("transferNumber")} />
                                </div>
                                <div className="flex items-center space-x-2 pt-8">
                                    <Controller
                                        name="voicemailDetection"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch 
                                                id="voicemailDetection" 
                                                checked={field.value} 
                                                onCheckedChange={field.onChange} 
                                            />
                                        )}
                                    />
                                    <Label htmlFor="voicemailDetection" className="cursor-pointer">Enable Voicemail Detection</Label>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="escalationTrigger" className={!watch("transferNumber") ? "text-muted-foreground/50" : ""}>Escalation Trigger (When to transfer?)</Label>
                                    <Textarea 
                                        id="escalationTrigger" 
                                        placeholder={watch("transferNumber") ? "e.g., When user asks for a manager or mentions 'refund'" : "Please enter a Transfer Number first to enable escalation."} 
                                        rows={2} 
                                        {...register("escalationTrigger")} 
                                        disabled={!watch("transferNumber")}
                                        className={!watch("transferNumber") ? "opacity-50 cursor-not-allowed" : ""}
                                    />
                                </div>
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 5: Knowledge */}
                {currentStep === 5 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Database className="w-5 h-5 text-gold-400" />
                                Knowledge Base
                            </h2>
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search documents..." className="pl-10 bg-muted/50 border-gold-400/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {documents.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase())).map((doc) => {
                                    const isSelected = selectedDocs.includes(doc.id)
                                    return (
                                        <div key={doc.id} onClick={() => setSelectedDocs(prev => isSelected ? prev.filter(id => id !== doc.id) : [...prev, doc.id])}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-gold-400 bg-gold-400/10' : 'border-border bg-muted/30 hover:border-gold-400/50'}`}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${doc.type === 'link' ? 'bg-sky-500/10 text-sky-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {doc.type === 'link' ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{doc.type === 'link' ? doc.url : doc.size}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-gold-400 border-gold-400' : 'border-muted-foreground'}`}>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-black" />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 6: Advanced Settings */}
                {currentStep === 6 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gold-400" />
                                Advanced Configuration
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="bg-muted px-2 py-1 rounded text-xs">Method</span>
                                            <select 
                                                {...register("webhookMethod")}
                                                className="bg-background border-gold-400/20 rounded-md h-7 px-2 text-xs focus:ring-1 focus:ring-gold-400 outline-none"
                                            >
                                                <option value="POST">POST</option>
                                                <option value="GET">GET</option>
                                                <option value="PUT">PUT</option>
                                                <option value="PATCH">PATCH</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Input id="webhookUrl" placeholder="https://api.yourdomain.com/webhooks/calls" {...register("webhookUrl")} />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Receive real-time notifications about call status, transcripts, and post-call analysis directly to your server.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxCallDuration">Max Call Duration (seconds)</Label>
                                        <Input type="number" id="maxCallDuration" {...register("maxCallDuration")} />
                                    </div>
                                </div>
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Step 7: Review */}
                {currentStep === 7 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <GradientCard>
                            <h2 className="text-xl font-semibold mb-6">Review & {mode === "edit" ? "Update" : "Create"}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Agent Name</p>
                                    <p className="font-medium">{watch("name")}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Type</p>
                                    <p className="font-medium uppercase">{watch("agentType")}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Goal</p>
                                    <p className="font-medium">{watch("goalObjective") || "General Chat"}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Post-Call</p>
                                    <p className="font-medium uppercase">{watch("postCallAction")}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Voice</p>
                                    <p className="font-medium">
                                        {voices.find((v) => v.id === selectedVoice)?.name || "Not selected"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground mb-1">Personality</p>
                                    <p className="font-medium">
                                        {personalities.find((p) => p.id === selectedPersonality)?.name || "Not selected"}
                                    </p>
                                </div>
                            </div>
                        </GradientCard>
                    </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="border-gold-400/20"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back
                    </Button>

                    {currentStep < steps.length ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-gold-gradient text-black"
                        >
                            Continue
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleSubmit(createAgent)}
                            className="bg-gold-gradient text-black"
                            disabled={isSubmitting || !selectedVoice || !selectedPersonality}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    {mode === "edit" ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 w-4 h-4" />
                                    {mode === "edit" ? "Update Agent" : "Create Agent"}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
