import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { to, subject, html, text } = body;

        if (!to || !subject) {
            return NextResponse.json({ error: "Missing required fields: to, subject" }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: 'SwiftSocial AI <notifications@team.swiftsocialai.com>',
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html || '',
            text: text || '',
        });

        if (error) {
            console.error("Resend send error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        console.error("Email API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
