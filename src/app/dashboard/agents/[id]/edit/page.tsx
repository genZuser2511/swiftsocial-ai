"use client"

import { useParams } from "next/navigation"
import { Bot, ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AgentForm } from "@/components/agents/AgentForm"
import { useAgentStore } from "@/store/useAgentStore"
import { useState, useEffect } from "react"
import { useAgentDeployStatus } from "@/hooks/useAgentDeployStatus"

export default function EditAgentPage() {
    const params = useParams()
    const id = params.id as string
    const [isMounted, setIsMounted] = useState(false)
    const agent = useAgentStore((state) => state.agents.find((a) => a.id === id))

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const { isLive, text: deployText } = useAgentDeployStatus(agent?.createdAt || new Date().toISOString(), agent?.name || "")

    if (!isMounted) return null

    if (!agent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Agent Not Found</h2>
                    <p className="text-muted-foreground">The agent you are looking for does not exist or has been deleted.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/agents">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Agents
                    </Link>
                </Button>
            </div>
        )
    }

    if (!isLive) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Editing Locked</h2>
                    <p className="text-muted-foreground">This agent is currently deploying. You can edit it when it goes live in {deployText}.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/dashboard/agents/${agent.id}`}>
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Back to Agent Details
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/agents/${id}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Edit Agent: {agent.name}</h1>
                    <p className="text-muted-foreground">Update your agent&apos;s configuration and personality</p>
                </div>
            </div>

            <AgentForm mode="edit" initialData={agent} />
        </div>
    )
}
