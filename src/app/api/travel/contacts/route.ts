import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/utils/encryption'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('travel_contacts')
        .select('*, contacts(full_name, phone_e164, email)')
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const maskedData = data.map(contact => {
        let maskedPassport = 'Not Provided'
        if (contact.passport_number_encrypted) {
            try {
                const decrypted = decrypt(contact.passport_number_encrypted)
                maskedPassport = `****${decrypted.slice(-4)}`
            } catch (e) {
                maskedPassport = '****'
            }
        }
        return {
            ...contact,
            passport_number_masked: maskedPassport,
            passport_number_encrypted: undefined 
        }
    })

    return NextResponse.json(maskedData)
}

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { passport_number, ...rest } = body

    let passport_number_encrypted = null
    if (passport_number) {
        passport_number_encrypted = encrypt(String(passport_number))
    }

    const { data, error } = await supabase
        .from('travel_contacts')
        .insert({
            user_id: user.id,
            ...rest,
            passport_number_encrypted
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
