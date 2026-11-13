import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
    try {
        const bodyText = await request.text()
        const signature = request.headers.get("x-razorpay-signature")
        
        // ====================================================================
        // RAZORPAY WEBHOOK READY:
        // When live credentials are provided, verify the signature:
        // 
        // const crypto = require('crypto')
        // const expectedSignature = crypto
        //     .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        //     .update(bodyText)
        //     .digest('hex')
        //
        // if (expectedSignature !== signature) {
        //     return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        // }
        // ====================================================================

        const event = JSON.parse(bodyText)
        const supabase = await createClient()

        // 1. Idempotency Check
        const eventId = event.id || `mock_event_${Date.now()}`
        const { data: existingLog } = await supabase
            .from('razorpay_webhook_logs')
            .select('id')
            .eq('razorpay_event_id', eventId)
            .single()

        if (existingLog) {
            return NextResponse.json({ received: true, status: "already_processed" })
        }

        // 2. Log the webhook event
        await supabase
            .from('razorpay_webhook_logs')
            .insert({
                razorpay_event_id: eventId,
                event_type: event.event || 'payment.captured',
                raw_payload: event
            })

        // 3. Process Event Types (e.g. subscription.activated, payment.captured)
        // TODO: Map Razorpay payload to subscriptions and invoices tables here
        
        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error("Webhook Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
