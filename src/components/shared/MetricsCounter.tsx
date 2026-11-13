"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricsCounterProps {
    value: number
    suffix?: string
    prefix?: string
    label: string
    icon?: LucideIcon
    duration?: number
    className?: string
}

export function MetricsCounter({
    value,
    suffix = "",
    prefix = "",
    label,
    icon: Icon,
    duration = 2,
    className,
}: MetricsCounterProps) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    useEffect(() => {
        if (!isInView) return

        let startTime: number
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(easeOutQuart * value))

            if (progress < 1) {
                requestAnimationFrame(step)
            } else {
                setCount(value)
            }
        }

        requestAnimationFrame(step)
    }, [isInView, value, duration])

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn("text-center", className)}
        >
            {Icon && (
                <div className="w-14 h-14 rounded-xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-gold-400" />
                </div>
            )}
            <div className="text-4xl md:text-5xl font-bold text-gold-gradient mb-2">
                {prefix}
                {count.toLocaleString()}
                {suffix}
            </div>
            <div className="text-muted-foreground text-sm md:text-base">{label}</div>
        </motion.div>
    )
}
