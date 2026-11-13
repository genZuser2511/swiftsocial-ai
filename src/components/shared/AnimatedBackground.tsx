"use client"

import { useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
    color: string
}

interface AnimatedBackgroundProps {
    className?: string
    particleCount?: number
    interactive?: boolean
}

export function AnimatedBackground({
    className,
    particleCount = 50,
    interactive = true,
}: AnimatedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const animationRef = useRef<number | undefined>(undefined)

    const goldColors = [
        "rgba(212, 175, 55, 0.6)",
        "rgba(244, 208, 63, 0.5)",
        "rgba(184, 134, 11, 0.4)",
        "rgba(201, 169, 97, 0.5)",
        "rgba(255, 191, 0, 0.4)",
    ]

    const initParticles = useCallback((width: number, height: number) => {
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2,
            color: goldColors[Math.floor(Math.random() * goldColors.length)],
        }))
    }, [particleCount])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles(canvas.width, canvas.height)
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        if (interactive) {
            window.addEventListener("mousemove", handleMouseMove)
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particlesRef.current.forEach((particle) => {
                // Update position
                particle.x += particle.speedX
                particle.y += particle.speedY

                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width
                if (particle.x > canvas.width) particle.x = 0
                if (particle.y < 0) particle.y = canvas.height
                if (particle.y > canvas.height) particle.y = 0

                // Interactive effect - particles move away from mouse
                if (interactive) {
                    const dx = mouseRef.current.x - particle.x
                    const dy = mouseRef.current.y - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 150) {
                        const force = (150 - distance) / 150
                        particle.x -= (dx / distance) * force * 2
                        particle.y -= (dy / distance) * force * 2
                    }
                }

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = particle.color
                ctx.fill()

                // Draw glow effect
                const gradient = ctx.createRadialGradient(
                    particle.x,
                    particle.y,
                    0,
                    particle.x,
                    particle.y,
                    particle.size * 3
                )
                gradient.addColorStop(0, particle.color)
                gradient.addColorStop(1, "transparent")
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()
            })

            // Draw connections between nearby particles
            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const dx = particlesRef.current[i].x - particlesRef.current[j].x
                    const dy = particlesRef.current[i].y - particlesRef.current[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 120) {
                        ctx.beginPath()
                        ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y)
                        ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y)
                        ctx.strokeStyle = `rgba(212, 175, 55, ${0.15 * (1 - distance / 120)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            if (interactive) {
                window.removeEventListener("mousemove", handleMouseMove)
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [initParticles, interactive])

    return (
        <canvas
            ref={canvasRef}
            className={cn("fixed inset-0 pointer-events-none", className)}
            style={{ zIndex: 0 }}
        />
    )
}
