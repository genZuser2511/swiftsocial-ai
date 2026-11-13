"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    BarChart3,
    Bot,
    Brain,
    Calendar,
    CheckCircle2,
    Globe,
    Headphones,
    Languages,
    LineChart,
    Lock,
    MessageSquare,
    Mic,
    Phone,
    Plug,
    Settings,
    Shield,
    Sparkles,
    Users,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const voiceFeatures = [
    {
        icon: Brain,
        title: "Natural Language Understanding",
        description: "Our AI understands context, intent, and nuance just like a human agent would.",
    },
    {
        icon: Mic,
        title: "Human-Like Conversations",
        description: "Natural speech patterns, appropriate pauses, and emotional intelligence.",
    },
    {
        icon: MessageSquare,
        title: "Multi-Turn Dialogues",
        description: "Handles complex conversations with context retention across the entire call.",
    },
    {
        icon: Languages,
        title: "50+ Languages",
        description: "Support customers globally with native-quality voice in their preferred language.",
    },
]

const intelligenceFeatures = [
    {
        icon: Sparkles,
        title: "Intent Recognition",
        description: "Instantly understand what callers need and route them to the right solution.",
    },
    {
        icon: BarChart3,
        title: "Sentiment Analysis",
        description: "Detect customer emotions in real-time and adapt responses accordingly.",
    },
    {
        icon: Bot,
        title: "Smart Escalation",
        description: "Seamlessly transfer to human agents when needed, with full context.",
    },
    {
        icon: Zap,
        title: "Real-Time Decisions",
        description: "Make intelligent decisions during calls based on your business rules.",
    },
]

const integrations = [
    { name: "Salesforce", category: "CRM" },
    { name: "HubSpot", category: "CRM" },
    { name: "Zoho", category: "CRM" },
    { name: "Zendesk", category: "Helpdesk" },
    { name: "Freshdesk", category: "Helpdesk" },
    { name: "Intercom", category: "Helpdesk" },
    { name: "Google Calendar", category: "Calendar" },
    { name: "Outlook", category: "Calendar" },
    { name: "Shopify", category: "E-commerce" },
    { name: "WooCommerce", category: "E-commerce" },
    { name: "Webhooks", category: "Custom" },
    { name: "REST API", category: "Custom" },
]

const analyticsFeatures = [
    {
        icon: LineChart,
        title: "Call Analytics Dashboard",
        description: "Real-time insights into call volumes, success rates, and agent performance.",
    },
    {
        icon: Users,
        title: "Customer Insights",
        description: "Understand your customers better with conversation analytics and trends.",
    },
    {
        icon: BarChart3,
        title: "ROI Tracking",
        description: "Track cost savings, efficiency gains, and revenue impact automatically.",
    },
]

const securityFeatures = [
    { title: "End-to-End Encryption", description: "All calls and data encrypted in transit and at rest" },
    { title: "GDPR Compliant", description: "Full compliance with European data protection regulations" },
    { title: "SOC 2 Certified", description: "Enterprise-grade security controls and audits" },
    { title: "HIPAA Available", description: "Healthcare-compliant deployments for medical organizations" },
    { title: "Data Privacy Controls", description: "Fine-grained control over data retention and access" },
    { title: "99.9% Uptime SLA", description: "Guaranteed availability for mission-critical operations" },
]

export default function FeaturesPage() {
    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 hero-bg" />
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Features
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Everything You Need to{" "}
                            <span className="text-gold-gradient">Automate Calls</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Advanced AI voice technology, seamless integrations, and powerful analytics
                            to transform your call center operations.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Voice Technology */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="AI Voice Technology"
                        title="Conversations that feel"
                        titleHighlight="human"
                        description="State-of-the-art natural language processing for natural, engaging conversations."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {voiceFeatures.map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <GlassCard className="h-full text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6">
                                        <feature.icon className="w-8 h-8 text-black" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Intelligence Features */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Intelligence"
                        title="Smart decisions"
                        titleHighlight="in real-time"
                        description="AI that understands, decides, and acts intelligently during every conversation."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                    >
                        {intelligenceFeatures.map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <GradientCard className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0">
                                            <feature.icon className="w-6 h-6 text-gold-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                </GradientCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Integrations */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Integrations"
                        title="Connect with your"
                        titleHighlight="favorite tools"
                        description="Seamlessly integrate with your existing CRM, helpdesk, and business systems."
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto"
                    >
                        {integrations.map((integration, index) => (
                            <motion.div
                                key={integration.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted/50 border border-gold-400/10 hover:border-gold-400/30 transition-colors"
                            >
                                <Plug className="w-4 h-4 text-gold-400" />
                                <span className="font-medium">{integration.name}</span>
                                <span className="text-xs text-muted-foreground">({integration.category})</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Analytics */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Analytics"
                        title="Insights that drive"
                        titleHighlight="growth"
                        description="Powerful analytics to optimize performance and maximize ROI."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {analyticsFeatures.map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <GlassCard className="h-full text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-6">
                                        <feature.icon className="w-8 h-8 text-gold-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Security */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Security"
                        title="Enterprise-grade"
                        titleHighlight="security"
                        description="Your data is protected with industry-leading security standards."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
                    >
                        {securityFeatures.map((feature) => (
                            <motion.div key={feature.title} variants={fadeInUp}>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to see it <span className="text-gold-gradient">in action</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start your free trial today and experience the power of AI voice agents.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/signup">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-gold-400/30" asChild>
                                <Link href="/demo">Watch Demo</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
