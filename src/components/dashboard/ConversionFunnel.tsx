"use client"

import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    LabelList
} from "recharts"
import { useAgentStore } from "@/store/useAgentStore"
import { useEffect, useState } from "react"

export function ConversionFunnel() {
    const { contacts, fetchContacts } = useAgentStore()
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        if (contacts.length === 0) fetchContacts()
    }, [contacts.length, fetchContacts])

    useEffect(() => {
        const statuses = ['Cold', 'Warm', 'Hot', 'Qualified']
        const counts = statuses.map(status => ({
            name: status,
            value: contacts.filter(l => l.status === status).length
        }))
        setData(counts)
    }, [contacts])

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                        contentStyle={{ 
                            backgroundColor: '#0c0c0c', 
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={
                                    index === 3 ? '#d4af37' : 
                                    index === 2 ? 'rgba(212, 175, 55, 0.7)' :
                                    index === 1 ? 'rgba(212, 175, 55, 0.4)' :
                                    'rgba(212, 175, 55, 0.1)'
                                } 
                            />
                        ))}
                        <LabelList dataKey="value" position="right" fill="#fff" fontSize={10} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
