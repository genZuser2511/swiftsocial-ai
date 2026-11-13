"use client"
import { useState, useEffect } from "react"
import { GlassCard, GradientCard } from "@/components/shared/GradientCard"
import { Button } from "@/components/ui/button"
import { Building2, Users, Plus, Mail, Shield, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer } from "@/lib/animations"

export default function WorkspaceSettingsPage() {
    const [organization, setOrganization] = useState<any>(null)
    const [workspaces, setWorkspaces] = useState<any[]>([])
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchWorkspaceData() {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return
                
                // Get Org
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('*')
                    .single()
                setOrganization(orgData)

                // Get Workspaces
                const { data: wsData } = await supabase
                    .from('workspaces')
                    .select('*')
                    .order('created_at', { ascending: true })
                if (wsData) setWorkspaces(wsData)

                // Get Team Members (Mocked for now since user_workspace_roles requires join)
                const { data: rolesData } = await supabase
                    .from('user_workspace_roles')
                    .select('*, profiles(full_name, email)')
                
                if (rolesData) {
                    const formattedMembers = rolesData.map((role: any) => ({
                        id: role.user_id,
                        name: role.profiles?.full_name || 'Unknown User',
                        email: role.profiles?.email || 'No email',
                        role: role.role,
                        workspace_id: role.workspace_id
                    }))
                    setTeamMembers(formattedMembers)
                }

            } catch (error) {
                console.error("Error fetching workspace data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchWorkspaceData()
    }, [])

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault()
        toast.success("Invitation sent successfully!")
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading workspace data...</div>
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-gold-400" />
                    Workspace & Organization
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your organization details, switch workspaces, and invite team members.
                </p>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Org & Workspaces */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div variants={fadeInUp}>
                        <GradientCard>
                            <h2 className="text-lg font-semibold mb-4">Organization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Name</label>
                                    <p className="font-medium text-lg">{organization?.name || "Acme Corp"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Data Region</label>
                                    <p className="font-medium uppercase">{organization?.data_region || "IN"}</p>
                                </div>
                                <Button variant="outline" className="w-full mt-2">Edit Organization</Button>
                            </div>
                        </GradientCard>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <GlassCard>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Workspaces</h2>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gold-400 rounded-full hover:bg-gold-400/10">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {workspaces.length > 0 ? workspaces.map((ws, i) => (
                                    <div key={ws.id} className={`p-3 rounded-lg border ${i === 0 ? 'border-gold-400/50 bg-gold-400/5' : 'border-border/50 bg-muted/20'} flex items-center justify-between`}>
                                        <div>
                                            <p className="font-medium">{ws.name}</p>
                                            <p className="text-xs text-muted-foreground">ID: {ws.id.split('-')[0]}</p>
                                        </div>
                                        {i === 0 && <CheckCircle2 className="w-5 h-5 text-gold-400" />}
                                    </div>
                                )) : (
                                    <div className="p-3 rounded-lg border border-gold-400/50 bg-gold-400/5 flex items-center justify-between">
                                        <p className="font-medium">Default Workspace</p>
                                        <CheckCircle2 className="w-5 h-5 text-gold-400" />
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Right Column - Team Members */}
                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    <GlassCard>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gold-400" />
                                    Team Members
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Manage access to your workspaces</p>
                            </div>
                        </div>

                        {/* Invite Form */}
                        <form onSubmit={handleInvite} className="flex gap-3 mb-8 p-4 rounded-xl bg-muted/20 border border-border/50">
                            <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="email" 
                                    placeholder="Enter email address..." 
                                    className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 text-sm"
                                    required
                                />
                            </div>
                            <select className="bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold-400">
                                <option value="agent">Agent</option>
                                <option value="manager">Manager</option>
                                <option value="workspace_admin">Workspace Admin</option>
                            </select>
                            <Button type="submit" className="bg-gold-gradient text-black">Invite</Button>
                        </form>

                        {/* Member List */}
                        <div className="space-y-4">
                            {teamMembers.length > 0 ? teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center">
                                            <span className="text-gold-400 font-bold">{member.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium capitalize">
                                            {member.role.replace('_', ' ')}
                                        </span>
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">Remove</Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No team members found.</p>
                                    <p className="text-sm mt-1">Invite your first team member above.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </div>
    )
}
