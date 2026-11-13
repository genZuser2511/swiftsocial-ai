"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Globe,
    Heart,
    Lightbulb,
    Lock,
    Shield,
    Sparkles,
    Target,
    Users,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const values = [
    {
        icon: Target,
        title: "Customer First",
        description: "Everything we build starts with understanding our customers' needs and challenges.",
    },
    {
        icon: Lightbulb,
        title: "Innovation",
        description: "We push the boundaries of what's possible with AI voice technology every day.",
    },
    {
        icon: Shield,
        title: "Trust & Security",
        description: "Your data security is our top priority. Enterprise-grade protection, always.",
    },
    {
        icon: Heart,
        title: "Human Touch",
        description: "AI should enhance human connection, not replace the warmth of real service.",
    },
]

const stats = [
    { value: "500+", label: "Businesses Trust Us" },
    { value: "2.5M+", label: "Calls Automated" },
    { value: "70%", label: "Avg. Cost Savings" },
    { value: "99.9%", label: "Uptime SLA" },
]

const whyChooseUs = [
    "Industry-leading natural language AI",
    "Seamless integration with existing systems",
    "24/7 dedicated support",
    "Transparent pricing, no hidden fees",
    "Quick setup (go live in under an hour)",
    "Continuous improvements and updates",
]

export default function AboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 hero-bg" />
                <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            About Us
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Making AI Voice Technology{" "}
                            <span className="text-gold-gradient">Accessible</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            We're on a mission to help businesses of all sizes leverage
                            the power of AI to transform their customer communications.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <GradientCard>
                                <div className="w-14 h-14 rounded-xl bg-gold-gradient flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7 text-black" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                                <p className="text-muted-foreground">
                                    To democratize AI voice technology, making it accessible and affordable
                                    for businesses of all sizes. We believe every company deserves access
                                    to enterprise-grade call automation.
                                </p>
                            </GradientCard>

                            <GradientCard>
                                <div className="w-14 h-14 rounded-xl bg-gold-400/10 flex items-center justify-center mb-6">
                                    <Globe className="w-7 h-7 text-gold-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                                <p className="text-muted-foreground">
                                    A world where AI and humans work together seamlessly to deliver
                                    exceptional customer experiences. Where no customer waits on hold
                                    and every interaction is personalized.
                                </p>
                            </GradientCard>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-gold-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        badge="Our Values"
                        title="What drives"
                        titleHighlight="everything we do"
                        description="The principles that guide our team and our technology."
                    />

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {values.map((value) => (
                            <motion.div key={value.title} variants={fadeInUp}>
                                <GlassCard className="h-full text-center">
                                    <div className="w-14 h-14 rounded-xl bg-gold-400/10 flex items-center justify-center mx-auto mb-6">
                                        <value.icon className="w-7 h-7 text-gold-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground text-sm">{value.description}</p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-24 md:py-32 bg-black-charcoal/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <GradientCard>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold mb-6">
                                            Why Choose <span className="text-gold-gradient">SwiftSocial.AI</span>?
                                        </h2>
                                        <ul className="space-y-4">
                                            {whyChooseUs.map((reason) => (
                                                <li key={reason} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                                    <span>{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-24 h-24 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6">
                                                <Award className="w-12 h-12 text-black" />
                                            </div>
                                            <div className="text-2xl font-bold mb-2">#1 Rated</div>
                                            <p className="text-muted-foreground text-sm">
                                                AI Voice Platform for Call Centers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </GradientCard>
                        </motion.div>
                    </div>
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
                            Ready to Join <span className="text-gold-gradient">500+ Businesses</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start your free trial today and experience the future of call automation.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/signup">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="border-gold-400/30" asChild>
                                <Link href="/contact">Contact Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}
