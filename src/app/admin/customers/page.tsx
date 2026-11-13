"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowUpDown,
    Building2,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Filter,
    MoreHorizontal,
    Phone,
    Search,
    Trash2,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"

// Mock customer data
const customers = [
    {
        id: "1",
        name: "TechSupport India",
        email: "admin@techsupport.in",
        plan: "Autonomous",
        status: "active",
        mrr: "₹75,000",
        calls: "125,000",
        agents: 12,
        joinDate: "2024-01-15",
    },
    {
        id: "2",
        name: "SalesForce Pro",
        email: "contact@salesforcepro.com",
        plan: "Autonomous",
        status: "active",
        mrr: "₹60,000",
        calls: "98,000",
        agents: 8,
        joinDate: "2024-01-20",
    },
    {
        id: "3",
        name: "E-Commerce Plus",
        email: "team@ecommerceplus.in",
        plan: "Hybrid",
        status: "active",
        mrr: "₹45,000",
        calls: "67,000",
        agents: 6,
        joinDate: "2024-02-01",
    },
    {
        id: "4",
        name: "InsureTech",
        email: "support@insuretech.co",
        plan: "Hybrid",
        status: "active",
        mrr: "₹38,000",
        calls: "52,000",
        agents: 5,
        joinDate: "2024-02-05",
    },
    {
        id: "5",
        name: "HealthCall Pro",
        email: "admin@healthcall.in",
        plan: "Co-Pilot",
        status: "trial",
        mrr: "₹0",
        calls: "2,500",
        agents: 2,
        joinDate: "2024-02-10",
    },
    {
        id: "6",
        name: "SmallBiz Co",
        email: "hello@smallbiz.com",
        plan: "Co-Pilot",
        status: "churned",
        mrr: "₹0",
        calls: "15,000",
        agents: 1,
        joinDate: "2024-01-25",
    },
]

export default function CustomersPage() {
    const [search, setSearch] = useState("")
    const [filter, setFilter] = useState<"all" | "active" | "trial" | "churned">("all")

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch =
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.email.toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === "all" || customer.status === filter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage all customer accounts
                    </p>
                </div>
                <Button variant="outline" className="border-red-500/20 w-fit">
                    <Download className="mr-2 w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold">524</div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-green-400">489</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-blue-400">23</div>
                    <div className="text-sm text-muted-foreground">On Trial</div>
                </GlassCard>
                <GlassCard className="border-red-500/10">
                    <div className="text-2xl font-bold text-red-400">12</div>
                    <div className="text-sm text-muted-foreground">Churned (30d)</div>
                </GlassCard>
            </div>

            {/* Filters */}
            <GlassCard className="border-red-500/10">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-muted/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", "active", "trial", "churned"].map((status) => (
                            <Button
                                key={status}
                                variant={filter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(status as typeof filter)}
                                className={
                                    filter === status
                                        ? "bg-gradient-to-r from-red-500 to-red-700 text-white"
                                        : "border-red-500/20"
                                }
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            </GlassCard>

            {/* Customers Table */}
            <GradientCard className="border-red-500/10 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-red-500/10">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">MRR</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Calls</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agents</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="border-b border-red-500/5 hover:bg-muted/20">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{customer.name}</p>
                                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${customer.plan === "Autonomous"
                                                ? "bg-purple-500/10 text-purple-400"
                                                : customer.plan === "Hybrid"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-gold-400/10 text-gold-400"
                                            }`}
                                    >
                                        {customer.plan}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === "active"
                                                ? "bg-green-500/10 text-green-400"
                                                : customer.status === "trial"
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {customer.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4 font-medium">{customer.mrr}</td>
                                <td className="py-4 px-4">{customer.calls}</td>
                                <td className="py-4 px-4">{customer.agents}</td>
                                <td className="py-4 px-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 w-4 h-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Phone className="mr-2 w-4 h-4" />
                                                View Calls
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400">
                                                <Trash2 className="mr-2 w-4 h-4" />
                                                Suspend Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GradientCard>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                    Showing {filteredCustomers.length} of {customers.length} customers
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="border-red-500/20">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="border-red-500/20">
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
