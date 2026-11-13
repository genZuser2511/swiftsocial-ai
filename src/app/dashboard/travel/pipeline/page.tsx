"use client"

export default function TravelPipeline() {
    return (
        <div className="p-8 space-y-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Travel Pipeline</h1>
            
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gold-400/20">
                {['New Inquiry', 'Destination Research', 'Quote Sent', 'Booking Confirmed', 'Travelled'].map(stage => (
                    <div key={stage} className="min-w-[300px] flex flex-col rounded-xl bg-card border border-gold-400/10 h-full">
                        <div className="p-4 border-b border-gold-400/10 bg-muted/30 font-medium">
                            {stage}
                        </div>
                        <div className="p-4 flex-1 space-y-4">
                            <div className="p-4 rounded-lg border border-gold-400/20 bg-background/50 hover:border-gold-400/50 cursor-grab transition-colors">
                                <p className="font-medium text-sm mb-1">Sample Trip to Paris</p>
                                <p className="text-xs text-muted-foreground">$4,500 • John Doe</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
