"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAgentStore } from "@/store/useAgentStore"
import { 
    ShieldAlert, 
    ShieldCheck, 
    Download, 
    FileText, 
    PhoneOff, 
    UserCheck,
    Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function ComplianceDashboardPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { fetchComplianceData, auditLogs, consentRecords, dncList, irdaiSettings } = useAgentStore()
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        fetchComplianceData()
    }, [fetchComplianceData])

    if (!isMounted) return null

    const handleExportPDF = () => {
        setIsExporting(true)
        try {
            const doc = new jsPDF()
            
            // Title
            doc.setFontSize(20)
            doc.text("Compliance Audit Report", 14, 22)
            
            // Meta Info
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)
            doc.text(`Total DNC Records: ${dncList.length}`, 14, 35)
            doc.text(`Total Consent Records: ${consentRecords.length}`, 14, 40)
            
            // Table
            const tableData = auditLogs.slice(0, 50).map(log => [
                new Date(log.createdAt).toLocaleString(),
                log.eventType.replace(/_/g, ' ').toUpperCase(),
                log.status.toUpperCase(),
                JSON.stringify(log.details)
            ])

            autoTable(doc, {
                startY: 50,
                head: [['Timestamp', 'Event Type', 'Status', 'Details']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [212, 175, 55] }, // Gold color
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 35 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 'auto' }
                }
            })

            doc.save(`compliance-audit-${new Date().getTime()}.pdf`)
        } catch (error) {
            console.error("Export failed", error)
        } finally {
            setIsExporting(false)
        }
    }

    const cards = [
        {
            title: "DNC Registry",
            value: dncList.length,
            icon: PhoneOff,
            link: "/dashboard/insurance/compliance/dnc",
            color: "text-red-400"
        },
        {
            title: "Consent Records",
            value: consentRecords.length,
            icon: UserCheck,
            link: "/dashboard/insurance/compliance/consent",
            color: "text-green-400"
        },
        {
            title: "IRDAI Health",
            value: irdaiSettings.misSellingPrevention ? "Protected" : "Warning",
            icon: ShieldCheck,
            link: "/dashboard/insurance/compliance/irdai",
            color: irdaiSettings.misSellingPrevention ? "text-gold-400" : "text-yellow-500"
        },
        {
            title: "Audit Events",
            value: auditLogs.length,
            icon: FileText,
            link: "#", // Current page
            color: "text-blue-400"
        }
    ]

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-gold-400" />
                        Compliance Center
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Monitor Do Not Call (DNC) lists, manage user consents, and track immutable audit logs to ensure regulatory adherence.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/insurance/compliance/irdai">
                            <Settings className="w-4 h-4 mr-2" />
                            IRDAI Settings
                        </Link>
                    </Button>
                    <Button 
                        onClick={handleExportPDF} 
                        disabled={isExporting || auditLogs.length === 0}
                        className="bg-gold-gradient text-black font-semibold hover:opacity-90"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? "Exporting..." : "Export PDF Report"}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-card border border-gold-400/10 rounded-2xl p-5 hover:border-gold-400/30 transition-colors"
                    >
                        <Link href={card.link} className="block">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center ${card.color}`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-muted-foreground opacity-50" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
                                <p className="text-2xl font-bold mt-1 text-white">{card.value}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Audit Logs */}
            <div className="bg-card border border-gold-400/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Audit Logs</h2>
                    <Badge variant="outline" className="border-gold-400/20 text-gold-400">
                        Immutable Ledger
                    </Badge>
                </div>

                <div className="space-y-4">
                    {auditLogs.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gold-400/10 rounded-xl">
                            <ShieldCheck className="w-12 h-12 text-gold-400/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white mb-2">No Compliance Events Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Audit logs will automatically appear here when calls are blocked, consent is modified, or IRDAI checks fail.
                            </p>
                        </div>
                    ) : (
                        auditLogs.slice(0, 10).map((log, idx) => (
                            <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-gold-400/5 hover:border-gold-400/20 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                                    <div>
                                        <p className="font-medium text-white capitalize">{log.eventType.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="outline" className={log.status === 'success' ? 'border-green-400/20 text-green-400' : 'border-red-400/20 text-red-400'}>
                                        {log.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground max-w-[200px] truncate">
                                        {JSON.stringify(log.details)}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function ArrowRightIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
