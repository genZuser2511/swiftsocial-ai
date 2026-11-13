import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Call = {
    id: string;
    caller: string;
    duration: string;
    status: 'success' | 'failed';
    sentiment: 'positive' | 'neutral' | 'negative';
    date: string;
    time: string;
    recording: string;
    summary: string;
    transcript: { role: 'agent' | 'user'; text: string }[];
};

export type Agent = {
    id: string;
    name: string;
    description: string;
    voice: string;
    language: string;
    personality: string;
    greeting: string;
    status: 'active' | 'paused';
    calls: number;
    avgDuration: string;
    successRate: number;
    createdAt: string;
    callHistory: Call[];
};

export type AgentState = {
    agents: Agent[];
    addAgent: (agent: Omit<Agent, 'id' | 'calls' | 'avgDuration' | 'successRate' | 'status' | 'createdAt' | 'callHistory'>) => void;
    updateAgent: (id: string, agent: Partial<Omit<Agent, 'id' | 'calls' | 'avgDuration' | 'successRate' | 'status' | 'createdAt' | 'callHistory'>>) => void;
    deleteAgent: (id: string) => void;
    toggleAgentStatus: (id: string) => void;
    repairAgents: () => void;
};

const SAMPLE_CALLS: Call[] = [
    {
        id: "call-1",
        caller: "+91 91234 56789",
        duration: "4:52",
        status: "success",
        sentiment: "positive",
        date: "Today",
        time: "14:30",
        recording: "/recordings/insurance_inbound5.wav",
        summary: "Pure term life insurance inquiry (₹50L). Customer: Akash from Ahmedabad. Lead captured: akash123@gmail.com. Callback scheduled for tomorrow morning.",
        transcript: [
            { role: "agent", text: "Thank you for calling Alpha Insurance. My name is Aria. How can I help you today — are you calling about an existing account, or would you like to explore our insurance plans?" },
            { role: "user", text: "I would like to see what you offer in insurance plans." },
            { role: "agent", text: "Wonderful! Before we get started, may I know your name please?" },
            { role: "user", text: "Sure. My name is Akash." },
            { role: "agent", text: "Thank you, Akash! Great to speak with you. We offer a range of plans. Are you looking for Health Insurance, Life Insurance, Motor/Auto Insurance, or Home Insurance — or would you like me to help you figure out which one fits best?" },
            { role: "user", text: "I am looking for life insurance." },
            { role: "agent", text: "Thank you for letting me know, Akash. Life insurance is a great way to secure your family’s future. To help you find the best plan, may I ask a few quick questions? 1. How old are you currently, and are you a smoker or non-smoker?" },
            { role: "user", text: "I am currently twenty five years old, and I'm a nonsmoker." },
            { role: "agent", text: "Thank you for sharing that, Akash. That’s helpful. Next, are you looking for a pure term plan for financial protection, or an investment-linked plan that also builds savings alongside coverage? If you’d like, I can briefly explain the difference." },
            { role: "user", text: "I would like the pure term plan." },
            { role: "agent", text: "Perfect, Akash. A pure term plan is focused on providing strong financial protection for your loved ones. One last question to help narrow down the options: What coverage amount are you considering — something in the range of ₹25 lakhs, ₹50 lakhs, or ₹1 crore and above?" },
            { role: "user", text: "Looking around the range of fifty lakhs." },
            { role: "agent", text: "Thank you, Akash. So, you’re interested in a pure term life insurance plan with a coverage amount of around ₹50 lakhs. Just a couple more things to help me get you the best match — do you have any dependents, like children or elderly parents, relying on you? And roughly, what city are you based in?" },
            { role: "user", text: "Yes. I've got two parents, and we're based in Ahmedabad." },
            { role: "agent", text: "Thank you for sharing that, Akash. To help us find the most suitable plan, I'd like to understand a little more about your dependents. 1. How many dependents do you have in total? (Just to confirm, is it only your parents, or anyone else as well?) 2. Could you tell me a bit about them — for example, their ages and their relationship to you? 3. Do either of your parents have any pre-existing or terminal illnesses we should be aware of? Once I have these details, I’ll be able to recommend the best options for you." },
            { role: "user", text: "Alright. I just have, uh, two parents. My mother, the other, my father. Both of them are around the age of say, fifty five, I think. Yeah. No, none of them have any terminal illnesses." },
            { role: "agent", text: "Thank you for clarifying, Akash. So, you have two dependents—your mother and father, both around 55 years old, and neither has any terminal illnesses. That’s very helpful. Just one last optional question: for our advisor to prepare the most suitable options, could you share your approximate monthly income bracket — below ₹50,000, ₹50,000–₹1.5 lakh, or above ₹1.5 lakh? This is completely optional and only helps us tailor the recommendations." },
            { role: "user", text: "Alright. Not a problem. My month is above one point five lakhs." },
            { role: "agent", text: "Thank you for sharing that, Akash. That will help our advisor prepare the most relevant options for you. Based on what you’ve shared, I have a couple of term life insurance plans that would be a great fit. I’d love to send you a detailed brochure—could you please let me know which email address I should send that to? And if you could spell it out for me, I’ll make sure it’s correct." },
            { role: "user", text: "Sure. Uh, you can send it to Akash one two three at g mail dot com." },
            { role: "agent", text: "Thank you, Akash. Just to confirm, is that A-K-A-S-H, the numbers 1-2-3, at gmail.com? Did I get that right?" },
            { role: "user", text: "Yeah." },
            { role: "agent", text: "Perfect, thank you for confirming, Akash! And so our advisor can walk you through the details and answer any questions, when would be a good time for a follow-up call? Would tomorrow morning or afternoon work better for you?" },
            { role: "user", text: "Tomorrow morning would be great." },
            { role: "agent", text: "Wonderful, Akash. So just to confirm — I'll be sending the term life insurance plan details to akash123@gmail.com, and one of our advisors will call you tomorrow morning to discuss your options and answer any questions. Is there anything else I can help you with today?" },
            { role: "user", text: "No. That's all I think. Yeah." },
            { role: "agent", text: "Thank you so much for calling Alpha Insurance, Akash. You're in great hands — have a wonderful day!" }
        ]
    },
    {
        id: "call-2",
        caller: "+91 88776 55443",
        duration: "2:14",
        status: "success",
        sentiment: "positive",
        date: "Today",
        time: "11:15",
        recording: "/recordings/insurance_inbound4.wav",
        summary: "Premium payment issue for existing account. Customer: Rahul. Identity verified via mobile: 95863 56748. Specialist callback scheduled within next few hours.",
        transcript: [
            { role: "agent", text: "Thank you for calling Alpha Insurance. My name is Aria. How can I help you today — are you calling about an existing account, or would you like to explore our insurance plans?" },
            { role: "user", text: "I am calling about an existing account." },
            { role: "user", text: "I had some problems and want to speak with someone specialist." },
            { role: "agent", text: "Of course, I'd be happy to help with that. May I know your name please?" },
            { role: "user", text: "Sure. My name is Rahul." },
            { role: "agent", text: "Thank you, Rahul. I understand you’d like to speak with a specialist regarding some problems with your account. To verify your identity, could you please provide the mobile number or email address registered with your policy?" },
            { role: "user", text: "Sure. My mobile number is nine five eight six three five six seven four eight." },
            { role: "agent", text: "Thank you for sharing your mobile number, Rahul. Just to confirm, that's 95863 56748, correct? Could you please let me know the specific issue you're facing with your account? For example, is it related to your policy details, premium payment, claim status," },
            { role: "user", text: "It's" },
            { role: "agent", text: "renewal, or" },
            { role: "user", text: "really it's related to the premium payments." },
            { role: "agent", text: "Thank you for clarifying, Rahul. So, your concern is regarding premium payments on your policy. I've noted your concern. One of our account specialists will get in touch with you to assist further. Is your mobile number 95863 56748 the best way to reach you, or would you prefer a different contact method? Also, would you like the specialist to call you within the next few hours, or is there a specific time that works best for you?" },
            { role: "user", text: "No. The specialist can call me within the next few hours and on the same number is fine." },
            { role: "agent", text: "Perfect, Rahul. I’ve noted that you’d like a call within the next few hours on your mobile number 95863 56748 regarding your premium payment issue. One of our account specialists will reach out to you shortly. Is there anything else I can assist with today?" },
            { role: "user", text: "No. Thank you." },
            { role: "agent", text: "Thank you so much for calling Alpha Insurance, Rahul. Our specialist will be in touch with you soon. Have a wonderful day" }
        ]
    },
    {
        id: "call-3",
        caller: "Rahul (Gujarat)",
        duration: "4:38",
        status: "success",
        sentiment: "positive",
        date: "Yesterday",
        time: "16:45",
        recording: "/recordings/insurance_inbound6.wav",
        summary: "Pure term life insurance inquiry (₹50L). Customer: Rahul from Gujarat (26yo, non-smoker). Lead captured: rahul123@gmail.com. Callback scheduled for tomorrow afternoon.",
        transcript: [
            { role: "agent", text: "Thank you for calling Alpha Insurance. My name is Aria. How can I help you today — are you calling about an existing account, or would you like to explore our insurance plans?" },
            { role: "user", text: "I would like to explore some of the plans." },
            { role: "agent", text: "Wonderful! Before we get started, may I know your name please?" },
            { role: "user", text: "Sure. My name is Rahul." },
            { role: "agent", text: "Thank you, Rahul! Great to meet you. We offer a range of plans. Are you looking for Health Insurance, Life Insurance, Motor/Auto Insurance, or Home Insurance — or would you like me to help you figure out which one fits best?" },
            { role: "user", text: "Currently, I'm looking for life insurance." },
            { role: "agent", text: "Great choice, Rahul! Life insurance is a wonderful way to secure your family's future. To help you find the best plan, I’ll ask you a few quick questions. First, how old are you currently, and are you a smoker or non-smoker?" },
            { role: "user", text: "I am currently twenty six years old, and I'm a nonsmoker." },
            { role: "agent", text: "Thank you for sharing that, Rahul. That’s helpful. Next, are you looking for a pure term plan for financial protection, or an investment-linked plan that also builds savings alongside coverage? If you’re unsure, I can briefly explain the difference." },
            { role: "user", text: "I am currently looking for a pure term plan." },
            { role: "agent", text: "Perfect, Rahul. A pure term plan is all about providing financial protection for your loved ones. Last question on this part: What coverage amount are you thinking of — something in the range of ₹25 lakhs, ₹50 lakhs, or ₹1 crore and above?" },
            { role: "user", text: "Let's say fifty lakhs." },
            { role: "agent", text: "Thank you, Rahul. So, you’re looking for a pure term life insurance plan with ₹50 lakhs coverage. Just a couple more things to help me get you the best match — do you have any dependents, like children or elderly parents, relying on you? And roughly, what city are you based in?" },
            { role: "user", text: "Okay. I just have two dependents, my mother and father. And all of us are based in Gujarat." },
            { role: "agent", text: "Thank you for sharing that, Rahul. That helps us tailor the options for you. To make sure we recommend the most suitable plan, could you tell me a bit more about your parents? For example, their ages and if either of them has any pre-existing or terminal illnesses we should be aware of?" },
            { role: "user", text: "Sure. My parents are around the age of fifty five. And they don't have any terminal illnesses." },
            { role: "agent", text: "Thank you, Rahul. So, both your parents are around 55 years old and do not have any terminal illnesses. That’s noted. One last optional question — just so our advisor can prepare the most relevant options for you: could you share your approximate monthly income bracket? Is it below ₹50,000, between ₹50,000 and ₹1,50,000, or above ₹1,50,000? This is completely optional." },
            { role: "user", text: "It is above one lakh fifty thousand." },
            { role: "agent", text: "Thank you for sharing that, Rahul. That’s very helpful. Based on what you’ve shared, I have a couple of term life insurance plans that would be a great fit for you. I’d love to send you a detailed brochure—could you please let me know which email address I should send it to? And if you’d like, I can confirm the spelling with you as well." },
            { role: "user", text: "Sure. You could send it to rahul one two three at g mail dot com." },
            { role: "agent", text: "Thank you, Rahul. Just to confirm, your email is rahul123@gmail.com — is that correct? Please let me know if there are any changes or if the spelling is accurate. Also, so our advisor can walk you through the details and answer any questions, when would be a good time for a follow-up call? Would tomorrow morning or afternoon work better for you?" },
            { role: "user", text: "Tomorrow afternoon would be better." },
            { role: "agent", text: "Perfect, Rahul. I’ll arrange for our advisor to call you tomorrow afternoon and send the term life insurance plan details to rahul123@gmail.com. Just to confirm: - You’re interested in a pure term life insurance plan with ₹50 lakhs coverage. - You’re 26 years old, a non-smoker, with two dependents (your parents, both around 55 years old, no terminal illnesses). - You’re based in Gujarat, and your monthly income is above ₹1,50,000. - We’ll send the brochure to rahul123@gmail.com and our advisor will call you tomorrow afternoon. Is there anything else I can help you with today?" },
            { role: "user", text: "Uh, no. Thanks." },
            { role: "user", text: "You. That is all." },
            { role: "agent", text: "Thank you so much for calling Alpha Insurance, Rahul. You're in great hands — have a wonderful day!" }
        ]
    }
];

