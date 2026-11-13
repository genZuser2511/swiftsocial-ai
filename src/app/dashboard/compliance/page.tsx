"use client"
import { useState } from "react"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { ShieldAlert, FileText, CheckCircle2, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ComplianceDashboardPage() {
    const [activeTab, setActiveTab] = useState('audit')

    const MOCK_AUDIT = [
        { id: 'log-1', action: 'EXPORT_LEADS', user: 'Admin User', date: '2026-06-03 10:45 AM', status: 'SUCCESS' },
        { id: 'log-2', action: 'DELETE_AGENT', user: 'Admin User', date: '2026-06-02 04:12 PM', status: 'BLOCKED' },
        { id: 'log-3', action: 'UPDATE_BILLING', user: 'Admin User', date: '2026-06-01 11:30 AM', status: 'SUCCESS' },
    ]

    const MOCK_CONSENT = [
        { id: 'c-1', phone: '+14155552671', type: 'TCPA', status: 'GRANTED', date: '2026-06-01' },
        { id: 'c-2', phone: '+447911123456', type: 'GDPR', status: 'REVOKED', date: '2026-05-28' },
    ]

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-gold-400" />
                    Compliance & Security
                </h1>
                <p className="text-muted-foreground mt-2">
                    Immutable audit trails, consent records, and legal compliance.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
                {['audit', 'consent', 'dnc'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                            activeTab === tab 
                            ? 'bg-gold-gradient text-black' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        {tab === 'dnc' ? 'DNC Registry' : `${tab} Logs`}
                    </button>
                ))}
            </div>

            {/* Content */}
            <GradientCard>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold capitalize">
                        {activeTab === 'dnc' ? 'Do Not Call (DNC) Registry' : `${activeTab} Records`}
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                            <Download className="w-4 h-4 mr-2" /> Export PDF
                        </Button>
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                            {activeTab === 'audit' && (
                                <tr>
                                    <th className="px-6 py-4">Action ID</th>
                                    <th className="px-6 py-4">Event Type</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            )}
                            {activeTab === 'consent' && (
                                <tr>
                                    <th className="px-6 py-4">Phone E.164</th>
                                    <th className="px-6 py-4">Consent Type</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            )}
                            {activeTab === 'dnc' && (
                                <tr>
                                    <th className="px-6 py-4">Phone E.164</th>
                                    <th className="px-6 py-4">Added By</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4 text-right">Date Added</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {activeTab === 'audit' && MOCK_AUDIT.map(log => (
                                <tr key={log.id} className="hover:bg-muted/20">
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{log.id}</td>
                                    <td className="px-6 py-4 font-semibold">{log.action}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center text-[10px] text-gold-400 font-bold">A</div>
                                        {log.user}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{log.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'consent' && MOCK_CONSENT.map(log => (
                                <tr key={log.id} className="hover:bg-muted/20">
                                    <td className="px-6 py-4 font-mono">{log.phone}</td>
                                    <td className="px-6 py-4">{log.type}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{log.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            log.status === 'GRANTED' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {activeTab === 'dnc' && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        <p>No numbers on the DNC list currently.</p>
                                        <Button variant="link" className="text-gold-400 mt-2">Manually add number</Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GradientCard>
        </div>
    )
}
