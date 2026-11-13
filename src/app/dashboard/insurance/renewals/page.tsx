"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar,
    ChevronDown,
    Download,
    FileText,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Shield,
    Users,
    User,
    Activity,
    Clock,
    AlertCircle,
    ArrowUpRight,
    Briefcase,
    Building2,
    MapPin,
    Eye,
    MessageSquare,
    Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/shared/GradientCard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// --- Mock Data ---

const RENEWAL_KPI = [
    { title: "Upcoming Renewals", value: "128", change: "+5", color: "text-teal-400", bg: "bg-teal-400/10" },
    { title: "Gross Premium", value: "₹85.2L", change: "+12%", color: "text-gold-400", bg: "bg-gold-400/10" },
    { title: "Net Premium", value: "₹72.4L", change: "+8%", color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Due in 3 Days", value: "14", change: "Urgent", color: "text-red-400", bg: "bg-red-400/10" },
]

const MOCK_RENEWALS = [
    {
        id: "pol_1",
        callStatus: "Pending",
        groupName: "Mehta Family",
        customerNames: ["Rajesh Mehta", "Sunita Mehta", "Arjun Mehta"],
        businessType: "Renewal",
        sumInsured: "₹15,00,000",
        insurer: "Alpha Health",
        product: "Family Medicare",
        subProduct: "Gold Plus",
        term: "2 Year",
        ppt: "1 Year",
        policyNo: "POL-77889900",
        doc: "2024-05-10",
        endDate: "2026-05-09",
        fup: "2026-05-01",
        netPremium: 42500,
        grossPremium: 50150,
        contactPerson: "Rajesh Mehta",
        phone: "+91 98765 43210",
        email: "rajesh.m@example.com",
        address: "A-402, Skyline Apartments, Ahmedabad",
        re: "Suresh Kumar",
        regNo: "N/A",
        vehicleDetails: {},
        riskDetails: { type: "Floater", members: 3 },
        mode: "Yearly",
        renewalPref: "Auto"
    },
    {
        id: "pol_2",
        callStatus: "Called",
        groupName: "Individual",
        customerNames: ["Priya Sharma"],
        businessType: "Normal",
        sumInsured: "₹5,00,000",
        insurer: "Beta Life",
        product: "Term Shield",
        subProduct: "Basic",
        term: "10 Year",
        ppt: "10 Year",
        policyNo: "POL-11223344",
        doc: "2025-06-15",
        endDate: "2026-06-14",
        fup: "2026-05-15",
        netPremium: 12000,
        grossPremium: 14160,
        contactPerson: "Priya Sharma",
        phone: "+91 99887 76655",
        email: "priya.s@example.com",
        address: "Flat 12, Ocean View, Mumbai",
        re: "Anita Desai",
        regNo: "MH-01-AB-1234",
        vehicleDetails: { make: "Honda", model: "City", year: 2022 },
        riskDetails: { type: "Comprehensive" },
        mode: "Monthly",
        renewalPref: "Manual"
    }
]

// --- Components ---

export default function RenewalReportPage() {
    const [selectedPolicy, setSelectedPolicy] = useState<any>(null)
    const [isRemarksOpen, setIsRemarksOpen] = useState(false)
    const [remarks, setRemarks] = useState("")
    const [activeFilters, setActiveFilters] = useState({
        renewalType: "Upcoming",
        re: "All",
        vertical: "All",
        callStatus: "All"
    })

    const getCallStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
            case "Called": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
            case "Interested": return "bg-green-500/10 text-green-400 border-green-500/20"
            case "Not Interested": return "bg-red-500/10 text-red-400 border-red-500/20"
            case "Callback Scheduled": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-gold-400" />
                        Renewal Report
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage policy renewals, follow-ups, and agent remarks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gold-400/20 text-gold-400 hover:bg-gold-400/10">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button className="bg-gold-gradient text-black font-semibold hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" /> Bulk Action
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            <GradientCard className="p-4 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-background/40 p-1 rounded-lg border border-white/5">
                        {["Upcoming", "Missed", "Retained"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveFilters(prev => ({ ...prev, renewalType: type }))}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                                    activeFilters.renewalType === type 
                                        ? "bg-gold-400 text-black shadow-lg" 
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, policy, group..." 
                            className="pl-9 bg-background/50 border-gold-400/10 focus:border-gold-400/40"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select defaultValue="All">
                            <SelectTrigger className="w-[140px] bg-background/50 border-gold-400/10">
                                <SelectValue placeholder="All RE" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All RE</SelectItem>
                                <SelectItem value="Suresh">Suresh Kumar</SelectItem>
                                <SelectItem value="Anita">Anita Desai</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select defaultValue="All">
                            <SelectTrigger className="w-[140px] bg-background/50 border-gold-400/10">
                                <SelectValue placeholder="Call Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Called">Called</SelectItem>
                                <SelectItem value="Interested">Interested</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon" className="border-gold-400/20 text-muted-foreground">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </GradientCard>

            {/* KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {RENEWAL_KPI.map((kpi, i) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GradientCard className="p-4 py-5 flex items-center justify-between border-white/5">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">{kpi.title}</p>
                                <h3 className="text-xl font-bold">{kpi.value}</h3>
                                <p className={cn("text-[10px] mt-1 font-bold", kpi.color)}>{kpi.change}</p>
                            </div>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", kpi.bg)}>
                                <Activity className={cn("w-5 h-5", kpi.color)} />
                            </div>
                        </GradientCard>
                    </motion.div>
                ))}
            </div>

            {/* Listing Table */}
            <div className="rounded-xl border border-gold-400/10 bg-card/30 backdrop-blur-sm overflow-hidden relative">
                <ScrollArea className="w-full whitespace-nowrap">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-gold-400/10">
                            <tr>
                                <th className="sticky left-0 z-20 bg-card/95 px-4 py-3 border-r border-gold-400/10 min-w-[120px]">Call Status</th>
                                <th className="sticky left-[120px] z-20 bg-card/95 px-4 py-3 border-r border-gold-400/10 min-w-[180px]">Action</th>
                                <th className="px-4 py-3 min-w-[60px]">Sr.</th>
                                <th className="px-4 py-3 min-w-[150px]">Group Name</th>
                                <th className="px-4 py-3 min-w-[200px]">Customer Names</th>
                                <th className="px-4 py-3 min-w-[120px]">Busi. Type</th>
                                <th className="px-4 py-3 min-w-[140px]">Sum Insured</th>
                                <th className="px-4 py-3 min-w-[120px]">Insurer</th>
                                <th className="px-4 py-3 min-w-[150px]">Product</th>
                                <th className="px-4 py-3 min-w-[140px]">Policy No.</th>
                                <th className="px-4 py-3 min-w-[120px]">End Dt.</th>
                                <th className="px-4 py-3 min-w-[120px]">FUP</th>
                                <th className="px-4 py-3 min-w-[140px]">Net Premium</th>
                                <th className="px-4 py-3 min-w-[150px]">RE</th>
                                <th className="px-4 py-3 min-w-[100px]">Pref.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-400/5">
                            {MOCK_RENEWALS.map((row, i) => (
                                <motion.tr 
                                    key={row.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-gold-400/5 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedPolicy(row)}
                                >
                                    <td className="sticky left-0 z-10 bg-card/95 px-4 py-4 border-r border-gold-400/10" onClick={(e) => e.stopPropagation()}>
                                        <Badge className={cn("text-[9px] uppercase font-bold", getCallStatusColor(row.callStatus))}>
                                            {row.callStatus}
                                        </Badge>
                                    </td>
                                    <td className="sticky left-[120px] z-10 bg-card/95 px-4 py-4 border-r border-gold-400/10" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-1.5">
                                            <Button variant="outline" size="sm" className="h-7 text-[10px] bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">
                                                Renew
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] border-gold-400/20 text-gold-400 hover:bg-gold-400/10"
                                                onClick={() => {
                                                    setSelectedPolicy(row)
                                                    setIsRemarksOpen(true)
                                                }}
                                            >
                                                Remarks
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground">{i + 1}</td>
                                    <td className="px-4 py-4 font-semibold text-white">{row.groupName}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            {row.customerNames.map(name => (
                                                <span key={name} className="text-xs block">{name}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs">{row.businessType}</td>
                                    <td className="px-4 py-4 font-bold text-white">{row.sumInsured}</td>
                                    <td className="px-4 py-4 text-xs">{row.insurer}</td>
                                    <td className="px-4 py-4">
                                        <p className="text-xs font-medium">{row.product}</p>
                                        <p className="text-[10px] text-muted-foreground">{row.subProduct}</p>
                                    </td>
                                    <td className="px-4 py-4 font-mono text-[11px]">{row.policyNo}</td>
                                    <td className="px-4 py-4 text-xs text-red-400/80">{row.endDate}</td>
                                    <td className="px-4 py-4 text-xs text-orange-400/80">{row.fup}</td>
                                    <td className="px-4 py-4">
                                        <div className="group/premium relative">
                                            <p className="font-bold text-green-400">₹{row.netPremium.toLocaleString()}</p>
                                            <div className="hidden group-hover/premium:block absolute bottom-full left-0 mb-2 p-2 bg-black border border-white/10 rounded shadow-2xl z-30 min-w-[120px]">
                                                <p className="text-[10px] text-muted-foreground">Gross: ₹{row.grossPremium.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground">Net: ₹{row.netPremium.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs">{row.re}</td>
                                    <td className="px-4 py-4">
                                        <Badge variant="outline" className="text-[9px] border-white/5">{row.renewalPref}</Badge>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                {/* Pagination */}
                <div className="p-4 border-t border-gold-400/10 flex items-center justify-between text-xs text-muted-foreground bg-card/50">
                    <div className="flex items-center gap-4">
                        <p>Showing 1 to 2 of 128 entries</p>
                        <Select defaultValue="10">
                            <SelectTrigger className="h-7 w-20 bg-transparent border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 border-gold-400/10">Prev</Button>
                        <Button variant="outline" size="sm" className="h-8 border-gold-400/20 text-gold-400">Next</Button>
                    </div>
                </div>
            </div>

            {/* Policy Detail Slide-over */}
            <Sheet open={!!selectedPolicy && !isRemarksOpen} onOpenChange={(open) => !open && setSelectedPolicy(null)}>
                <SheetContent className="w-[450px] sm:max-w-[500px] border-gold-400/10 bg-[#0F1117] text-white overflow-y-auto">
                    {selectedPolicy && (
                        <div className="space-y-8 py-6">
                            <SheetHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className={cn("uppercase font-bold", getCallStatusColor(selectedPolicy.callStatus))}>
                                        {selectedPolicy.callStatus}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">{selectedPolicy.policyNo}</span>
                                </div>
                                <SheetTitle className="text-2xl font-bold">{selectedPolicy.groupName}</SheetTitle>
                                <SheetDescription className="text-muted-foreground">
                                    Comprehensive policy and member details
                                </SheetDescription>
                            </SheetHeader>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Insurer</p>
                                    <p className="text-sm font-semibold">{selectedPolicy.insurer}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Product</p>
                                    <p className="text-sm font-semibold">{selectedPolicy.product}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Premium (Gross)</p>
                                    <p className="text-sm font-bold text-gold-400">₹{selectedPolicy.grossPremium.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">End Date</p>
                                    <p className="text-sm font-bold text-red-400">{selectedPolicy.endDate}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">Group Members</h4>
                                <div className="space-y-3">
                                    {selectedPolicy.customerNames.map((name: string) => (
                                        <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 text-xs font-bold">
                                                    {name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{name}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] opacity-70">Primary</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button className="bg-gold-gradient text-black font-bold h-12">
                                        <Phone className="w-4 h-4 mr-2" /> Call Now
                                    </Button>
                                    <Button variant="outline" className="border-white/10 h-12 hover:bg-white/5">
                                        <Mail className="w-4 h-4 mr-2" /> Email
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/5 pb-2">Location & Assignment</h4>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gold-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold">Address</p>
                                            <p className="text-xs leading-relaxed">{selectedPolicy.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <User className="w-4 h-4 text-blue-400 mt-1" />
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-bold">Relationship Executive</p>
                                            <p className="text-xs font-medium">{selectedPolicy.re}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Remarks Modal */}
            <Dialog open={isRemarksOpen} onOpenChange={setIsRemarksOpen}>
                <DialogContent className="bg-[#0F1117] border-gold-400/10 text-white max-w-md">
                    <DialogHeader>
                        <DialogTitle>Policy Remarks</DialogTitle>
                        <DialogDescription>Add a new internal note for this policy.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="max-h-[200px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gold-400">ADMIN</span>
                                    <span className="text-[10px] text-muted-foreground">May 01, 2026</span>
                                </div>
                                <p className="text-xs">Client interested in upgrade. Scheduled callback for May 5th.</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <p className="text-xs font-medium text-muted-foreground">New Remark</p>
                            <Input 
                                placeholder="Type your remark here..."
                                className="bg-background/50 border-gold-400/10 focus:border-gold-400/30"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setIsRemarksOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-gold-gradient text-black font-bold" onClick={() => setIsRemarksOpen(false)}>
                            <Save className="w-4 h-4 mr-2" /> Save Remark
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
