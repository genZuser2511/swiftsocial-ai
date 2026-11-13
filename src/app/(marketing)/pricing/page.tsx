"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    Bot,
    Check,
    CheckCircle2,
    HelpCircle,
    MessageSquare,
    Phone,
    Sparkles,
    Users,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const plans = [
    {
        name: "Co-Pilot",
        description: "AI-assisted human agents",
        price: "10,000",
        perMinute: "₹10-12",
        popular: false,
        features: [
            "AI-powered agent assist",
            "Real-time suggestions",
            "Call transcription",
            "Basic analytics",
            "Email support",
            "Knowledge base integration",
            "1 AI agent",
        ],
        notIncluded: [
            "Multiple AI agents",
            "Custom voice training",
            "CRM integrations",
            "Priority support",
        ],
        cta: "Start with Co-Pilot",
        margin: "30-40% gross margin",
    },
    {
        name: "Hybrid",
        description: "AI + Human agents working together",
        price: "30,000",
        perMinute: "₹12-15",
        popular: true,
        features: [
            "Everything in Co-Pilot",
            "Up to 5 AI agents",
            "Department-level expansion",
            "Advanced analytics & reporting",
            "Priority support",
            "Custom voice training",
            "CRM integrations (Salesforce, HubSpot)",
            "API access",
            "Webhook notifications",
        ],
        notIncluded: [
            "Unlimited AI agents",
            "White-label options",
            "Dedicated account manager",
        ],
        cta: "Go Hybrid",
        margin: "45-55% gross margin",
    },
    {
        name: "Autonomous",
        description: "Fully autonomous AI operations",
        price: "Custom",
        perMinute: "₹10-12",
        popular: false,
        features: [
            "Everything in Hybrid",
            "Unlimited AI agents",
            "Full autonomous operation",
            "Custom development & integration",
            "Dedicated account manager",
            "White-label options",
            "SLA guarantee",
            "Advanced security & compliance",
            "Multi-language support (50+ languages)",
            "Custom workflows",
        ],
        notIncluded: [],
        cta: "Contact Sales",
        margin: "55-65% gross margin",
    },
]

const faqs = [
    {
        question: "What counts as a minute?",
        answer: "A minute is counted as any 60 seconds of call time, rounded up. If a call lasts 2 minutes and 15 seconds, you'll be billed for 3 minutes.",
    },
    {
        question: "How does the rollover work?",
        answer: "Unused minutes from your monthly allocation roll over to the next month. Rollover minutes expire after 3 months.",
    },
    {
        question: "Can I switch between plans?",
        answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
    {
        question: "Is there a free trial?",
        answer: "Yes, we offer a 14-day free trial with full access to all features. No credit card required to start.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, UPI, net banking, and bank transfers for enterprise customers.",
    },
    {
        question: "What's the difference between Co-Pilot and Autonomous?",
        answer: "Co-Pilot assists your human agents with AI suggestions. Autonomous fully automates calls without human intervention.",
    },
]

export default function PricingPage() {
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")

    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 hero-bg" />
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Simple Pricing
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Pricing That{" "}
                            <span className="text-gold-gradient">Scales With You</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Start free. Pay only for what you use. Scale as you grow.
                            All plans include a 14-day free trial.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                variants={fadeInUp}
                                className={plan.popular ? "lg:-mt-8 lg:mb-8" : ""}
                            >
                                <GradientCard
                                    className={`h-full relative ${plan.popular ? "ring-2 ring-gold-400 shadow-[0_0_40px_rgba(212,175,55,0.3)]" : ""
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="px-4 py-1 rounded-full bg-gold-gradient text-black text-sm font-semibold">
                                                Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                                        <div className="mb-2">
                                            {plan.price === "Custom" ? (
                                                <span className="text-4xl font-bold">Custom</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold">₹{plan.price}</span>
                                                    <span className="text-muted-foreground">/month</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-sm text-gold-400">
                                            + {plan.perMinute}/min usage
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                        {plan.notIncluded.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 opacity-50">
                                                <div className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center">
                                                    <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                </div>
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full ${plan.popular
                                                ? "bg-gold-gradient text-black font-semibold"
                                                : "bg-muted hover:bg-muted/80"
                                            }`}
                                        size="lg"
                                        asChild
                                    >
                                        <Link href={plan.price === "Custom" ? "/contact" : "/signup"}>
                                            {plan.cta}
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </Button>
                                </GradientCard>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Feature Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-12"
                    >
                        <p className="text-muted-foreground">
                            All plans include: <span className="text-foreground">Unlimited minutes rollover</span> •{" "}
                            <span className="text-foreground">99.9% uptime SLA</span> •{" "}
                            <span className="text-foreground">Cancel anytime</span>
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ROI Calculator Teaser */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <GlassCard className="text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Calculate Your <span className="text-gold-gradient">Savings</span>
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                See how much you can save by switching to AI voice agents
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                                <div className="p-6 rounded-xl bg-muted/30">
                                    <div className="text-3xl font-bold text-gold-400 mb-2">70%</div>
                                    <div className="text-sm text-muted-foreground">Average Cost Reduction</div>
                                </div>
                                <div className="p-6 rounded-xl bg-muted/30">
                                    <div className="text-3xl font-bold text-gold-400 mb-2">₹15L+</div>
                                    <div className="text-sm text-muted-foreground">Saved Per Year (50 agents)</div>
                                </div>
                                <div className="p-6 rounded-xl bg-muted/30">
                                    <div className="text-3xl font-bold text-gold-400 mb-2">30 Days</div>
                                    <div className="text-sm text-muted-foreground">Average Payback Period</div>
                                </div>
                            </div>

                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/contact">
                                    Get Custom ROI Analysis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </GlassCard>
                    </motion.div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="FAQ"
                        title="Frequently Asked"
                        titleHighlight="Questions"
                        description="Everything you need to know about pricing and billing."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
                    >
                        {faqs.map((faq) => (
                            <motion.div key={faq.question} variants={fadeInUp}>
                                <GlassCard className="h-full">
                                    <h3 className="font-semibold mb-3 flex items-start gap-2">
                                        <HelpCircle className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                                        {faq.question}
                                    </h3>
                                    <p className="text-muted-foreground text-sm pl-7">{faq.answer}</p>
                                </GlassCard>
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
                            Start Your <span className="text-gold-gradient">Free Trial</span> Today
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            14 days free. No credit card required. Full access to all features.
                        </p>
                        <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                            <Link href="/signup">
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
