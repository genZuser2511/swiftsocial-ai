"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    DollarSign,
    Headphones,
    HeartPulse,
    Home,
    MessageSquare,
    Phone,
    PhoneCall,
    PhoneOutgoing,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const primaryUseCases = [
    {
        id: "call-center",
        icon: Headphones,
        title: "Call Center Automation",
        subtitle: "24/7 Customer Support",
        description: "Replace expensive call center agents with AI that handles FAQs, order tracking, and tier-1 support around the clock.",
        problem: [
            "High agent costs (₹20k-40k per agent/month)",
            "Limited hours (8-hour shifts, weekends off)",
            "Long wait times frustrate customers",
            "High turnover and training costs",
            "Can't scale during peak hours",
        ],
        solution: [
            "24/7 availability, no breaks needed",
            "Handle unlimited simultaneous calls",
            "Instant responses, zero wait time",
            "Consistent quality every time",
            "Scale up instantly during peaks",
        ],
        conversation: {
            customer: "I want to check my order status",
            ai: "I'd be happy to help! Can you provide your order number?",
            customer2: "It's ORD-12345",
            ai2: "Thank you! Your order is currently in transit and will arrive by Feb 5th. Would you like tracking details sent to your email?",
        },
        metrics: [
            { label: "Calls Without Human", value: "80%" },
            { label: "Handle Time Reduction", value: "75%" },
            { label: "Cost Per Call", value: "₹8 vs ₹45" },
            { label: "Customer Satisfaction", value: "4.5★" },
        ],
        industries: ["E-commerce", "SaaS", "Banking", "Telecom", "Healthcare"],
    },
    {
        id: "outbound-sales",
        icon: PhoneOutgoing,
        title: "Outbound Sales Calling",
        subtitle: "Lead Qualification at Scale",
        description: "Make thousands of sales calls simultaneously. Qualify contacts, book appointments, and close deals 24/7.",
        problem: [
            "Sales reps spend 80% time on unqualified leads",
            "Manual dialing is slow (20-30 calls/day)",
            "Inconsistent sales pitches",
            "Can't reach leads after business hours",
            "Expensive sales team salaries",
        ],
        solution: [
            "Make 1000s of calls simultaneously",
            "Qualify leads before human handoff",
            "Consistent, tested sales scripts",
            "Call prospects 24/7, any timezone",
            "90% cheaper than human reps",
        ],
        conversation: {
            customer: "Hi, this is AI calling from SwiftSocial about improving your call center efficiency. Do you currently use any automation?",
            ai: "Not really, we're all manual",
            customer2: "How many agents do you have?",
            ai2: "About 50. Our clients with 50 agents typically save ₹15L/month. Would you like a 15-minute demo this week?",
        },
        metrics: [
            { label: "Calls Per Day", value: "500 vs 30" },
            { label: "Lead Qualification Rate", value: "35%" },
            { label: "Appointment Booking", value: "18%" },
            { label: "Cost Per Lead", value: "₹150 vs ₹2,000" },
        ],
        industries: ["B2B Sales", "Real Estate", "Insurance", "SaaS SDR", "Agencies"],
    },
]

const secondaryUseCases = [
    {
        icon: Phone,
        title: "Inbound Sales Inquiries",
        description: "Never miss a sales call. AI handles product questions, pricing, and books demos 24/7.",
        metric: "40% increase in lead capture",
    },
    {
        icon: Users,
        title: "Customer Retention",
        description: "Proactive check-in calls, renewal reminders, and feedback collection at scale.",
        metric: "25% reduction in churn",
    },
    {
        icon: Calendar,
        title: "Appointment Scheduling",
        description: "AI books, confirms, and reminds about appointments. Reduce no-shows by 60%.",
        metric: "60% fewer no-shows",
    },
    {
        icon: MessageSquare,
        title: "Surveys & Feedback",
        description: "Conduct phone surveys at scale. Get 10x more responses at 1/5th the cost.",
        metric: "10x response rate",
    },
    {
        icon: ShoppingCart,
        title: "Order Status & Tracking",
        description: "Handle all 'where's my order' calls automatically. Reduce support tickets by 50%.",
        metric: "50% fewer tickets",
    },
    {
        icon: CreditCard,
        title: "Payment Reminders",
        description: "Polite payment reminder calls that improve collection rates without awkwardness.",
        metric: "35% better collection",
    },
]

