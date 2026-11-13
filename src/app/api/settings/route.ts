import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { encrypt, decrypt } from '@/lib/utils/encryption'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data, error } = await supabaseAdmin
        .from('user_settings')
        .select('key_name, encrypted_value')
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const settings: Record<string, string> = {}
    if (data) {
        for (const row of data) {
            try {
                settings[row.key_name] = decrypt(row.encrypted_value)
            } catch (e) {
                console.error(`Failed to decrypt setting ${row.key_name}`)
                settings[row.key_name] = '' // fallback
            }
        }
    }

    return NextResponse.json(settings)
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { key_name, value } = body

    if (!key_name || value === undefined) {
        return NextResponse.json({ error: 'Missing key_name or value' }, { status: 400 })
    }

    const encrypted_value = encrypt(String(value))

    const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: existing } = await supabaseAdmin
        .from('user_settings')
        .select('key_name')
        .eq('user_id', user.id)
        .eq('key_name', key_name)
        .single()

    let error;
    if (existing) {
        const { error: updateError } = await supabaseAdmin
            .from('user_settings')
            .update({ encrypted_value, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('key_name', key_name)
        error = updateError;
    } else {
        const { error: insertError } = await supabaseAdmin
            .from('user_settings')
            .insert({ user_id: user.id, key_name, encrypted_value })
        error = insertError;
    }

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error("Unhandled API Error:", e)
        return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
    }
}
