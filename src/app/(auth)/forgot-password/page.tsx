"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/shared/GradientCard"
import { createClient } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setError(error.message)
                return
            }

            setSuccess(true)
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center py-20 px-4">
                <div className="absolute inset-0 hero-bg" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-md text-center"
                >
                    <GradientCard>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                        <p className="text-muted-foreground mb-6">
                            If an account exists with that email, we&apos;ve sent you a password reset link.
                        </p>
                        <Button variant="outline" className="border-gold-400/30" asChild>
                            <Link href="/login">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Back to Login
                            </Link>
                        </Button>
                    </GradientCard>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-20 px-4">
            <div className="absolute inset-0 hero-bg" />
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gold-400/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md"
            >
                <GradientCard>
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gold-gradient flex items-center justify-center">
                                <Phone className="w-6 h-6 text-black" />
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold mt-4">Forgot password?</h1>
                        <p className="text-muted-foreground mt-1">
                            No worries, we&apos;ll send you reset instructions.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@company.com"
                                    className="pl-10"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gold-gradient text-black font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-muted-foreground hover:text-gold-400 inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </div>
                </GradientCard>
            </motion.div>
        </div>
    )
}