const OUTBOUND_SAMPLE_CALLS: Call[] = [
    {
        id: "out-1",
        caller: "Pranit",
        duration: "3:12",
        status: "success",
        sentiment: "positive",
        date: "Today",
        time: "15:20",
        recording: "/recordings/insurance_outbound2.wav",
        summary: "Life insurance renewal follow-up. Customer: Pranit. Benefits explained: uninterrupted coverage, no fresh medicals. Renewal confirmed. Documents sent to pranit123@gmail.com.",
        transcript: [
            { role: "agent", text: "Hi, am I speaking with pranit?" },
            { role: "user", text: "Yes. Who's this?" },
            { role: "agent", text: "Hi pranit, this is Aria from Alpha Insurance, your renewal advisor. I’m calling about your life insurance policy that’s due for renewal. I’ll keep this brief. Is now a good time to chat?" },
            { role: "user", text: "Yeah. Sure." },
            { role: "agent", text: "Great, thank you, pranit. Your life insurance policy is due for renewal on 20-3-2026. I wanted to make sure you’re all set before it lapses. Before we proceed, one quick moment please: to keep you protected, renewing on time helps you maintain uninterrupted coverage. Based on your current coverage, would you like to go ahead and renew your life insurance policy for another term?" },
            { role: "user", text: "And what benefits do I get?" },
            { role: "agent", text: "I can highlight the key renewal benefit for life/term policies: renewing on time keeps your family's coverage uninterrupted — no fresh medical underwriting needed if you renew now. Would you like to proceed with renewing for another term?" },
            { role: "user", text: "And what about my no claim bonus?" },
            { role: "agent", text: "Good question, pranit. For life/term policies like yours, the key renewal benefit is that renewing on time keeps your family's coverage uninterrupted and avoids any fresh medical underwriting. In terms of No Claim Bonus (NCB), NCB is typically tied to health policies rather than pure life/term coverage, so there isn’t an NCB to carry forward in the same way. If you’d like, I can have a specialist confirm the exact impact on your specific policy. Would you like to proceed with renewing for another term?" },
            { role: "user", text: "I see. Thank you. And, yes, I would like to renew this." },
            { role: "agent", text: "Wonderful, pranit. I’ll move things forward. I’ll have our specialist send the renewal payment link and the updated policy documents to pranit123@gmail.com right away. You should receive them within the next 15 to 30 minutes. Would you like me to confirm the email address on file is still pranit123@gmail.com? If yes, I’ll proceed and you’ll get everything shortly." },
            { role: "user", text: "Yeah. Sure. Send it to me." },
            { role: "user", text: "I'll take a look." },
            { role: "agent", text: "Perfect, pranit. I’ve noted that and will proceed. I’ll confirm the email address pranit123@gmail.com is still on file and send the renewal payment link and updated policy documents there. You should receive them within 15 to 30 minutes. Just to confirm: is pranit123@gmail.com the best email for you, or would you like me to use a different one?" },
            { role: "user", text: "No. This is the best email I have." },
            { role: "agent", text: "Thank you, pranit. I’ve noted that email as the one we’ll use. You’ll receive the renewal payment link and updated policy documents at pranit123@gmail.com within 15 to 30 minutes. Is there anything else you’d like me to help with right now?" },
            { role: "user", text: "No. No. Thank you." },
            { role: "agent", text: "You’re very welcome, pranit. If you need anything else, just call us. Have a great day!" }
        ]
    },
    {
        id: "out-2",
        caller: "Aditya",
        duration: "4:05",
        status: "success",
        sentiment: "neutral",
        date: "Today",
        time: "10:45",
        recording: "/recordings/insurance_outbound3.wav",
        summary: "Health insurance renewal reminder. Customer: Aditya expressed dissatisfaction with response times. Specialist callback scheduled for tomorrow morning. Summary sent to aditya123@gmail.com.",
        transcript: [
            { role: "agent", text: "Hi, am I speaking with aditya?" },
            { role: "user", text: "Yes. Who am I talking to?" },
            { role: "agent", text: "Hi Aditya, this is Aria from Alpha Insurance. I’m your health insurance renewal advisor. How are you today?" },
            { role: "user", text: "I am well. How are you?" },
            { role: "agent", text: "I’m glad to hear that, Aditya. I’m doing well, thank you. I’m calling to remind you that your health insurance policy is up for renewal on 20-3-2026. Would you like to proceed with renewing your policy for another term?" },
            { role: "user", text: "I would not like to continue because I have not had satisfactory interactions. With you guys." },
            { role: "agent", text: "I’m sorry to hear that, Aditya. I’d like to understand what happened and see how we can help. Could you share what was unsatisfactory? I’m here to listen and assist." },
            { role: "user", text: "You guys took too long to respond. When I contacted you." },
            { role: "agent", text: "I’m sorry about the delay, Aditya. I understand how frustrating that is. I’d like to make this right—would you be open to a quick call-back from a specialist to address your concerns and discuss renewal options?" },
            { role: "user", text: "Yeah. I would, uh, talk to your specialist about this, please." },
            { role: "agent", text: "Thank you, Aditya. I’ll arrange a specialist to call you back. Could you confirm the best time window for the callback? Morning or afternoon, and your preferred contact number 9586356748?" },
            { role: "user", text: "Yeah. Tell him to call me in the morning." },
            { role: "agent", text: "Sure, Aditya. I’ve noted that a specialist should call you in the morning. I’ll ensure the callback is scheduled accordingly and that they reach you at 9586356748. Before I end, would you like me to also send a quick summary of your current plan and renewal benefits to your email aditya123@gmail.com? If yes, please confirm." },
            { role: "user", text: "Just just tell me the renewal benefits." },
            { role: "agent", text: "Sure, Aditya. For health insurance, renewing on time keeps your No Claim Bonus intact, which can be up to 50% off your premium you've earned. I’ll arrange for the specialist to call in the morning and can send you a summary as well if you’d like." },
            { role: "user", text: "Okay. Send me a summary and review it over and tell that specialist to call me in the morning. Would love to chat with them." },
            { role: "agent", text: "Absolutely, Aditya. I’ll send a summary of your current plan and renewal benefits to aditya123@gmail.com right away. I’ve also noted you’d like the specialist to call you in the morning. They’ll reach out at the morning window you indicated to discuss renewal options. Is there anything else you’d like me to include in the summary?" },
            { role: "user", text: "No. Thank you. That's enough." },
            { role: "agent", text: "Thank you, Aditya. I’ve noted everything: a morning callback with a specialist, and I’ve sent the renewal summary to aditya123@gmail.com. If you need anything else, you can reply here or we’ll be in touch in the morning. Have a great day!" }
        ]
    },
    {
        id: "out-3",
        caller: "Raul",
        duration: "2:58",
        status: "success",
        sentiment: "positive",
        date: "Yesterday",
        time: "17:30",
        recording: "/recordings/insurance_outbound4.wav",
        summary: "Auto insurance renewal. Customer: Raul. Benefit highlighted: No Claim Bonus (NCB) protection. Renewal confirmed. Specialist callback scheduled for today evening before 9 PM. Documents sent to rahul256@gmail.com.",
        transcript: [
            { role: "agent", text: "Hi, am I speaking with rahul?" },
            { role: "user", text: "This is Raul. Who am I talking to?" },
            { role: "agent", text: "Hi Raul, this is Aria, the renewal advisor from Alpha Insurance. I’m calling to discuss your auto insurance renewal. Is it okay if I continue?" },
            { role: "user", text: "Yeah. Continue." },
            { role: "agent", text: "Great, thank you, Raul. Your auto policy is expiring on 20-3-2026, and I wanted to make sure you’re all set before it lapses. One quick renewal benefit: Your No Claim Bonus on this policy has been building up. Renewing before the due date protects that discount — a gap of even one day resets it to zero. Based on your current coverage, would you like to go ahead and renew your auto policy for another term?" },
            { role: "user", text: "Okay. Before renew before renewing it, just tell me benefits again of my auto insurance." },
            { role: "agent", text: "Sure, Raul. For motor insurance, the key renewal benefit is: renewing before the due date protects your No Claim Bonus, so you don’t lose that built-up discount if there’s a gap—even one day. Would you like to proceed with renewing your auto policy for another term?" },
            { role: "user", text: "Yeah. Sure. I would like to renew it. But I would also like to talk to a specialist. About this." },
            { role: "agent", text: "Wonderful, Raul. I’ll have our specialist connect with you to discuss options and a revised quote. I’ll also send the renewal link and updated documents to rahul256@gmail.com right away. Would you prefer I schedule a callback with the specialist for today or tomorrow, and what time works best for you?" },
            { role: "user", text: "Today evening is fine." },
            { role: "agent", text: "Perfect, Raul. I’ve noted that the specialist should call you before 9:00 PM today. I’ll pass that along now." },
            { role: "user", text: "Okay. And yeah. That's all I think." },
            { role: "agent", text: "Thank you, Raul. I’ve noted the callback with the specialist before 9:00 PM today. We’ll send the renewal link and documents to rahul256@gmail.com shortly. If you need anything else in the meantime, just let me know. Have a great day!" }
        ]
    }
];

