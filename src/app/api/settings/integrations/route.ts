import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { encrypt, decrypt } from "@/lib/utils/encryption"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: settings } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!settings) return NextResponse.json({})

        // Return connection status only, not the actual keys
        return NextResponse.json({
            vapi: !!settings.encrypted_vapi_key,
            twilio: !!settings.encrypted_twilio_key,
            resend: !!settings.encrypted_resend_key,
            slack: !!settings.slack_webhook_url
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { type, value } = body

        const updates: any = {}
        
        if (type === 'vapi') updates.encrypted_vapi_key = encrypt(value)
        if (type === 'twilio') updates.encrypted_twilio_key = encrypt(value)
        if (type === 'resend') updates.encrypted_resend_key = encrypt(value)
        if (type === 'slack') updates.slack_webhook_url = value // Webhooks usually less sensitive, but can encrypt if needed

        const { error } = await supabase
            .from('user_settings')
            .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
