import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type Call = {
    id: string;
    caller: string;
    duration: string;
    status: 'success' | 'failed' | 'transferred' | 'missed' | 'ongoing';
    sentiment: 'positive' | 'neutral' | 'negative';
    date: string;
    time: string;
    recording: string;
    summary: string;
    transcript: { role: 'agent' | 'user'; text: string }[];
    cost?: number;
    campaign?: string;
};

export type Agent = {
    id: string;
    name: string;
    description: string;
    voice: string;
    language: string;
    personality: string;
    greeting: string;
    status: 'active' | 'paused' | 'inactive';
    calls: number;
    avgDuration: string;
    successRate: number;
    createdAt: string;
    callHistory: Call[];
    // New Configuration Fields
    goalObjective?: string;
    successCriteria?: string;
    postCallAction?: 'sms' | 'email' | 'webhook' | 'none';
    transferNumber?: string;
    escalationTrigger?: string;
    voicemailDetection?: boolean;
    businessHours?: any;
    webhookUrl?: string;
    webhookMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH';
    customVariables?: Record<string, string>;
    fallbackMessage?: string;
    maxSilenceSeconds?: number;
    maxCallDuration?: number;
    agentType?: 'inbound' | 'outbound' | 'both';
    lastActive?: string;
};

export type Contact = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'Hot' | 'Warm' | 'Cold' | 'Qualified' | 'Lost';
    source?: string;
    tags?: string[];
    lastContacted?: string;
    metadata?: any;
    createdAt: string;
};

export type Campaign = {
    id: string;
    name: string;
    description: string;
    agentId?: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    totalContacts: number;
    completedContacts: number;
    createdAt: string;
};

export type Message = {
    id: string;
    contactId: string;
    content: string;
    type: 'sms' | 'email';
    direction: 'inbound' | 'outbound';
    status: 'sent' | 'delivered' | 'failed' | 'received';
    createdAt: string;
};

export type Workflow = {
    id: string;
    name: string;
    triggerEvent: string;
    condition: any;
    actionType: string;
    actionConfig: any;
    isActive: boolean;
};

export type DncRecord = {
    id: string;
    phoneNumber: string;
    reason: string;
    addedBy?: string;
    createdAt: string;
};

export type ConsentRecord = {
    id: string;
    contactId: string;
    type: 'opt-in' | 'opt-out';
    date: string;
    agentId?: string;
    recordingRef?: string;
    expiry?: string;
};

export type ComplianceAuditLog = {
    id: string;
    callId?: string;
    eventType: 'call_blocked' | 'consent_granted' | 'consent_revoked' | 'dnc_added' | 'dnc_removed' | 'irdai_check_failed';
    status: string;
    details: any;
    createdAt: string;
};

export type IrdaiSettings = {
    mandatoryDisclosures: boolean;
    recordingRetentionDays: number;
    misSellingPrevention: boolean;
    scriptApprovalRequired: boolean;
};

export type AgentState = {
    agents: Agent[];
    contacts: Contact[];
    campaigns: Campaign[];
    messages: Message[];
    workflows: Workflow[];
    dncList: DncRecord[];
    consentRecords: ConsentRecord[];
    auditLogs: ComplianceAuditLog[];
    irdaiSettings: IrdaiSettings;
    isLoading: boolean;
    error: string | null;
    hasFetched: boolean;
    profile: any | null;
    onboardingCompleted: boolean;

    // Actions
    fetchProfile: () => Promise<void>;
    fetchAgents: () => Promise<void>;
    fetchContacts: () => Promise<void>;
    fetchCampaigns: () => Promise<void>;
    addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'totalContacts' | 'completedContacts'>) => Promise<void>;
    fetchMessages: () => Promise<void>;
    fetchWorkflows: () => Promise<void>;
    fetchComplianceData: () => Promise<void>;
    addDnc: (phone: string, reason: string) => Promise<void>;
    removeDnc: (id: string) => Promise<void>;
    addConsent: (consent: Omit<ConsentRecord, 'id' | 'date'>) => Promise<void>;
    logComplianceEvent: (eventType: ComplianceAuditLog['eventType'], status: string, details: any, callId?: string) => Promise<void>;
    updateIrdaiSettings: (settings: Partial<IrdaiSettings>) => void;
    
    addWorkflow: (workflow: Omit<Workflow, 'id'>) => Promise<void>;
    deleteWorkflow: (id: string) => Promise<void>;
    toggleWorkflowStatus: (id: string) => Promise<void>;
    addAgent: (agent: Omit<Agent, 'id' | 'calls' | 'avgDuration' | 'successRate' | 'status' | 'createdAt' | 'callHistory' | 'lastActive'>) => Promise<string | undefined>;
    updateAgent: (id: string, agent: Partial<Omit<Agent, 'id' | 'calls' | 'avgDuration' | 'successRate' | 'status' | 'createdAt' | 'callHistory' | 'lastActive'>>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;
    toggleAgentStatus: (id: string) => Promise<void>;
    // CRM Actions
    addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>;
    updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
};

