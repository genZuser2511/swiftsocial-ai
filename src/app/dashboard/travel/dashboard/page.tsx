import { Plane, AlertCircle } from "lucide-react"

export default function TravelDashboard() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Travel Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-card border border-gold-400/10 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="text-sm font-medium">Total Bookings</span>
                        <Plane className="w-4 h-4 text-gold-400" />
                    </div>
                    <p className="text-2xl font-bold">124</p>
                </div>
                <div className="p-6 rounded-xl bg-card border border-gold-400/10 space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <Plane className="w-4 h-4 text-gold-400" />
                    </div>
                    <p className="text-2xl font-bold">24.5%</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-gold-400/10 min-h-[300px]">
                    <h3 className="font-semibold mb-4">Pipeline by Stage</h3>
                    <div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed border-gold-400/20 rounded-lg">
                        Funnel Chart Visualization
                    </div>
                </div>
                <div className="p-6 rounded-xl bg-card border border-gold-400/10">
                    <h3 className="font-semibold mb-4 text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Action Required
                    </h3>
                    <ul className="space-y-4">
                        <li className="text-sm border-l-2 border-red-400 pl-3">
                            <p className="font-medium">Passport Expiring soon</p>
                            <p className="text-muted-foreground">John Doe (In 2 months)</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
