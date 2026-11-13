"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Eye, Database, AlertTriangle } from "lucide-react"

export default function TravelCompliancePage() {
    const [auditLogs, setAuditLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('compliance_audit_logs')
                .select('*')
                .eq('event_type', 'passport_decrypted')
                .order('created_at', { ascending: false })
            
            if (data) {
                setAuditLogs(data)
            }
            setIsLoading(false)
        }
        fetchLogs()
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                    Travel Compliance Center
                </h1>
                <p className="text-gray-400">Manage data privacy, view access logs, and review retention policies for sensitive PII.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Active Retention Policy</CardTitle>
                        <Database className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">90 Days</div>
                        <p className="text-xs text-gray-500 mt-1">Post-trip passport data purge</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Decryption Events (30d)</CardTitle>
                        <Eye className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{auditLogs.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Total passport views tracked</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-gold-500/20">
                <CardHeader>
                    <CardTitle className="text-gold-400 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Passport Access Audit Log
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        A strict tracking log of all users who have decrypted and viewed sensitive passport information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-gray-400">Loading audit logs...</div>
                    ) : auditLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                            <Shield className="w-12 h-12 mb-3 opacity-20" />
                            <p>No passport decryption events logged yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">User ID</th>
                                        <th className="px-4 py-3">Contact ID</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-4 py-3">{new Date(log.created_at).toLocaleString()}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{log.user_id}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{log.details?.contact_id || 'Unknown'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${log.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-red-900/10 border-red-500/20">
                <CardHeader>
                    <CardTitle className="text-red-400 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Compliance Warnings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                        <li>Ensure all AI Agents have the mandatory "Opt-out" instructions configured in their script template.</li>
                        <li>Do not store unencrypted passport copies outside of the platform.</li>
                        <li>Automated purges run every Sunday at 02:00 AM UTC.</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
