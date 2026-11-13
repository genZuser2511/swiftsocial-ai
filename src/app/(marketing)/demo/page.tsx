"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    Mic,
    Pause,
    Play,
    Phone,
    Sparkles,
    Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const sampleConversations = [
    {
        title: "Customer Support",
        description: "Order tracking and support inquiry",
        transcript: [
            { speaker: "AI", text: "Hello! Thank you for calling SwiftShop support. How can I help you today?" },
            { speaker: "Customer", text: "Hi, I want to check on my order. It was supposed to arrive yesterday." },
            { speaker: "AI", text: "I'd be happy to help you track your order. Could you please provide your order number or the email address used for the purchase?" },
            { speaker: "Customer", text: "The order number is ORD-789456" },
            { speaker: "AI", text: "Thank you! I found your order. It's currently with the courier and scheduled for delivery today by 6 PM. Would you like me to send you the tracking link via SMS?" },
            { speaker: "Customer", text: "Yes please, that would be great" },
            { speaker: "AI", text: "Done! I've sent the tracking link to your registered mobile number. Is there anything else I can help you with?" },
        ],
    },
    {
        title: "Sales Outreach",
        description: "B2B lead qualification call",
        transcript: [
            { speaker: "AI", text: "Hi, this is Alex from SwiftSocial AI. I'm calling regarding improving call center efficiency. Is this a good time to chat for 2 minutes?" },
            { speaker: "Prospect", text: "Sure, go ahead" },
            { speaker: "AI", text: "Great! I noticed your company handles a high volume of customer calls. Are you currently using any automation tools for your support team?" },
            { speaker: "Prospect", text: "Not really, we have about 30 agents handling calls manually" },
            { speaker: "AI", text: "I see. With 30 agents, you're likely spending around ₹9 lakhs per month on agent costs alone. Our AI voice agents typically help companies like yours reduce that by 60-70% while handling more calls. Would you be interested in a 15-minute demo to see how it works?" },
            { speaker: "Prospect", text: "That sounds interesting. Yes, let's schedule something" },
            { speaker: "AI", text: "Perfect! I'll transfer you to our sales team right now to find a time that works. Thank you for your interest!" },
        ],
    },
    {
        title: "Appointment Booking",
        description: "Healthcare appointment scheduling",
        transcript: [
            { speaker: "AI", text: "Good morning! Thank you for calling City Health Clinic. How may I assist you today?" },
            { speaker: "Patient", text: "I need to book an appointment with Dr. Sharma" },
            { speaker: "AI", text: "Of course! Dr. Sharma has availability this Thursday at 10 AM and Friday at 3 PM. Which works better for you?" },
            { speaker: "Patient", text: "Thursday at 10 works" },
            { speaker: "AI", text: "Perfect. I've booked you for Thursday, February 6th at 10 AM with Dr. Sharma. You'll receive a confirmation SMS shortly. Please arrive 10 minutes early with your insurance card. Anything else I can help with?" },
        ],
    },
]

const features = [
    {
        title: "Natural Conversations",
        description: "Our AI sounds human, not robotic. Natural pauses, emotion, and context awareness.",
    },
    {
        title: "Multi-Language Support",
        description: "Speak to customers in 50+ languages with native-quality pronunciation.",
    },
    {
        title: "Real-Time Transcription",
        description: "Every call is transcribed in real-time for quality assurance and training.",
    },
    {
        title: "Smart Escalation",
        description: "Seamlessly transfer to human agents when needed, with full context.",
    },
]

export default function DemoPage() {
    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 hero-bg" />
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Live Demo
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            See <span className="text-gold-gradient">AI Voice Agents</span>
                            <br className="hidden md:block" />
                            In Action
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Listen to real conversations and experience the future of automated calling.
                        </p>
                        <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                            <Link href="/signup">
                                Try It Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Interactive Demo Widget Placeholder */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Try It Now"
                        title="Talk to our"
                        titleHighlight="AI agent"
                        description="Click the button below to start a live conversation with our AI."
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-md mx-auto"
                    >
                        <GradientCard className="text-center">
                            <div className="w-24 h-24 rounded-full bg-gold-gradient mx-auto mb-6 flex items-center justify-center relative">
                                <Phone className="w-10 h-10 text-black" />
                                <div className="absolute inset-0 rounded-full animate-ping bg-gold-400/30" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Live AI Demo</h3>
                            <p className="text-muted-foreground mb-6">
                                Click to start a conversation with our AI voice agent.
                                Experience natural, human-like conversations firsthand.
                            </p>
                            <Button size="lg" className="bg-gold-gradient text-black font-semibold w-full">
                                <Mic className="mr-2 w-5 h-5" />
                                Start Conversation
                            </Button>
                            <p className="text-xs text-muted-foreground mt-4">
                                No signup required • 100% free • Works in your browser
                            </p>
                        </GradientCard>
                    </motion.div>
                </div>
            </section>

            {/* Sample Conversations */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Sample Calls"
                        title="Real conversation"
                        titleHighlight="examples"
                        description="See how our AI handles different types of calls."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-8 max-w-4xl mx-auto"
                    >
                        {sampleConversations.map((conversation, index) => (
                            <motion.div key={conversation.title} variants={fadeInUp}>
                                <GradientCard>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-semibold">{conversation.title}</h3>
                                            <p className="text-muted-foreground text-sm">{conversation.description}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-gold-400/30">
                                            <Play className="w-4 h-4 mr-2" />
                                            Play Audio
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {conversation.transcript.map((line, i) => (
                                            <div
                                                key={i}
                                                className={`flex gap-3 ${line.speaker === "AI" ? "" : "flex-row-reverse"}`}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${line.speaker === "AI"
                                                            ? "bg-gold-gradient"
                                                            : "bg-muted"
                                                        }`}
                                                >
                                                    {line.speaker === "AI" ? (
                                                        <Volume2 className="w-4 h-4 text-black" />
                                                    ) : (
                                                        <span className="text-xs font-medium">
                                                            {line.speaker.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={`flex-1 p-4 rounded-xl ${line.speaker === "AI"
                                                            ? "bg-gold-400/10"
                                                            : "bg-muted"
                                                        }`}
                                                >
                                                    <span className="text-xs font-medium text-muted-foreground mb-1 block">
                                                        {line.speaker}
                                                    </span>
                                                    <p>{line.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GradientCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {features.map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <GlassCard className="h-full text-center">
                                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to <span className="text-gold-gradient">Transform</span> Your Calls?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start automating your call center today with a 14-day free trial.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/signup">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-gold-400/30" asChild>
                                <Link href="/contact">Book a Demo</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
