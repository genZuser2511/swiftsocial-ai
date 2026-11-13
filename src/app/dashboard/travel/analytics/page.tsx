"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { Plane, TrendingUp, DollarSign, Users } from "lucide-react"

const bookingTrends = [
  { name: 'Jan', bookings: 45, value: 120000 },
  { name: 'Feb', bookings: 52, value: 145000 },
  { name: 'Mar', bookings: 48, value: 132000 },
  { name: 'Apr', bookings: 70, value: 210000 },
  { name: 'May', bookings: 85, value: 260000 },
  { name: 'Jun', bookings: 110, value: 340000 },
]

const topDestinations = [
  { name: 'Bali, ID', trips: 142 },
  { name: 'Paris, FR', trips: 98 },
  { name: 'Tokyo, JP', trips: 85 },
  { name: 'Maldives', trips: 64 },
  { name: 'Dubai, UAE', trips: 55 },
]

const agentPerformance = [
  { name: 'Inbound Inquiry', calls: 450, conversion: 28 },
  { name: 'Quote Follow-up', calls: 320, conversion: 45 },
  { name: 'Booking Confirm', calls: 180, conversion: 85 },
  { name: 'Visa Follow-up', calls: 150, conversion: 60 },
]

const PIE_COLORS = ['#D4AF37', '#F3E5AB', '#997A00', '#FFDF00', '#B8860B'];

export default function TravelAnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
                    Travel Analytics
                </h1>
                <p className="text-gray-400">Monitor booking trends, top destinations, and AI Agent performance.</p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
                        <Plane className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">410</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +14.5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Revenue Volume</CardTitle>
                        <DollarSign className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$1,207,000</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +21.2% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Active Pipelines</CardTitle>
                        <Users className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1,245</div>
                        <p className="text-xs text-gray-500 mt-1">Across 4 active agents</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-gold-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Avg. Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gold-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">32.4%</div>
                        <p className="text-xs text-green-400 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" /> +4.1% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card border-gold-500/20">
                    <CardHeader>
                        <CardTitle className="text-gold-400">Revenue & Booking Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={bookingTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0F1117', border: '1px solid #D4AF37', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line yAxisId="left" type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37' }} activeDot={{ r: 6 }} name="Revenue ($)" />
                                    <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} name="Bookings" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-card border-gold-500/20">
                    <CardHeader>
                        <CardTitle className="text-gold-400">Top Destinations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topDestinations}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="trips"
                                    >
                                        {topDestinations.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0F1117', border: '1px solid #D4AF37', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {topDestinations.map((dest, i) => (
                                <div key={dest.name} className="flex items-center text-xs text-gray-300">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    {dest.name} ({dest.trips})
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Agent Performance */}
            <Card className="bg-card border-gold-500/20">
                <CardHeader>
                    <CardTitle className="text-gold-400">AI Agent Conversion Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={agentPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                                    contentStyle={{ backgroundColor: '#0F1117', border: '1px solid #D4AF37', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="conversion" name="Conversion Rate (%)" fill="#D4AF37" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
