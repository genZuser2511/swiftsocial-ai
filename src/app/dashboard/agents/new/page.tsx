"use client"

import { Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AgentForm } from "@/components/agents/AgentForm"

export default function NewAgentPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/agents">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Create AI Agent</h1>
                    <p className="text-muted-foreground">Set up a new voice agent in minutes</p>
                </div>
            </div>

            <AgentForm mode="create" />
        </div>
    )
}
