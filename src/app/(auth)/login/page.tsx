"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GradientCard } from "@/components/shared/GradientCard"
import { createClient } from "@/lib/supabase/client"

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard"

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                setError(error.message)
                return
            }

            router.push(redirectedFrom)
            router.refresh()
        } catch {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        setError(null)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${redirectedFrom}`,
                },
            })

            if (error) {
                setError(error.message)
                setIsGoogleLoading(false)
            }
        } catch {
            setError("Something went wrong. Please try again.")
            setIsGoogleLoading(false)
        }
    }

    return (
        <GradientCard>
            {/* Logo */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2">
                    <Image
                        src="/logo.jpg"
                        alt="SwiftSocial.AI Logo"
                        width={200}
                        height={60}
                        className="h-12 w-auto object-contain rounded-lg"
                        priority
                    />
                </Link>
                <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
                <p className="text-muted-foreground mt-1">
                    Sign in to your SwiftSocial.AI account
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
                    {error}
                </div>
            )}

            {/* Login Form */}
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

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-gold-400 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm">{errors.password.message}</p>
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
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gold-400/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            {/* Google Login */}
            <Button
                type="button"
                variant="outline"
                className="w-full border-gold-400/20"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                )}
                Continue with Google
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-gold-400 hover:underline">
                    Sign up free
                </Link>
            </p>
        </GradientCard>
    )
}

function LoginFormFallback() {
    return (
        <GradientCard>
            <div className="text-center mb-8">
                <div className="w-auto h-12 mx-auto flex items-center justify-center">
                    <Image
                        src="/logo.jpg"
                        alt="Logo"
                        width={200}
                        height={60}
                        className="h-12 w-auto object-contain rounded-lg"
                    />
                </div>
                <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
                <p className="text-muted-foreground mt-1">Loading...</p>
            </div>
            <div className="space-y-6">
                <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
                <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
                <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
            </div>
        </GradientCard>
    )
}

export default function LoginPage() {
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
                <Suspense fallback={<LoginFormFallback />}>
                    <LoginForm />
                </Suspense>
            </motion.div>
        </div>
    )
}
