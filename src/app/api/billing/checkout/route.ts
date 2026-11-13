import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { planId, isAnnual } = body

        if (!planId) {
            return NextResponse.json({ error: "planId is required" }, { status: 400 })
        }

        const supabase = await createClient()
        
        // Ensure user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch plan details from Supabase
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single()

        if (planError || !plan) {
            return NextResponse.json({ error: "Plan not found" }, { status: 404 })
        }

        const amountMicro = isAnnual ? plan.price_annual_micro : plan.price_monthly_micro
        // Razorpay expects amount in smallest currency unit (paise for INR).
        // Since we store microcurrency (value * 1,000,000), 
        // Amount in standard currency = micro / 1,000,000
        // Amount in paise = standard * 100 = micro / 10,000
        const amountPaise = amountMicro / 10000

        // ====================================================================
        // RAZORPAY INTEGRATION READY:
        // When live credentials are provided, uncomment and install razorpay sdk:
        // 
        // const Razorpay = require('razorpay')
        // const instance = new Razorpay({
        //     key_id: process.env.RAZORPAY_KEY_ID,
        //     key_secret: process.env.RAZORPAY_KEY_SECRET,
        // })
        //
        // const order = await instance.orders.create({
        //     amount: amountPaise,
        //     currency: plan.currency_code,
        //     receipt: `receipt_order_${new Date().getTime()}`,
        // })
        // return NextResponse.json({ orderId: order.id, amount: order.amount })
        // ====================================================================

        // Mock response for now until credentials are provided
        const mockOrderId = `order_mock_${Math.random().toString(36).substring(7)}`
        
        return NextResponse.json({ 
            orderId: mockOrderId, 
            amount: amountPaise, 
            currency: plan.currency_code 
        })

    } catch (error: any) {
        console.error("Checkout API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
