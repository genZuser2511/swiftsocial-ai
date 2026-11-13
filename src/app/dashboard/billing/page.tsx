"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Download,
    FileText,
    Info,
    RefreshCw,
    Sparkles,
    Zap,
    Shield,
    Users,
    X,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/shared/GradientCard"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// ─── Sub-components ──────────────────────────────────────────────────────────
function UsageBar({ percent, color }: { percent: number; color: string }) {
    return (
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                className={cn("h-full rounded-full", color)}
            />
        </div>
    )
}

function RazorpayCheckoutModal({ open, onClose, plan, isAnnual, orgId }: { open: boolean; onClose: () => void; plan: any, isAnnual: boolean, orgId: string }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    if (!open || !plan) return null

    const handlePay = async () => {
        setLoading(true)
        setError("")
        try {
            // Hit our prepared API route to create an order
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id, isAnnual, orgId })
            })
            
            const data = await response.json()
            
            if (!response.ok) throw new Error(data.error || "Failed to initialize checkout")
            
            // =========================================================
            // RAZORPAY INTEGRATION READY:
            // When live credentials are provided and Razorpay SDK is loaded
            // on window, this code will execute the actual checkout modal:
            //
            // const options = {
            //     key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
            //     amount: data.amount, 
            //     currency: data.currency,
            //     name: "SwiftSocial.AI",
            //     description: `Upgrade to ${plan.name} Plan`,
            //     order_id: data.orderId,
            //     handler: function (response: any) {
            //         setStep(2) // payment successful
            //     },
            //     theme: { color: "#2563eb" }
            // }
            // const rzp = new (window as any).Razorpay(options)
            // rzp.open()
            // =========================================================
            
            // Simulating payment success for now
            setTimeout(() => setStep(2), 1500)
            
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const priceMicro = isAnnual ? plan.price_annual_micro : plan.price_monthly_micro
    const priceDisplay = priceMicro / 1000000

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#1a1c2e] border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Razorpay-like Header */}
                <div className="bg-[#2d325a] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg">R</div>
                        <div>
                            <p className="text-white text-xs font-semibold leading-none">Razorpay</p>
                            <p className="text-blue-300 text-[10px]">SwiftSocial.AI Checkout</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-blue-200 text-sm">{plan?.name} Plan</p>
                                    <p className="text-xs text-blue-300/60 mt-1">Billed {isAnnual ? 'annually' : 'monthly'}</p>
                                </div>
                                <p className="text-white text-2xl font-bold">₹{priceDisplay.toLocaleString()}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
                                    <div className="w-10 h-6 bg-blue-600/20 rounded flex items-center justify-center text-[8px] text-blue-400 font-bold border border-blue-500/20">CARD</div>
                                    <div className="flex-1">
                                        <p className="text-white text-xs font-medium">Card Payment</p>
                                        <p className="text-blue-300/60 text-[10px]">Visa, Mastercard, RuPay & more</p>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                            <Button 
                                onClick={handlePay} 
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-900/20"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    `Pay ₹${priceDisplay.toLocaleString()}`
                                )}
                            </Button>

                            <p className="text-center text-[10px] text-blue-300/40 uppercase tracking-widest font-bold">Secure SSL Encryption</p>
                        </div>
                    ) : (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-white text-xl font-bold">Payment Successful</h3>
                            <p className="text-blue-300/60 text-sm px-4">
                                Your subscription to the {plan?.name} plan is now active. 
                                We've sent a receipt to your email.
                            </p>
                            <Button 
                                onClick={onClose}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-8"
                            >
                                Done
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BillingPage() {
    const [isAnnual, setIsAnnual] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<any>(null)
    const [plans, setPlans] = useState<any[]>([])
    const [invoices, setInvoices] = useState<any[]>([])
    const [currentSubscription, setCurrentSubscription] = useState<any>(null)
    const [usage, setUsage] = useState<any>(null)
    const [orgId, setOrgId] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchBillingData() {
            try {
                // Get session to know user
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                // Fetch Org (Assume single org for now)
                const { data: orgData } = await supabase.from('organizations').select('id').single()
                if (orgData) setOrgId(orgData.id)
                
                // Fetch Subscription Plans
                const { data: plansData } = await supabase
                    .from('subscription_plans')
                    .select('*')
                    .order('price_monthly_micro', { ascending: true })
                
                if (plansData) setPlans(plansData)

                // Fetch Current Subscription
                if (orgData) {
                    const { data: subData } = await supabase
                        .from('subscriptions')
                        .select('*, subscription_plans(*)')
                        .eq('org_id', orgData.id)
                        .single()
                    setCurrentSubscription(subData)

                    // Fetch Invoices
                    const { data: invData } = await supabase
                        .from('invoices')
                        .select('*')
                        .eq('org_id', orgData.id)
                        .order('created_at', { ascending: false })
                    if (invData) setInvoices(invData)

                    // Fetch Usage
                    const { data: usageData } = await supabase
                        .from('usage_records')
                        .select('*')
                        .eq('org_id', orgData.id)
                        .order('period_start', { ascending: false })
                        .limit(1)
                        .single()
                    if (usageData) setUsage(usageData)
                }
            } catch (err) {
                console.error("Error fetching billing data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchBillingData()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading billing details...</div>
    }

    // Default fallbacks if no subscription found
    const activePlan = currentSubscription?.subscription_plans || plans.find(p => p.name === 'Free')
    
    // Calculate Usage Stats
    const minutesUsed = usage?.minutes_used || 0
    const minutesLimit = activePlan?.minutes_included || 100
    const usagePercent = minutesLimit > 0 ? Math.min(100, Math.round((minutesUsed / minutesLimit) * 100)) : 0

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Billing & Subscription</h1>
                    <p className="text-muted-foreground">Manage your plan, usage, and payments.</p>
                </div>
                <div className="flex items-center gap-3 bg-card border border-gold-400/10 rounded-xl px-4 py-2.5">
                    <span className={cn("text-sm font-medium", !isAnnual && "text-gold-400")}>Monthly</span>
                    <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <span className={cn("text-sm font-medium", isAnnual && "text-gold-400")}>Annual</span>
                    {isAnnual && (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs ml-1">Save 20%</Badge>
                    )}
                </div>
            </div>

            {/* Overage Alert */}
            {usagePercent >= 80 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold text-amber-400 text-sm">Approaching Usage Limit</p>
                        <p className="text-xs text-muted-foreground mt-0.5">You've used {usagePercent}% of your monthly minutes. Upgrade to avoid interruptions.</p>
                    </div>
                </motion.div>
            )}

            {/* Current Plan + Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan Summary */}
                <GradientCard className="lg:col-span-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Current Plan</p>
                            <h2 className="text-2xl font-bold text-gold-400 mt-1">{activePlan?.name || "None"}</h2>
                        </div>
                        <Badge className="bg-gold-400/10 text-gold-400 border-gold-400/20">Active</Badge>
                    </div>

                    <div className="space-y-3 mt-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium text-gold-400">₹{(activePlan?.price_monthly_micro / 1000000 || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Billing Cycle</span>
                            <span className="font-medium capitalize">{currentSubscription?.billing_cycle || 'Monthly'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Included Minutes</span>
                            <span className="font-medium">{(activePlan?.minutes_included || 0).toLocaleString()} min</span>
                        </div>
                    </div>
                </GradientCard>

                {/* Usage Dashboard */}
                <GradientCard className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-6">Usage This Period</h2>
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Minutes Used</p>
                                <p className="text-3xl font-bold mt-0.5">
                                    {minutesUsed.toLocaleString()}
                                    <span className="text-sm text-muted-foreground font-normal ml-2">/ {minutesLimit.toLocaleString()} min</span>
                                </p>
                            </div>
                            <span className={cn("text-lg font-bold", usagePercent >= 80 ? "text-amber-400" : "text-gold-400")}>{usagePercent}%</span>
                        </div>
                        <UsageBar percent={usagePercent} color={usagePercent >= 80 ? "bg-amber-400" : "bg-gold-400"} />
                    </div>
                </GradientCard>
            </div>

            {/* Plan Cards */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Choose a Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {plans.map((plan, i) => {
                        const isCurrent = activePlan?.id === plan.id
                        const priceMicro = isAnnual ? plan.price_annual_micro : plan.price_monthly_micro
                        const priceDisplay = priceMicro / 1000000
                        const isEnterprise = plan.tier === 'enterprise'

                        // Dynamic colors based on tier
                        const colorMap: Record<string, any> = {
                            free: { icon: Users, color: "text-muted-foreground", bg: "bg-muted/5", border: "border-gold-400/5" },
                            starter: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
                            growth: { icon: Sparkles, color: "text-gold-400", bg: "bg-gold-400/5", border: "border-gold-400/10" },
                            enterprise: { icon: Shield, color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/10" }
                        }
                        const styling = colorMap[plan.tier] || colorMap.free
                        const PlanIcon = styling.icon

                        // Safely parse features JSONB
                        let featuresList: string[] = []
                        if (plan.features) {
                            try {
                                featuresList = Object.keys(plan.features).map(k => `${k}: ${plan.features[k]}`)
                            } catch (e) { }
                        }

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className={cn(
                                    "relative rounded-2xl border p-5 flex flex-col",
                                    isCurrent ? "border-gold-400/50 bg-gold-400/5" : `${styling.border} ${styling.bg}`
                                )}
                            >
                                {isCurrent && (
                                    <div className="absolute -top-3 right-4">
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Current</Badge>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    <PlanIcon className={cn("w-5 h-5", styling.color)} />
                                    <h3 className="font-bold">{plan.name}</h3>
                                </div>

                                <div className="mb-4">
                                    {isEnterprise ? (
                                        <p className="text-2xl font-bold">Custom</p>
                                    ) : (
                                        <div className="flex flex-col">
                                            <p className="text-2xl font-bold">
                                                ₹{priceDisplay.toLocaleString()}
                                                <span className="text-xs text-muted-foreground font-normal">/{isAnnual ? 'yr' : 'mo'}</span>
                                            </p>
                                            {isAnnual && (
                                                <p className="text-[10px] text-green-500/80 font-medium mt-0.5">Billed annually</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-1.5 flex-1 mb-5">
                                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", styling.color)} />
                                        {plan.minutes_included.toLocaleString()} Minutes Included
                                    </li>
                                    {featuresList.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground capitalize">
                                            <CheckCircle2 className={cn("w-3.5 h-3.5 shrink-0", styling.color)} />
                                            {f.replace('_', ' ')}
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    disabled={isCurrent}
                                    onClick={() => !isCurrent && !isEnterprise && setSelectedPlan(plan)}
                                    className={cn(
                                        "w-full",
                                        isCurrent
                                            ? "bg-muted text-muted-foreground cursor-default"
                                            : isEnterprise
                                            ? "border border-orange-400/30 bg-transparent text-orange-400 hover:bg-orange-400/10"
                                            : "bg-gold-gradient text-black font-semibold hover:opacity-90"
                                    )}
                                >
                                    {isCurrent ? "Current Plan" : isEnterprise ? "Contact Sales" : "Upgrade"}
                                </Button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Payment Method + Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <GradientCard className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-5">Payment Method</h2>
                    <p className="text-sm text-muted-foreground mb-4">You will be prompted to enter payment details when upgrading your plan.</p>
                    <Button variant="outline" className="w-full border-gold-400/20 hover:bg-gold-400/10 text-gold-400">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Payment Methods
                    </Button>
                </GradientCard>

                <GradientCard className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold">Invoice History</h2>
                    </div>
                    <div className="space-y-2">
                        {invoices.length > 0 ? invoices.map((inv) => (
                            <div key={inv.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors group border border-border/50">
                                <div className="w-9 h-9 rounded-lg bg-gold-400/10 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-gold-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium uppercase">{inv.id.split('-')[0]}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(inv.invoice_date).toLocaleDateString()} · {inv.plan_name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold">₹{(inv.amount_micro / 1000000).toLocaleString()}</p>
                                    <Badge className={cn("text-[10px] mt-0.5", 
                                        inv.status === 'paid' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                                        "bg-amber-500/10 text-amber-400 border-amber-500/20")}>
                                        {inv.status}
                                    </Badge>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No invoices found.</p>
                            </div>
                        )}
                    </div>
                </GradientCard>
            </div>

            {/* Razorpay Checkout Modal (Routing Ready) */}
            <RazorpayCheckoutModal
                open={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                plan={selectedPlan}
                isAnnual={isAnnual}
                orgId={orgId}
            />
        </div>
    )
}
