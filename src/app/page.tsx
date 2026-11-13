"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Headphones,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  Play,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { MetricsCounter } from "@/components/shared/MetricsCounter"
import { AnimatedBackground } from "@/components/shared/AnimatedBackground"
import { fadeInUp, staggerContainer, slideInLeft, slideInRight } from "@/lib/animations"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

const benefits = [
  {
    icon: DollarSign,
    title: "70% Cost Reduction",
    description: "Replace expensive call center agents with AI that works 24/7 at a fraction of the cost.",
  },
  {
    icon: PhoneOutgoing,
    title: "Outbound Sales at Scale",
    description: "Make 1000s of sales calls simultaneously. Qualify contacts, book appointments, close deals.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Zero wait times. Your customers get help immediately, any time of day or night.",
  },
  {
    icon: TrendingUp,
    title: "Unlimited Capacity",
    description: "Handle 10 or 10,000 calls at once. Scale instantly during peak hours.",
  },
]

const useCases = [
  {
    icon: Headphones,
    title: "Call Center Automation",
    description: "24/7 customer support with AI agents that never sleep. Handle FAQs, order tracking, and tier-1 support.",
    stats: "80% calls handled without human",
    highlight: true,
  },
  {
    icon: PhoneCall,
    title: "Outbound Sales Calling",
    description: "Qualify contacts, set appointments, and follow up at scale. Your AI makes 500+ calls per day.",
    stats: "3x more leads qualified",
    highlight: true,
  },
  {
    icon: MessageSquare,
    title: "Inbound Sales Inquiries",
    description: "Never miss a sales call. AI handles product questions, pricing, and books demos 24/7.",
    stats: "40% increase in lead capture",
  },
  {
    icon: Users,
    title: "Customer Retention",
    description: "Proactive check-in calls, renewal reminders, and feedback collection at scale.",
    stats: "25% reduction in churn",
  },
]

const howItWorks = [
  {
    step: "01",
    title: "Configure Your AI Agent",
    description: "Set your agent's personality, sales script, or support knowledge base. Choose voice and language.",
  },
  {
    step: "02",
    title: "Connect Your Phone System",
    description: "Get new numbers or integrate with your existing phone infrastructure. We handle the technical setup.",
  },
  {
    step: "03",
    title: "Go Live",
    description: "Start automating calls. Monitor performance in real-time. Scale up or down instantly.",
  },
]

const testimonials = [
  {
    quote: "We reduced our support team from 50 agents to 15 while handling 2x more calls. The ROI was immediate.",
    author: "Priya Sharma",
    role: "Head of Operations",
    company: "TechSupport India",
    metric: "70% cost reduction",
  },
  {
    quote: "Our sales team now focuses on closing deals while AI handles all the cold calling and qualification.",
    author: "Rajesh Kumar",
    role: "Sales Director",
    company: "LeadGen Pro",
    metric: "400% more leads",
  },
  {
    quote: "24/7 availability transformed our customer satisfaction scores. We're now at 4.8 stars.",
    author: "Anita Desai",
    role: "Customer Success Manager",
    company: "E-commerce Plus",
    metric: "4.8★ rating",
  },
]

const metrics = [
  { value: 500, suffix: "+", label: "Call Centers Trust Us", icon: Building2 },
  { value: 2.5, suffix: "M+", label: "Calls Automated Monthly", icon: Phone },
  { value: 70, suffix: "%", label: "Average Cost Savings", icon: DollarSign },
  { value: 24, suffix: "/7", label: "Availability", icon: Clock },
]

const logos = [
  "TechSupport India",
  "CallCenter Pro",
  "SalesForce India",
  "E-Commerce Plus",
  "InsureTech",
  "HealthCall",
]

