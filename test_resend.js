const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Testing Resend API Key:", process.env.RESEND_API_KEY ? "Loaded" : "Missing");
    try {
        const { data, error } = await resend.emails.send({
            from: 'SwiftSocial AI <notifications@team.swiftsocialai.com>',
            to: ['pranitworkextra@gmail.com'], // using the account owner's email
            subject: 'Domain Verification Successful!',
            html: '<p>If you see this, the Resend integration is working perfectly.</p>'
        });

        if (error) {
            console.error("Test Failed:", error);
        } else {
            console.log("Test Succeeded! Message ID:", data.id);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testEmail();
