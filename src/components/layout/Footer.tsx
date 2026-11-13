"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, Github, Linkedin, Mail, Phone, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
    product: [
        { name: "Features", href: "/features" },
        { name: "Use Cases", href: "/use-cases" },
        { name: "Pricing", href: "/pricing" },
        { name: "Demo", href: "/demo" },
    ],
    company: [
        { name: "About Us", href: "/about" },
        { name: "Blog", href: "/resources" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/careers" },
    ],
    resources: [
        { name: "Documentation", href: "/docs" },
        { name: "API Reference", href: "/api" },
        { name: "Help Center", href: "/help" },
        { name: "Status", href: "/status" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Security", href: "/security" },
    ],
}

const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/swiftsocial" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/swiftsocial" },
    { name: "GitHub", icon: Github, href: "https://github.com/swiftsocial" },
]

export function Footer() {
    return (
        <footer className="border-t border-gold-400/10 bg-black-charcoal/50">
            {/* Main Footer */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
                    {/* Brand + Newsletter */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <Image
                                src="/logo.jpg"
                                alt="SwiftSocial.AI Logo"
                                width={180}
                                height={50}
                                className="h-10 w-auto object-contain rounded-lg"
                            />
                        </Link>
                        <p className="text-muted-foreground text-sm mb-6">
                            AI Voice Agents for Call Centers & Outbound Sales.
                            Automate customer conversations at scale.
                        </p>

                        {/* Newsletter */}
                        <div>
                            <p className="text-sm font-medium mb-3">Stay updated</p>
                            <form className="flex gap-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-muted/50 border-gold-400/10 h-10"
                                />
                                <Button className="bg-gold-gradient text-black h-10 px-4">
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-gold-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-gold-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-gold-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-muted-foreground hover:text-gold-400 transition-colors text-sm"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gold-400/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-muted-foreground text-sm">
                            © {new Date().getFullYear()} SwiftSocial.AI. All rights reserved.
                        </p>

                        {/* Contact */}
                        <div className="flex items-center gap-6">
                            <a
                                href="mailto:contact@swiftsocial.ai"
                                className="flex items-center gap-2 text-muted-foreground hover:text-gold-400 transition-colors text-sm"
                            >
                                <Mail className="w-4 h-4" />
                                contact@swiftsocial.ai
                            </a>
                        </div>

                        {/* Social */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-gold-400 hover:bg-gold-400/10 transition-colors"
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
