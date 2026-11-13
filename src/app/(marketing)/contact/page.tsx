"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Send,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"

const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    company: z.string().min(1, "Company name is required"),
    phone: z.string().optional(),
    useCase: z.string().min(1, "Please select a use case"),
    message: z.string().min(10, "Please describe your needs"),
})

type ContactFormData = z.infer<typeof contactSchema>

const useCases = [
    "Call Center Automation",
    "Outbound Sales Calling",
    "Customer Support",
    "Appointment Scheduling",
    "Lead Qualification",
    "Other",
]

const contactInfo = [
    {
        icon: Mail,
        title: "Email Us",
        content: "contact@swiftsocial.ai",
        description: "We'll respond within 24 hours",
    },
    {
        icon: Phone,
        title: "Call Us",
        content: "+91 98765 43210",
        description: "Mon-Fri, 9am-6pm IST",
    },
    {
        icon: Calendar,
        title: "Book a Demo",
        content: "Schedule a call",
        description: "See AI in action",
    },
]

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    })

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("Form submitted:", data)
        setIsSubmitting(false)
        setIsSubmitted(true)
        reset()
    }

    if (isSubmitted) {
        return (
            <section className="relative min-h-screen flex items-center pt-32 pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg mx-auto text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
                        <p className="text-muted-foreground mb-8">
                            Your message has been received. Our team will get back to you within 24 hours.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="bg-gold-gradient text-black font-semibold" asChild>
                                <Link href="/">Back to Home</Link>
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gold-400/30"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Send Another Message
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

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
                            Contact Us
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                            Let's Talk About{" "}
                            <span className="text-gold-gradient">Automating</span> Your Calls
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Ready to transform your call center? Get in touch with our team
                            for a personalized demo and consultation.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form + Info */}
            <section className="py-24 md:py-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="lg:col-span-3"
                            >
                                <GradientCard>
                                    <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    {...register("name")}
                                                    className={errors.name ? "border-red-500" : ""}
                                                />
                                                {errors.name && (
                                                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="john@company.com"
                                                    {...register("email")}
                                                    className={errors.email ? "border-red-500" : ""}
                                                />
                                                {errors.email && (
                                                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="company">Company Name *</Label>
                                                <Input
                                                    id="company"
                                                    placeholder="Your Company"
                                                    {...register("company")}
                                                    className={errors.company ? "border-red-500" : ""}
                                                />
                                                {errors.company && (
                                                    <p className="text-red-500 text-sm">{errors.company.message}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="+91 98765 43210"
                                                    {...register("phone")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="useCase">What are you looking for? *</Label>
                                            <select
                                                id="useCase"
                                                {...register("useCase")}
                                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.useCase ? "border-red-500" : ""
                                                    }`}
                                            >
                                                <option value="">Select a use case</option>
                                                {useCases.map((useCase) => (
                                                    <option key={useCase} value={useCase}>
                                                        {useCase}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.useCase && (
                                                <p className="text-red-500 text-sm">{errors.useCase.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Tell us about your needs *</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Describe your current setup, call volumes, and what you're hoping to achieve..."
                                                rows={5}
                                                {...register("message")}
                                                className={errors.message ? "border-red-500" : ""}
                                            />
                                            {errors.message && (
                                                <p className="text-red-500 text-sm">{errors.message.message}</p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full bg-gold-gradient text-black font-semibold"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    Send Message
                                                    <Send className="ml-2 w-5 h-5" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </GradientCard>
                            </motion.div>

                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="lg:col-span-2 space-y-6"
                            >
                                {contactInfo.map((item) => (
                                    <GlassCard key={item.title}>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center shrink-0">
                                                <item.icon className="w-6 h-6 text-gold-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">{item.title}</h3>
                                                <p className="text-gold-400">{item.content}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}

                                <GradientCard className="text-center">
                                    <MessageSquare className="w-10 h-10 text-gold-400 mx-auto mb-4" />
                                    <h3 className="font-semibold mb-2">Live Chat</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Chat with our team in real-time
                                    </p>
                                    <Button variant="outline" className="w-full border-gold-400/30">
                                        Start Chat
                                    </Button>
                                </GradientCard>
                            </motion.div>
                        </div>
                    </div>
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
                            Prefer to <span className="text-gold-gradient">Jump Right In</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Start your 14-day free trial now. No credit card required.
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
