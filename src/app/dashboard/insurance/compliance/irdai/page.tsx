"use client"

import { useEffect, useState } from "react"
import { useAgentStore } from "@/store/useAgentStore"
import { 
    ShieldAlert, 
    Save, 
    CheckCircle2, 
    AlertTriangle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function IRDAISettingsPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { irdaiSettings, updateIrdaiSettings } = useAgentStore()

    // Local form state
    const [settings, setSettings] = useState({
        mandatoryDisclosures: true,
        recordingRetentionDays: 180,
        misSellingPrevention: true,
        scriptApprovalRequired: false
    })

    const [hasSaved, setHasSaved] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (irdaiSettings) {
            setSettings(irdaiSettings)
        }
    }, [irdaiSettings])

    if (!isMounted) return null

    const handleSave = () => {
        updateIrdaiSettings(settings)
        setHasSaved(true)
        setTimeout(() => setHasSaved(false), 3000)
    }

    const handleChange = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setHasSaved(false)
    }

    const calculateComplianceScore = () => {
        let score = 0;
        if (settings.mandatoryDisclosures) score += 25;
        if (settings.recordingRetentionDays >= 180) score += 25;
        if (settings.misSellingPrevention) score += 25;
        if (settings.scriptApprovalRequired) score += 25;
        return score;
    }

    const complianceScore = calculateComplianceScore();

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-gold-400" />
                        IRDAI Compliance Checklist
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Configure agent constraints to align with the Insurance Regulatory and Development Authority of India guidelines.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={`border-${complianceScore === 100 ? 'green' : 'yellow'}-400/20 text-${complianceScore === 100 ? 'green' : 'yellow'}-400 px-4 py-2 text-lg font-bold`}>
                        Score: {complianceScore}%
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Configuration Panel */}
                <div className="bg-card border border-gold-400/10 rounded-2xl p-6 lg:col-span-2 space-y-8">
                    
                    <div className="space-y-4">
                        <div className="flex items-start justify-between border-b border-gold-400/10 pb-4">
                            <div>
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    Mandatory Disclosures
                                    {settings.mandatoryDisclosures ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Require AI agents to clearly state their identity as an AI and the purpose of the call within the first 30 seconds.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.mandatoryDisclosures}
                                    onChange={(e) => handleChange('mandatoryDisclosures', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500 border border-gold-400/20"></div>
                            </label>
                        </div>

                        <div className="flex items-start justify-between border-b border-gold-400/10 pb-4">
                            <div className="pr-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    Mis-Selling Prevention Guardrails
                                    {settings.misSellingPrevention ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enforce prompt-level constraints preventing the AI from guaranteeing returns, making false claims, or hiding exclusions.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.misSellingPrevention}
                                    onChange={(e) => handleChange('misSellingPrevention', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500 border border-gold-400/20"></div>
                            </label>
                        </div>

                        <div className="flex items-start justify-between border-b border-gold-400/10 pb-4">
                            <div className="pr-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    Mandatory Script Approval
                                    {settings.scriptApprovalRequired ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Require an admin to manually approve any script changes before an AI agent can be deployed to production.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer mt-2">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={settings.scriptApprovalRequired}
                                    onChange={(e) => handleChange('scriptApprovalRequired', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500 border border-gold-400/20"></div>
                            </label>
                        </div>

                        <div className="flex items-start justify-between pb-4">
                            <div className="pr-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    Data Retention Policy (Days)
                                    {settings.recordingRetentionDays >= 180 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Number of days call recordings and transcripts are retained. IRDAI recommends at least 180 days.
                                </p>
                            </div>
                            <input 
                                type="number" 
                                min="30"
                                className="w-24 bg-black/50 border-gold-400/20 text-white focus-visible:ring-gold-400 rounded-md px-3 py-2 text-right"
                                value={settings.recordingRetentionDays}
                                onChange={(e) => handleChange('recordingRetentionDays', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gold-400/10 flex justify-end">
                        <Button 
                            onClick={handleSave}
                            className="bg-gold-gradient text-black font-semibold hover:opacity-90"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {hasSaved ? "Configuration Saved!" : "Save Configuration"}
                        </Button>
                    </div>

                </div>

                {/* IRDAI Info Panel */}
                <div className="bg-card border border-gold-400/10 rounded-2xl p-6 lg:col-span-1 h-fit">
                    <h2 className="text-lg font-semibold text-white mb-4">Regulatory Notice</h2>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        <p className="text-sm text-yellow-200">
                            Failing to comply with IRDAI telemarketing guidelines can result in strict penalties and license revocation. 
                        </p>
                        <p className="text-sm text-yellow-200/70">
                            SwiftSocial AI enforces guardrails, but the ultimate responsibility for script approval and claim accuracy lies with the Principal Officer.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}
