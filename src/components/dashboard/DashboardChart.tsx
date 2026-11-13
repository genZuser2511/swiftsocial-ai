"use client"

import { Card } from "@/components/ui/card"
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts'

const data = [
    { name: 'Mon', calls: 400 },
    { name: 'Tue', calls: 300 },
    { name: 'Wed', calls: 500 },
    { name: 'Thu', calls: 280 },
    { name: 'Fri', calls: 590 },
    { name: 'Sat', calls: 320 },
    { name: 'Sun', calls: 450 },
];

export function DashboardChart({ hasData = true }: { hasData?: boolean }) {
    const displayData = hasData ? data : data.map(d => ({ ...d, calls: 0 }));
    return (
        <Card className="p-6 bg-black/40 border-gold-400/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Call Volume</h3>
                    <p className="text-sm text-muted-foreground">Weekly activity overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gold-400" />
                        <span className="text-xs text-muted-foreground">Calls</span>
                    </div>
                </div>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            stroke="#ffffff40" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <YAxis 
                            stroke="#ffffff40" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#111', 
                                border: '1px solid rgba(234, 179, 8, 0.2)',
                                borderRadius: '8px'
                            }}
                            itemStyle={{ color: '#EAB308' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="calls" 
                            stroke="#EAB308" 
                            fillOpacity={1} 
                            fill="url(#colorCalls)" 
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
