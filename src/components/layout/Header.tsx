"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Moon, Sun, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Use Cases", href: "/use-cases" },
    { name: "Pricing", href: "/pricing" },
    { name: "Demo", href: "/demo" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
]

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDark, setIsDark] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark")
        setIsDark(isDarkMode)
    }, [])

    const toggleTheme = () => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle("dark")
    }

    const isActive = (href: string) => pathname === href

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-background/80 backdrop-blur-xl border-b border-gold-400/10 py-3"
                    : "py-5"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/logo.jpg"
                            alt="SwiftSocial.AI Logo"
                            width={180}
                            height={50}
                            className="h-10 w-auto object-contain rounded-lg"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "text-gold-400 bg-gold-400/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="hidden sm:flex"
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5 text-gold-400" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </Button>

                        {/* Login */}
                        <Button
                            variant="ghost"
                            className="hidden sm:flex text-muted-foreground hover:text-foreground"
                            asChild
                        >
                            <Link href="/login">Log In</Link>
                        </Button>

                        {/* CTA */}
                        <Button
                            className="bg-gold-gradient text-black font-semibold hidden sm:flex"
                            asChild
                        >
                            <Link href="/signup">
                                Start Free Trial
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>

                        {/* Mobile Menu */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                >
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80 bg-background border-l border-gold-400/10">
                                <div className="flex flex-col h-full py-6">
                                    {/* Mobile Logo */}
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-black" />
                                        </div>
                                        <span className="text-xl font-bold">
                                            Swift<span className="text-gold-400">Social</span>.AI
                                        </span>
                                    </div>

                                    {/* Mobile Links */}
                                    <nav className="flex flex-col gap-1 flex-1">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                                                    isActive(link.href)
                                                        ? "text-gold-400 bg-gold-400/10"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                )}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>

                                    {/* Mobile Actions */}
                                    <div className="space-y-3 pt-6 border-t border-gold-400/10">
                                        <Button
                                            variant="outline"
                                            className="w-full border-gold-400/30"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/login">Log In</Link>
                                        </Button>
                                        <Button
                                            className="w-full bg-gold-gradient text-black font-semibold"
                                            asChild
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href="/signup">
                                                Start Free Trial
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </nav>
            </div>
        </motion.header>
    )
}
