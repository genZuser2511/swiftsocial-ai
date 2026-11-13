import { Workflow } from "@/store/useAgentStore";

export type WorkflowTemplate = Omit<Workflow, 'id' | 'isActive'> & {
    description: string;
    vertical?: "general" | "insurance" | "travel";
};

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
    // GENERAL TEMPLATES
    post_call_sms: {
        name: "Post-Call Auto-SMS",
        description: "Automatically send a follow-up text message after a call concludes.",
        triggerEvent: "call_completed",
        condition: { status: "success" },
        actionType: "send_sms",
        actionConfig: {
            template: "Hi {{contact.name}}, thanks for speaking with us today! Let us know if you have any further questions."
        },
        vertical: "general"
    },
    webhook_trigger: {
        name: "Sync to External CRM",
        description: "Send call data to an external webhook when a call is successfully completed.",
        triggerEvent: "call_completed",
        condition: { status: "success" },
        actionType: "webhook",
        actionConfig: {
            url: "https://your-crm.com/api/webhook"
        },
        vertical: "general"
    },
    missed_call_email: {
        name: "Missed Call Email Alert",
        description: "Send an email to the team if an inbound call is missed.",
        triggerEvent: "call_missed",
        condition: {},
        actionType: "send_email",
        actionConfig: {
            subject: "Missed Call from {{contact.phone}}",
            body: "A call was missed at {{call.time}}. Please follow up."
        },
        vertical: "general"
    },

    // INSURANCE TEMPLATES
    renewal_reminder_sms: {
        name: "Renewal Reminder SMS",
        description: "Trigger an SMS reminder when a policy is 30 days away from expiration.",
        triggerEvent: "policy_expiring",
        condition: { days_until_expiry: 30 },
        actionType: "send_sms",
        actionConfig: {
            template: "Hi {{contact.name}}, your policy {{policy.number}} expires in 30 days. Reply YES to auto-renew."
        },
        vertical: "insurance"
    },
    new_claim_auto_response: {
        name: "New Claim Auto-Response",
        description: "Send an immediate confirmation email when a new claim is filed via the AI Agent.",
        triggerEvent: "claim_filed",
        condition: {},
        actionType: "send_email",
        actionConfig: {
            subject: "We've received your claim ({{claim.id}})",
            body: "Hi {{contact.name}}, your claim has been successfully recorded. A claims adjuster will reach out within 24 hours."
        },
        vertical: "insurance"
    },
    lead_qualification_followup: {
        name: "Lead Qualification Follow-up",
        description: "Tag the contact as 'Hot Lead' and alert the sales team if the AI qualifies an insurance contact.",
        triggerEvent: "call_completed",
        condition: { goal_achieved: true, agent_name: "Insurance Lead Qualification" },
        actionType: "update_tag",
        actionConfig: {
            tags: ["Hot Lead", "Sales Ready"]
        },
        vertical: "insurance"
    },
    lapsed_policy_email: {
        name: "Lapsed Policy Re-engagement Email",
        description: "Send a structured re-engagement email if an outbound call about a lapsed policy fails.",
        triggerEvent: "call_failed",
        condition: { agent_name: "Lapsed Policy Re-engagement" },
        actionType: "send_email",
        actionConfig: {
            subject: "Important: Your coverage has lapsed",
            body: "We tried reaching you today regarding your lapsed policy. Please contact us to reinstate your coverage."
        },
        vertical: "insurance"
    },
    cross_sell_trigger: {
        name: "Cross-sell Interest Trigger",
        description: "Send a webhook to the quoting engine to generate a cross-sell quote if the caller showed interest.",
        triggerEvent: "call_completed",
        condition: { sentiment: "positive", agent_name: "Cross-sell / Upsell Agent" },
        actionType: "webhook",
        actionConfig: {
            url: "https://internal-quoting-engine.local/generate"
        },
        vertical: "insurance"
    },

    // TRAVEL TEMPLATES
    new_inquiry_nurture: {
        name: "New Inquiry Nurture Sequence",
        description: "Tag the contact as 'Hot Travel Lead' after an inbound inquiry is completed.",
        triggerEvent: "call_completed",
        condition: { agent_name: "Inbound Inquiry Agent" },
        actionType: "update_tag",
        actionConfig: {
            tags: ["Hot Travel Lead"]
        },
        vertical: "travel"
    },
    quote_followup_sms: {
        name: "Quote Follow-up Sequence",
        description: "Send an SMS follow-up after an itinerary/quote is sent.",
        triggerEvent: "quote_sent",
        condition: {},
        actionType: "send_sms",
        actionConfig: {
            template: "Hi {{contact.name}}, did you receive your itinerary?"
        },
        vertical: "travel"
    },
    pre_departure_email: {
        name: "Pre-Departure Sequence",
        description: "Send an email 72 hours before the trip.",
        triggerEvent: "trip_approaching",
        condition: { hours_until_trip: 72 },
        actionType: "send_email",
        actionConfig: {
            subject: "Your trip to {{booking.destination}} is almost here!",
            body: "Pack your bags! Here is what you need to know before departure."
        },
        vertical: "travel"
    },
    post_trip_reengagement: {
        name: "Post-Trip Re-engagement",
        description: "Send an SMS 7 days after the trip is completed.",
        triggerEvent: "trip_completed",
        condition: { days_since_trip: 7 },
        actionType: "send_sms",
        actionConfig: {
            template: "Welcome back {{contact.name}}! How was your trip? Leave us a review!"
        },
        vertical: "travel"
    },
    passport_expiry_alert: {
        name: "Passport Expiry Alert",
        description: "Send an email alert if a client's passport expires within 6 months.",
        triggerEvent: "passport_expiring",
        condition: { months_until_expiry: 6 },
        actionType: "send_email",
        actionConfig: {
            subject: "Important: Your passport is expiring soon",
            body: "Hi {{contact.name}}, we noticed your passport expires in 6 months. Please renew it before your next trip."
        },
        vertical: "travel"
    }
};