export const useAgentStore = create<AgentState>()(
    persist(
        (set) => ({
            agents: [],
            
            addAgent: (newAgentData) => set((state) => {
                const newAgent: Agent = {
                    ...newAgentData,
                    id: Math.random().toString(36).substring(2, 9),
                    status: 'active',
                    calls: 0,
                    avgDuration: '0:00',
                    successRate: 0,
                    createdAt: new Date().toISOString().split('T')[0],
                    callHistory: [],
                };
                return { agents: [...state.agents, newAgent] };
            }),
            
            updateAgent: (id, updatedAgentData) => set((state) => ({
                agents: state.agents.map((agent) => 
                    agent.id === id 
                        ? { ...agent, ...updatedAgentData }
                        : agent
                )
            })),

            deleteAgent: (id) => set((state) => {
                const agentToDelete = state.agents.find(a => a.id === id);
                if (agentToDelete && (agentToDelete.name === 'Inbound call agent' || agentToDelete.name === 'Outbound call agent')) {
                    // Protected agents cannot be deleted
                    return state;
                }
                const newAgents = state.agents.filter((agent) => agent.id !== id);
                return { agents: newAgents };
            }),

            toggleAgentStatus: (id) => set((state) => ({
                agents: state.agents.map((agent) => 
                    agent.id === id 
                        ? { ...agent, status: agent.status === 'active' ? 'paused' : 'active' }
                        : agent
                )
            })),

            repairAgents: () => set((state) => ({
                agents: state.agents.map((agent) => {
                    const isInboundAgent = agent.name === 'Inbound call agent';
                    const isOutboundAgent = agent.name === 'Outbound call agent';
                    
                    if (isInboundAgent) {
                        return {
                            ...agent,
                            calls: 3,
                            avgDuration: '3:54',
                            successRate: 100,
                            callHistory: [...SAMPLE_CALLS],
                        };
                    } else if (isOutboundAgent) {
                        return {
                            ...agent,
                            calls: 3,
                            avgDuration: '2:45',
                            successRate: 100,
                            callHistory: [...OUTBOUND_SAMPLE_CALLS],
                        };
                    } else {
                        return {
                            ...agent,
                            calls: 0,
                            avgDuration: '0:00',
                            successRate: 0,
                            callHistory: [],
                        };
                    }
                })
            })),
        }),
        {
            name: 'agent-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.repairAgents();
                }
            },
        }
    )
);
