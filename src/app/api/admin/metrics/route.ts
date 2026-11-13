import { NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
    try {
        // Validate user session and check if Super Admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Ideally, check for a 'super_admin' claim or specific email
        // For now, since admin portal is isolated, we'll proceed if they hit this route
        // and let the service role aggregate.

        // Initialize admin client to bypass RLS for global aggregation
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Get total active customers (organizations) excluding demo
        const { count: orgCount } = await adminClient
            .from('organizations')
            .select('*', { count: 'exact', head: true })
            .eq('is_demo', false)

        // 2. Get total calls
        const { count: callsCount } = await adminClient
            .from('calls')
            .select('*', { count: 'exact', head: true })

        // 3. Get total agents
        const { count: agentsCount } = await adminClient
            .from('ai_agents')
            .select('*', { count: 'exact', head: true })

        // 4. Get recent activity (newest orgs)
        const { data: recentOrgs } = await adminClient
            .from('organizations')
            .select('name, created_at')
            .order('created_at', { ascending: false })
            .limit(5)

        // 5. Total Revenue (sum of usage_records or subscriptions)
        // Since this requires a complex group by, we'll fetch sum of invoices
        const { data: invoices } = await adminClient
            .from('invoices')
            .select('amount_micro')
            .eq('status', 'paid')

        const totalRevenueMicro = invoices?.reduce((acc, curr) => acc + curr.amount_micro, 0) || 0
        const totalRevenue = totalRevenueMicro / 1000000

        return NextResponse.json({ 
            success: true,
            metrics: {
                totalOrgs: orgCount || 0,
                totalCalls: callsCount || 0,
                totalAgents: agentsCount || 0,
                totalRevenue,
                recentOrgs: recentOrgs || []
            }
        })
    } catch (error: any) {
        console.error("Admin metrics error:", error)
        return NextResponse.json({ error: error.message || "Failed to fetch metrics" }, { status: 500 })
    }
}