const industries = [
    { icon: ShoppingCart, name: "E-commerce", description: "Order tracking, returns, and customer support" },
    { icon: Building2, name: "BPOs", description: "Scalable outsourced support and sales" },
    { icon: Home, name: "Real Estate", description: "Property inquiries and showing scheduling" },
    { icon: ShieldCheck, name: "Insurance", description: "Claims support and policy inquiries" },
    { icon: HeartPulse, name: "Healthcare", description: "Appointment booking and patient follow-ups" },
    { icon: DollarSign, name: "Financial Services", description: "Account inquiries and payment reminders" },
]

export default function UseCasesPage() {
    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 hero-bg" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Use Cases
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Built for{" "}
                            <span className="text-gold-gradient">Call Centers</span>
                            <br className="hidden md:block" />
                            & <span className="text-gold-gradient">Sales Teams</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            From inbound support to outbound sales, automate every conversation
                            and scale your operations without limits.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Primary Use Cases */}
            {primaryUseCases.map((useCase, index) => (
                <section
                    key={useCase.id}
                    className={`py-24 md:py-32 ${index % 2 === 1 ? "bg-black-charcoal/50" : ""}`}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="max-w-6xl mx-auto"
                        >
                            {/* Header */}
                            <div className="flex items-start gap-6 mb-12">
                                <div className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center shrink-0">
                                    <useCase.icon className="w-10 h-10 text-black" />
                                </div>
                                <div>
                                    <span className="text-gold-400 font-medium">{useCase.subtitle}</span>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{useCase.title}</h2>
                                    <p className="text-lg text-muted-foreground max-w-2xl">{useCase.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                {/* The Problem */}
                                <GlassCard>
                                    <h3 className="text-xl font-semibold mb-4 text-red-400">The Problem</h3>
                                    <ul className="space-y-3">
                                        {useCase.problem.map((item) => (
                                            <li key={item} className="flex items-start gap-3">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-2" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </GlassCard>

                                {/* The Solution */}
                                <GradientCard>
                                    <h3 className="text-xl font-semibold mb-4 text-green-400">The Solution</h3>
                                    <ul className="space-y-3">
                                        {useCase.solution.map((item) => (
                                            <li key={item} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </GradientCard>
                            </div>

                            {/* Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                {useCase.metrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="p-6 rounded-xl bg-muted/30 text-center"
                                    >
                                        <div className="text-2xl md:text-3xl font-bold text-gold-400 mb-1">
                                            {metric.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{metric.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Industries */}
                            <div className="flex flex-wrap items-center gap-2 mb-8">
                                <span className="text-muted-foreground text-sm">Ideal for:</span>
                                {useCase.industries.map((industry) => (
                                    <span
                                        key={industry}
                                        className="px-3 py-1 rounded-full bg-gold-400/10 text-gold-400 text-sm"
                                    >
                                        {industry}
                                    </span>
                                ))}
                            </div>

                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/signup">
                                    Get Started
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </section>
            ))}

            {/* Secondary Use Cases */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="More Use Cases"
                        title="Automate any"
                        titleHighlight="conversation"
                        description="From sales to support, our AI handles it all."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {secondaryUseCases.map((useCase) => (
                            <motion.div key={useCase.title} variants={fadeInUp}>
                                <GlassCard className="h-full">
                                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center mb-4">
                                        <useCase.icon className="w-6 h-6 text-gold-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                                        <TrendingUp className="w-4 h-4" />
                                        {useCase.metric}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Industries */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Industries"
                        title="Solutions for every"
                        titleHighlight="industry"
                        description="Tailored AI voice agents for your specific business needs."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                    >
                        {industries.map((industry) => (
                            <motion.div key={industry.name} variants={fadeInUp}>
                                <GlassCard className="h-full text-center">
                                    <div className="w-14 h-14 rounded-xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                                        <industry.icon className="w-7 h-7 text-gold-400" />
                                    </div>
                                    <h3 className="font-semibold mb-1">{industry.name}</h3>
                                    <p className="text-xs text-muted-foreground">{industry.description}</p>
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
                            Ready to <span className="text-gold-gradient">Automate</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start your free trial and see how AI voice agents can transform your business.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/signup">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-gold-400/30" asChild>
                                <Link href="/contact">Talk to Sales</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