export const useAgentStore = create<AgentState>()((set, get) => ({
    agents: [],
    contacts: [],
    campaigns: [],
    messages: [],
    workflows: [],
    dncList: [],
    consentRecords: [],
    auditLogs: [],
    irdaiSettings: {
        mandatoryDisclosures: true,
        recordingRetentionDays: 180,
        misSellingPrevention: true,
        scriptApprovalRequired: false
    },
    isLoading: false,
    error: null,
    hasFetched: false,
    profile: null,
    onboardingCompleted: true, // Default to true to avoid flicker before fetch

    fetchProfile: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                set({ 
                    profile: { ...data, workspace_id: data.default_workspace_id || data.workspace_id }, 
                    onboardingCompleted: data.onboarding_completed 
                });
            }
        }
    },

    fetchContacts: async () => {
        set({ isLoading: true });
        try {
            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            const supabase = createClient();
            const { data, error } = await supabase.from('contacts').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
            if (error) throw error;
            set({ 
                contacts: data.map(l => ({
                    id: l.id,
                    fullName: l.full_name,
                    email: l.email,
                    phone: l.phone_e164,
                    status: l.status,
                    source: l.source,
                    tags: l.tags,
                    lastContacted: l.last_contacted,
                    metadata: l.metadata,
                    createdAt: l.created_at
                })),
                isLoading: false 
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchCampaigns: async () => {
        set({ isLoading: true });
        try {
            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            const supabase = createClient();
            const { data, error } = await supabase.from('campaigns').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
            if (error) throw error;
            set({ 
                campaigns: data.map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description || "",
                    status: c.status,
                    agentId: c.agent_id,
                    totalContacts: c.total_contacts,
                    completedContacts: c.completed_contacts,
                    createdAt: c.created_at
                }))
            });
        } catch (err: any) {
            console.error("Campaign store fetch error:", err);
            set({ error: err.message, isLoading: false });
        }
    },

    addCampaign: async (newCampaign) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const dbPayload = {
            created_by: userData.user.id,
            org_id: get().profile?.org_id,
            workspace_id: get().profile?.workspace_id,
            name: newCampaign.name,
            description: newCampaign.description,
            agent_id: newCampaign.agentId,
            status: newCampaign.status || 'draft',
            total_contacts: 0,
            completed_contacts: 0
        };

        const { error } = await supabase.from('campaigns').insert(dbPayload);
        if (error) {
            console.error("Error creating campaign:", error);
            return;
        }
        
        await get().fetchCampaigns();
    },

    fetchMessages: async () => {
        set({ isLoading: true });
        try {
            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            const supabase = createClient();
            const { data, error } = await supabase.from('messages').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
            if (error) throw error;
            set({ 
                messages: data.map(m => ({
                    id: m.id,
                    contactId: m.contact_id,
                    content: m.content,
                    type: m.type,
                    direction: m.direction,
                    status: m.status,
                    createdAt: m.created_at
                })),
                isLoading: false 
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchWorkflows: async () => {
        set({ isLoading: true });
        try {
            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            const supabase = createClient();
            const { data, error } = await supabase.from('workflows').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
            if (error) throw error;
            set({ 
                workflows: data.map(w => ({
                    id: w.id,
                    name: w.name,
                    triggerEvent: w.trigger_event,
                    condition: w.condition,
                    actionType: w.action_type,
                    actionConfig: w.action_config,
                    isActive: w.is_active
                })),
                isLoading: false 
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchComplianceData: async () => {
        try {
            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            const supabase = createClient();
            
            const [dncRes, consentRes, auditRes] = await Promise.all([
                supabase.from('dnc_list').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
                supabase.from('consent_records').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false }),
                supabase.from('compliance_audit_logs').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false })
            ]);

            if (dncRes.error) throw dncRes.error;
            if (consentRes.error) throw consentRes.error;
            if (auditRes.error) throw auditRes.error;

            set({
                dncList: dncRes.data.map(d => ({
                    id: d.id,
                    phoneNumber: d.phone_e164,
                    reason: d.reason || '',
                    addedBy: d.added_by,
                    createdAt: d.created_at
                })),
                consentRecords: consentRes.data.map(c => ({
                    id: c.id,
                    contactId: c.contact_id,
                    type: c.type,
                    date: c.date,
                    agentId: c.agent_id,
                    recordingRef: c.recording_ref,
                    expiry: c.expiry
                })),
                auditLogs: auditRes.data.map(a => ({
                    id: a.id,
                    callId: a.call_id,
                    eventType: a.event_type,
                    status: a.status,
                    details: a.details,
                    createdAt: a.created_at
                }))
            });
        } catch (err: any) {
            console.error("Error fetching compliance data:", err);
        }
    },

    addDnc: async (phone, reason) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('dnc_list').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            phone_e164: phone,
            reason: reason,
            added_by: userData.user.id
        });

        if (error) {
            console.error("Error adding DNC:", error);
            return;
        }
        await get().logComplianceEvent('dnc_added', 'success', { phone, reason });
        await get().fetchComplianceData();
    },

    removeDnc: async (id) => {
        const supabase = createClient();
        const dnc = get().dncList.find(d => d.id === id);
        const { error } = await supabase.from('dnc_list').delete().eq('id', id);
        if (error) {
            console.error("Error removing DNC:", error);
            return;
        }
        if (dnc) {
            await get().logComplianceEvent('dnc_removed', 'success', { phone: dnc.phoneNumber });
        }
        await get().fetchComplianceData();
    },

    addConsent: async (consent) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('consent_records').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            contact_id: consent.contactId,
            type: consent.type,
            agent_id: consent.agentId,
            recording_ref: consent.recordingRef,
            expiry: consent.expiry
        });

        if (error) {
            console.error("Error adding consent:", error);
            return;
        }
        await get().logComplianceEvent(consent.type === 'opt-in' ? 'consent_granted' : 'consent_revoked', 'success', { contactId: consent.contactId });
        await get().fetchComplianceData();
    },

    logComplianceEvent: async (eventType, status, details, callId) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('compliance_audit_logs').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            event_type: eventType,
            status: status,
            details: details,
            call_id: callId
        });

        if (error) console.error("Error logging compliance event:", error);
    },

    updateIrdaiSettings: (settings) => {
        set((state) => ({
            irdaiSettings: { ...state.irdaiSettings, ...settings }
        }));
    },

    addWorkflow: async (newWorkflow) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('workflows').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            name: newWorkflow.name,
            trigger_event: newWorkflow.triggerEvent,
            condition: newWorkflow.condition,
            action_type: newWorkflow.actionType,
            action_config: newWorkflow.actionConfig,
            is_active: newWorkflow.isActive
        });

        if (error) console.error("Error adding workflow:", error);
        await get().fetchWorkflows();
    },

    deleteWorkflow: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('workflows').delete().eq('id', id);
        if (error) console.error("Error deleting workflow:", error);
        set((state) => ({ workflows: state.workflows.filter(w => w.id !== id) }));
    },

    toggleWorkflowStatus: async (id) => {
        const state = get();
        const workflow = state.workflows.find(w => w.id === id);
        if (!workflow) return;

        const newStatus = !workflow.isActive;
        
        // Optimistic update
        set((state) => ({
            workflows: state.workflows.map((w) => w.id === id ? { ...w, isActive: newStatus } : w)
        }));

        const supabase = createClient();
        const { error } = await supabase.from('workflows').update({ is_active: newStatus }).eq('id', id);
        if (error) {
            console.error("Error toggling workflow status:", error);
            // Revert
            set((state) => ({
                workflows: state.workflows.map((w) => w.id === id ? { ...w, isActive: workflow.isActive } : w)
            }));
        }
    },
    fetchAgents: async () => {
        
        set({ isLoading: true, error: null });
        try {
            const supabase = createClient();
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) throw new Error("Not authenticated");

            let workspaceId = get().profile?.workspace_id;
            if (!workspaceId) {
                await get().fetchProfile();
                workspaceId = get().profile?.workspace_id;
            }
            if (!workspaceId) throw new Error("Workspace ID not found");

            // Fetch agents
            const { data: agentsData, error: agentsError } = await supabase
                .from('ai_agents')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (agentsError) throw agentsError;

            // Fetch calls for these agents
            const { data: callsData, error: callsError } = await supabase
                .from('calls')
                .select('*')
                .eq('workspace_id', workspaceId)
                .order('created_at', { ascending: false });

            if (callsError) throw callsError;

            const mappedAgents: Agent[] = (agentsData || []).map(dbAgent => {
                // Map the DB calls to the agent
                const agentCalls = (callsData || []).filter(c => c.agent_id === dbAgent.id);
                
                const mappedCallHistory: Call[] = agentCalls.map(c => {
                    let parsedTranscript = [];
                    try {
                        if (c.transcript) parsedTranscript = JSON.parse(c.transcript);
                    } catch (e) {
                         // Fallback safely if string isn't valid JSON
                    }

                    const dt = c.created_at ? new Date(c.created_at) : new Date();
                    
                    const isName = /[a-zA-Z]/.test(c.phone_e164 || "");
                    let finalCaller = c.phone_e164 || "Unknown";
                    if (isName) {
                        let hash = 0;
                        const idStr = c.id || "default";
                        for (let i = 0; i < idStr.length; i++) hash = (hash << 5) - hash + idStr.charCodeAt(i);
                        const num = Math.abs(hash) % 10000000000;
                        const padded = num.toString().padStart(10, '0');
                        finalCaller = `+91 ${padded.slice(0, 5)} ${padded.slice(5)}`;
                    }

                    return {
                        id: c.id,
                        caller: finalCaller,
                        duration: c.duration ? `${Math.floor(c.duration / 60)}:${(c.duration % 60).toString().padStart(2, '0')}` : "0:00",
                        status: c.status === 'completed' ? 'success' : 'failed',
                        sentiment: c.sentiment || 'neutral',
                        date: dt.toLocaleDateString(),
                        time: dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        recording: c.recording_url || "",
                        summary: c.summary || "",
                        transcript: parsedTranscript
                    };
                });

                return {
                    id: dbAgent.id,
                    name: dbAgent.name,
                    description: dbAgent.description || "",
                    voice: dbAgent.voice_settings?.voice || "Nova",
                    language: dbAgent.languages?.[0] || "English",
                    personality: dbAgent.voice_settings?.personality || "Professional",
                    greeting: dbAgent.script_template || "Hello",
                    status: dbAgent.status as 'active' | 'paused',
                    calls: dbAgent.total_calls || 0,
                    avgDuration: dbAgent.avg_duration ? `${Math.floor(dbAgent.avg_duration / 60)}:${(dbAgent.avg_duration % 60).toString().padStart(2, '0')}` : "0:00",
                    successRate: Number(dbAgent.success_rate) || 0,
                    createdAt: dbAgent.created_at ? dbAgent.created_at : "",
                    callHistory: mappedCallHistory,
                    // New fields
                    goalObjective: dbAgent.goal_objective,
                    successCriteria: dbAgent.success_criteria,
                    postCallAction: dbAgent.post_call_action,
                    transferNumber: dbAgent.transfer_number,
                    escalationTrigger: dbAgent.escalation_trigger,
                    voicemailDetection: dbAgent.voicemail_detection,
                    businessHours: dbAgent.business_hours,
                    webhookUrl: dbAgent.webhook_url,
                    webhookMethod: dbAgent.webhook_method,
                    customVariables: dbAgent.custom_variables,
                    fallbackMessage: dbAgent.fallback_message,
                    maxSilenceSeconds: dbAgent.max_silence_seconds,
                    maxCallDuration: dbAgent.max_call_duration,
                    agentType: dbAgent.agent_type,
                    lastActive: dbAgent.last_active
                };
            });

            console.log("AGENTS DATA FROM DB:", agentsData);
            set({ agents: mappedAgents, isLoading: false, hasFetched: true });
        } catch (err: any) {
            console.error("Agent store fetch error:", err);
            set({ error: err.message, isLoading: false });
        }
    },

    addAgent: async (newAgentData) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return undefined;

        const dbPayload = {
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            name: newAgentData.name,
            description: newAgentData.description,
            status: 'active',
            languages: [newAgentData.language],
            voice_settings: {
                voice: newAgentData.voice,
                personality: newAgentData.personality
            },
            script_template: newAgentData.greeting,
            total_calls: 0,
            avg_duration: 0,
            success_rate: 0,
            goal_objective: newAgentData.goalObjective,
            success_criteria: newAgentData.successCriteria,
            post_call_action: newAgentData.postCallAction || 'none',
            transfer_number: newAgentData.transferNumber,
            escalation_trigger: newAgentData.escalationTrigger,
            voicemail_detection: newAgentData.voicemailDetection || false,
            business_hours: newAgentData.businessHours || {},
            webhook_url: newAgentData.webhookUrl,
            webhook_method: newAgentData.webhookMethod,
            custom_variables: newAgentData.customVariables || {},
            fallback_message: newAgentData.fallbackMessage,
            max_silence_seconds: newAgentData.maxSilenceSeconds || 10,
            max_call_duration: newAgentData.maxCallDuration || 600,
            agent_type: newAgentData.agentType || 'both'
        };

        const { data, error } = await supabase.from('ai_agents').insert(dbPayload).select().single();
        if (error) {
            console.error("Error adding agent:", error);
            return undefined;
        }
        
        // Refresh store
        await get().fetchAgents();
        return data.id;
    },

    updateAgent: async (id, updatedAgentData) => {
        const supabase = createClient();
        
        const dbPayload: any = {};
        if (updatedAgentData.name) dbPayload.name = updatedAgentData.name;
        if (updatedAgentData.description !== undefined) dbPayload.description = updatedAgentData.description;
        if (updatedAgentData.language) dbPayload.languages = [updatedAgentData.language];
        
        if (updatedAgentData.voice || updatedAgentData.personality) {
            dbPayload.voice_settings = {
                voice: updatedAgentData.voice || "Nova",
                personality: updatedAgentData.personality || "Professional"
            };
        }
        if (updatedAgentData.greeting) dbPayload.script_template = updatedAgentData.greeting;
        
        // Advanced fields
        if (updatedAgentData.goalObjective !== undefined) dbPayload.goal_objective = updatedAgentData.goalObjective;
        if (updatedAgentData.successCriteria !== undefined) dbPayload.success_criteria = updatedAgentData.successCriteria;
        if (updatedAgentData.postCallAction !== undefined) dbPayload.post_call_action = updatedAgentData.postCallAction;
        if (updatedAgentData.transferNumber !== undefined) dbPayload.transfer_number = updatedAgentData.transferNumber;
        if (updatedAgentData.escalationTrigger !== undefined) dbPayload.escalation_trigger = updatedAgentData.escalationTrigger;
        if (updatedAgentData.voicemailDetection !== undefined) dbPayload.voicemail_detection = updatedAgentData.voicemailDetection;
        if (updatedAgentData.businessHours !== undefined) dbPayload.business_hours = updatedAgentData.businessHours;
        if (updatedAgentData.webhookUrl !== undefined) dbPayload.webhook_url = updatedAgentData.webhookUrl;
        if (updatedAgentData.webhookMethod !== undefined) dbPayload.webhook_method = updatedAgentData.webhookMethod;
        if (updatedAgentData.customVariables !== undefined) dbPayload.custom_variables = updatedAgentData.customVariables;
        if (updatedAgentData.fallbackMessage !== undefined) dbPayload.fallback_message = updatedAgentData.fallbackMessage;
        if (updatedAgentData.maxSilenceSeconds !== undefined) dbPayload.max_silence_seconds = updatedAgentData.maxSilenceSeconds;
        if (updatedAgentData.maxCallDuration !== undefined) dbPayload.max_call_duration = updatedAgentData.maxCallDuration;
        if (updatedAgentData.agentType !== undefined) dbPayload.agent_type = updatedAgentData.agentType;

        const { error } = await supabase.from('ai_agents').update(dbPayload).eq('id', id);
        if (error) console.error("Error updating agent:", error);
        
        await get().fetchAgents();
    },

    deleteAgent: async (id) => {
        const supabase = createClient();
        
        const { error } = await supabase.from('ai_agents').delete().eq('id', id);
        
        if (error) {
           console.error("Error deleting agent (you cannot delete default agents):", error);
           alert("You cannot delete default agents.");
           return;
        }
        
        // Optimistic UI update logic: removed immediately if successful
        set((state) => ({ agents: state.agents.filter(a => a.id !== id) }));
    },

    toggleAgentStatus: async (id) => {
        const state = get();
        const agent = state.agents.find(a => a.id === id);
        if (!agent) return;

        const newStatus = agent.status === 'active' ? 'paused' : 'active';
        
        // Optimistic UI update
        set((state) => ({
            agents: state.agents.map((a) => a.id === id ? { ...a, status: newStatus } : a)
        }));

        const supabase = createClient();
        const { error } = await supabase.from('ai_agents').update({ status: newStatus }).eq('id', id);
        if (error) {
            console.error("Error toggling status:", error);
            // Revert on error
            set((state) => ({
                agents: state.agents.map((a) => a.id === id ? { ...a, status: agent.status } : a)
            }));
        }
    },

    addContact: async (newLead) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('contacts').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            full_name: newLead.fullName,
            email: newLead.email,
            phone_e164: newLead.phone,
            status: newLead.status,
            source: newLead.source,
            tags: newLead.tags,
            metadata: newLead.metadata
        });

        if (error) console.error("Error adding lead:", error);
        await get().fetchContacts();
    },

    updateContact: async (id, updatedLead) => {
        const supabase = createClient();
        const dbPayload: any = {};
        if (updatedLead.fullName) dbPayload.full_name = updatedLead.fullName;
        if (updatedLead.email) dbPayload.email = updatedLead.email;
        if (updatedLead.phone) dbPayload.phone_e164 = updatedLead.phone;
        if (updatedLead.status) dbPayload.status = updatedLead.status;
        if (updatedLead.source) dbPayload.source = updatedLead.source;
        if (updatedLead.tags) dbPayload.tags = updatedLead.tags;
        if (updatedLead.metadata) dbPayload.metadata = updatedLead.metadata;

        const { error } = await supabase.from('contacts').update(dbPayload).eq('id', id);
        if (error) console.error("Error updating lead:", error);
        await get().fetchContacts();
    },

    deleteContact: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) console.error("Error deleting lead:", error);
        set((state) => ({ contacts: state.contacts.filter(l => l.id !== id) }));
    },

    addMessage: async (newMessage) => {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const { error } = await supabase.from('messages').insert({
            created_by: userData.user.id, org_id: get().profile?.org_id, workspace_id: get().profile?.workspace_id,
            contact_id: newMessage.contactId,
            content: newMessage.content,
            type: newMessage.type,
            direction: newMessage.direction,
            status: newMessage.status
        });

        if (error) console.error("Error adding message:", error);
        await get().fetchMessages();
    }
}));
