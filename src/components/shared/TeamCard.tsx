"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Linkedin, Github, Twitter, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { cardHover } from "@/lib/animations"

interface TeamCardProps {
    name: string
    role: string
    bio?: string
    image?: string
    linkedin?: string
    github?: string
    twitter?: string
    email?: string
    className?: string
}

export function TeamCard({
    name,
    role,
    bio,
    image,
    linkedin,
    github,
    twitter,
    email,
    className,
}: TeamCardProps) {
    const socials = [
        { icon: Linkedin, href: linkedin },
        { icon: Github, href: github },
        { icon: Twitter, href: twitter },
        { icon: Mail, href: email ? `mailto:${email}` : undefined },
    ].filter((s) => s.href)

    return (
        <motion.div
            variants={cardHover}
            initial="rest"
            whileHover="hover"
            className={cn(
                "group relative bg-card rounded-2xl overflow-hidden border border-gold-400/10 hover:border-gold-400/30 transition-colors",
                className
            )}
        >
            {/* Image container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center">
                        <span className="text-6xl font-bold text-gold-400/50">
                            {name.charAt(0)}
                        </span>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Social links overlay */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-center gap-3"
                >
                    {socials.map((social, index) => (
                        <Link
                            key={index}
                            href={social.href!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-gold-400 flex items-center justify-center transition-all group/icon"
                        >
                            <social.icon className="w-5 h-5 text-white group-hover/icon:text-black transition-colors" />
                        </Link>
                    ))}
                </motion.div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-gold-400 text-sm font-medium mb-2">{role}</p>
                {bio && (
                    <p className="text-muted-foreground text-sm line-clamp-2">{bio}</p>
                )}
            </div>
        </motion.div>
    )
}