export default function HomePage() {
  return (
    <>
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-24 overflow-hidden">
        <AnimatedBackground particleCount={40} />
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gold-600/15 rounded-full blur-[100px]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 flex justify-center"
              >
                <Image
                  src="/logo.jpg"
                  alt="SwiftSocial.AI"
                  width={500}
                  height={160}
                  className="h-40 w-auto object-contain rounded-2xl"
                  priority
                />
              </motion.div>

              {/* Live Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400"></span>
                </span>
                2.5M+ calls automated this month
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                AI Voice Agents for{" "}
                <span className="text-gold-gradient">Call Centers</span>
                <br className="hidden md:block" />
                & <span className="text-gold-gradient">Outbound Sales</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                Automate customer support calls and outbound sales conversations.
                Scale your call center without hiring more agents.{" "}
                <span className="text-gold-400">Works 24/7, costs 70% less.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gold-gradient text-black font-semibold px-8 h-14 text-lg glow-gold"
                  asChild
                >
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold-400/30 hover:bg-gold-400/10 px-8 h-14 text-lg"
                  asChild
                >
                  <Link href="/demo">
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground text-sm"
              >
                <p className="mb-4">Trusted by 500+ call centers and sales teams</p>
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {logos.map((logo, i) => (
                    <span key={i} className="text-muted-foreground/50 font-medium">
                      {logo}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-gold-400/30 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 bg-gold-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Key Benefits */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Why SwiftSocial.AI"
            title="Cut costs, scale instantly,"
            titleHighlight="work 24/7"
            description="Replace expensive call center agents with AI that never sleeps."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div key={benefit.title} variants={fadeInUp}>
                <GlassCard className="h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 md:py-32 bg-black-charcoal/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Use Cases"
            title="Built for call centers"
            titleHighlight="& sales teams"
            description="From inbound support to outbound sales, automate every conversation."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {useCases.map((useCase, index) => (
              <motion.div key={useCase.title} variants={fadeInUp}>
                <GradientCard className={`h-full ${useCase.highlight ? 'ring-2 ring-gold-400/30' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${useCase.highlight ? 'bg-gold-gradient' : 'bg-gold-400/10'} flex items-center justify-center shrink-0`}>
                      <useCase.icon className={`w-7 h-7 ${useCase.highlight ? 'text-black' : 'text-gold-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{useCase.title}</h3>
                        {useCase.highlight && (
                          <span className="px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-400 text-xs font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">{useCase.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        {useCase.stats}
                      </div>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" className="border-gold-400/30 hover:bg-gold-400/10" asChild>
              <Link href="/use-cases">
                See All Use Cases
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="How It Works"
            title="Get started in"
            titleHighlight="3 simple steps"
            description="From setup to live calls in under an hour."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {howItWorks.map((step, index) => (
              <motion.div key={step.step} variants={fadeInUp} className="relative">
                <GlassCard className="h-full">
                  <span className="text-6xl font-bold text-gold-400/20 absolute top-4 right-6">
                    {step.step}
                  </span>
                  <h3 className="text-xl font-semibold mb-3 relative">{step.title}</h3>
                  <p className="text-muted-foreground relative">{step.description}</p>
                </GlassCard>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-gold-400/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-24 md:py-32 bg-black-charcoal/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {metrics.map((metric, index) => (
              <MetricsCounter
                key={metric.label}
                value={metric.value}
                suffix={metric.suffix}
                label={metric.label}
                icon={metric.icon}
                duration={2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Testimonials"
            title="Trusted by leading"
            titleHighlight="call centers"
            description="See how businesses are transforming their operations with AI."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.author} variants={fadeInUp}>
                <GradientCard className="h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                      {testimonial.metric}
                    </span>
                  </div>
                  <blockquote className="text-lg mb-6">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-400/20 flex items-center justify-center">
                      <span className="text-gold-400 font-semibold">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 md:py-32 bg-black-charcoal/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6">
              <DollarSign className="w-4 h-4" />
              Simple Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Plans starting at{" "}
              <span className="text-gold-gradient">₹10,000/month</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Free 14-day trial. No credit card required. Pay only for what you use.
            </p>
            <Button
              size="lg"
              className="bg-gold-gradient text-black font-semibold px-8 h-14 text-lg"
              asChild
            >
              <Link href="/pricing">
                See Pricing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 to-transparent" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your{" "}
              <span className="text-gold-gradient">Business</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 500+ businesses that are saving 70% on call center costs
              while providing better customer experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gold-gradient text-black font-semibold px-8 h-14 text-lg glow-gold"
                asChild
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gold-400/30 hover:bg-gold-400/10 px-8 h-14 text-lg"
                asChild
              >
                <Link href="/contact">Book a Demo</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  )
}
