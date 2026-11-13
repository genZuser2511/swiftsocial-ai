"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, Sparkles, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fadeInUp, staggerContainer, blurIn } from "@/lib/animations"

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 hero-bg dark:hero-bg" />
            <div className="absolute inset-0 noise-overlay" />

            {/* Gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-400/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-light/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />

            {/* Content */}
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-5xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            Team Unnati × Indus University
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </span>
                    </motion.div>

                    {/* Main heading */}
                    <motion.h1
                        variants={blurIn}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                    >
                        Revolutionizing{" "}
                        <span className="text-gold-gradient text-glow-gold">Social Media</span>
                        <br />
                        with{" "}
                        <span className="text-gold-gradient text-glow-gold">AI Intelligence</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-pretty"
                    >
                        SwiftSocial.AI empowers content creators and businesses with intelligent automation,
                        helping you create, schedule, and optimize your social media presence effortlessly.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
                    >
                        <Link href="/contact">
                            <Button
                                size="lg"
                                className="bg-gold-gradient hover:opacity-90 text-black font-semibold px-8 h-14 text-lg glow-gold group"
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/solution">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-gold-400/30 hover:bg-gold-400/10 hover:border-gold-400/50 px-8 h-14 text-lg group"
                            >
                                <Play className="mr-2 w-5 h-5 text-gold-400" />
                                Watch Demo
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Feature highlights */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
                    >
                        {[
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                description: "Generate content in seconds with AI",
                            },
                            {
                                icon: Shield,
                                title: "Enterprise Secure",
                                description: "Bank-grade security for your data",
                            },
                            {
                                icon: Globe,
                                title: "Multi-Platform",
                                description: "Post to all networks at once",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                variants={fadeInUp}
                                className="glass rounded-xl p-6 text-center group hover:bg-gold-400/5 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-lg bg-gold-400/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-400/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-gold-400" />
                                </div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-6 h-10 rounded-full border-2 border-gold-400/30 flex justify-center p-2"
                    >
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1.5 h-1.5 rounded-full bg-gold-400"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
