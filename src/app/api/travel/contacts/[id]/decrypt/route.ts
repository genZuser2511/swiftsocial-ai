import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/utils/encryption'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    
    if (profile?.role !== 'admin' && profile?.role !== 'manager') {
        return NextResponse.json({ error: 'Forbidden. Admin or Manager role required.' }, { status: 403 })
    }

    const { data, error } = await supabase
        .from('travel_contacts')
        .select('passport_number_encrypted')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let decrypted = null
    if (data.passport_number_encrypted) {
        try {
            decrypted = decrypt(data.passport_number_encrypted)
            
            // LOG TO COMPLIANCE AUDIT
            await supabase.from('compliance_audit_logs').insert({
                user_id: user.id,
                event_type: 'passport_decrypted',
                status: 'success',
                details: {
                    contact_id: id,
                    reason: 'Admin viewed passport details in Travel CRM'
                }
            })
            
        } catch (e) {
            return NextResponse.json({ error: 'Decryption failed' }, { status: 500 })
        }
    }

    return NextResponse.json({ passport_number: decrypted })
}
