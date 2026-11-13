"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { fadeInUp } from "@/lib/animations"

interface SectionHeadingProps {
    badge?: string
    title: string
    titleHighlight?: string
    description?: string
    align?: "left" | "center" | "right"
    className?: string
}

export function SectionHeading({
    badge,
    title,
    titleHighlight,
    description,
    align = "center",
    className,
}: SectionHeadingProps) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn(
                "max-w-3xl mb-12 md:mb-16",
                align === "center" && "mx-auto text-center",
                align === "right" && "ml-auto text-right",
                className
            )}
        >
            {badge && (
                <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-4"
                >
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    {badge}
                </motion.span>
            )}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                {title}{" "}
                {titleHighlight && (
                    <span className="text-gold-gradient">{titleHighlight}</span>
                )}
            </h2>
            {description && (
                <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                    {description}
                </p>
            )}
        </motion.div>
    )
}
