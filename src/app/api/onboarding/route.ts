import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orgName, region } = body

        // Validate user session first
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Initialize admin client to bypass RLS for provisioning
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Generate IDs
        const orgId = randomUUID()
        const workspaceId = randomUUID()
        
        // Convert region to internal data_region
        const dataRegion = region === "UK" ? "eu" : region === "US" ? "us" : "in" // Default to IN

        // 1. Insert Organization
        const { error: orgError } = await adminClient
            .from('organizations')
            .insert({
                id: orgId,
                name: orgName || "My Organization",
                slug: orgId.substring(0, 8),
                isolation_level: 'shared',
                data_region: dataRegion,
                is_active: true
            })
            
        if (orgError) throw orgError

        // 2. Insert Workspace
        const { error: wsError } = await adminClient
            .from('workspaces')
            .insert({
                id: workspaceId,
                org_id: orgId,
                name: "Main Workspace",
                is_active: true
            })
            
        if (wsError) throw wsError

        // 3. Assign Org Admin Role
        const { error: roleError } = await adminClient
            .from('user_workspace_roles')
            .insert({
                user_id: user.id,
                org_id: orgId,
                workspace_id: workspaceId,
                role: 'org_admin',
                is_active: true
            })
            
        if (roleError) throw roleError

        // 4. Update Profile
        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                org_id: orgId,
                default_workspace_id: workspaceId,
                onboarding_completed: true
            })
            .eq('id', user.id)
            
        if (profileError) throw profileError

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Onboarding error:", error)
        return NextResponse.json({ error: error.message || "Failed to complete onboarding" }, { status: 500 })
    }
}
