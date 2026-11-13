import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for cross-user operations
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build')

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { call_id, user_id, event } = body

        if (!call_id || !user_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Fetch Call Data
        const { data: call, error: callError } = await supabase
            .from('calls')
            .select('*, ai_agents(*)')
            .eq('id', call_id)
            .single()

        if (callError || !call) throw new Error("Call not found")

        // 2. Fetch Active Workflows and User Settings
        const { data: workflows, error: wfError } = await supabase
            .from('workflows')
            .select('*')
            .eq('created_by', user_id)
            .eq('is_active', true)
            .eq('trigger_event', event || 'call_completed')

        const { data: settings } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', user_id)
            .single()

        if (wfError) throw wfError

        const results = []
        const transcript = (call.transcript || "").toLowerCase()

        // 3. Process Workflows
        for (const wf of workflows || []) {
            const condition = wf.condition as any
            let matches = true

            // Sentiment check
            if (condition.sentiment && call.sentiment !== condition.sentiment) {
                matches = false
            }

            // Keyword check
            if (condition.keywords && condition.keywords.length > 0) {
                const foundKeyword = condition.keywords.some((k: string) => transcript.includes(k.toLowerCase()))
                if (!foundKeyword) matches = false
            }

            if (matches) {
                // 4. Execute Action
                const actionConfig = wf.action_config as any
                
                if (wf.action_type === 'send_sms') {
                    // Mock SMS sending by adding to messages table
                    await supabase.from('messages').insert({
                        created_by: user_id,
                        content: actionConfig.message || `Hi, thanks for your call about ${call.summary || 'our services'}.`,
                        type: 'sms',
                        direction: 'outbound',
                        status: 'sent',
                        phone_e164: call.phone_e164
                    })
                    results.push({ workflow: wf.name, action: 'sms_sent' })
                }

                if (wf.action_type === 'slack_notification' && settings?.slack_webhook_url) {
                    try {
                        await fetch(settings.slack_webhook_url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                text: `🚀 *New Lead Qualified via AI Call*\n*Lead:* ${call.phone_e164}\n*Summary:* ${call.summary}\n*Sentiment:* ${call.sentiment}`
                            })
                        })
                        results.push({ workflow: wf.name, action: 'slack_sent' })
                    } catch (e) {
                        console.error("Slack notify error:", e)
                    }
                }

                if (wf.action_type === 'update_status') {
                    // Update lead status
                    await supabase
                        .from('contacts')
                        .update({ status: actionConfig.status || 'Qualified' })
                        .eq('phone_e164', call.phone_e164)
                        .eq('created_by', user_id)
                    
                    results.push({ workflow: wf.name, action: 'status_updated' })
                }

                if (wf.action_type === 'send_email') {
                    try {
                        // Assuming call object includes contact email if joined properly, or passing an email in actionConfig.
                        // For this demo, we'll try to extract the email from the joined contacts table if it was there,
                        // otherwise we'll just log it. (In a full implementation, the contact email should be fetched).
                        // If actionConfig.to is not set, we'll use a placeholder or fallback.
                        const toEmail = actionConfig.to || 'test@example.com' 
                        const subject = actionConfig.subject || `Follow up on your call about ${call.summary || 'our services'}`
                        
                        const { data, error } = await resend.emails.send({
                            from: 'SwiftSocial AI <notifications@team.swiftsocialai.com>',
                            to: [toEmail],
                            subject: subject,
                            html: actionConfig.body || `
                                <h1>Thanks for taking the time to speak with us!</h1>
                                <p>We wanted to follow up regarding our recent call.</p>
                                <p><strong>Call Summary:</strong> ${call.summary}</p>
                            `
                        })

                        if (error) {
                            console.error("Resend error:", error)
                        } else {
                            results.push({ workflow: wf.name, action: 'email_sent', resendId: data?.id })
                            // Also log message to db
                            await supabase.from('messages').insert({
                                created_by: user_id,
                                content: subject,
                                type: 'email',
                                direction: 'outbound',
                                status: 'sent',
                                contact_id: call.contact_id
                            })
                        }
                    } catch (e) {
                        console.error("Email send error:", e)
                    }
                }
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results })

    } catch (err: any) {
        console.error("Workflow Execution Error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
