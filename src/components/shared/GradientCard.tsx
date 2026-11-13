import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"
import { cardHover } from "@/lib/animations"

interface GradientCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    hover?: boolean
}

export function GradientCard({ children, className, hover = true, ...props }: GradientCardProps) {
    return (
        <motion.div
            variants={hover ? cardHover : undefined}
            initial="rest"
            whileHover="hover"
            className={cn(
                "gradient-border p-6 md:p-8 bg-card rounded-xl",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    hover?: boolean
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
    return (
        <motion.div
            variants={hover ? cardHover : undefined}
            initial="rest"
            whileHover="hover"
            className={cn(
                "glass rounded-xl p-6 md:p-8",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}
