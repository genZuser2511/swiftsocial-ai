"use client"

import { useEffect, useState } from "react"
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Send, 
    Phone, 
    Mail, 
    MessageSquare,
    User,
    ChevronRight,
    Paperclip,
    Smile,
    Info,
    CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAgentStore } from "@/store/useAgentStore"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function InboxPage() {
    const { contacts, messages, fetchContacts, fetchMessages, addMessage } = useAgentStore()
    const [selectedContactId, setSelectedLeadId] = useState<string | null>(null)
    const [messageInput, setMessageInput] = useState("")
    const [messageType, setMessageType] = useState<'sms' | 'email'>('sms')
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchContacts()
        fetchMessages()
    }, [fetchContacts, fetchMessages])

    const selectedContact = contacts.find(l => l.id === selectedContactId)
    const conversationMessages = messages
        .filter(m => m.contactId === selectedContactId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Group leads by latest message
    const conversations = contacts.map(contact => {
        const leadMessages = messages.filter(m => m.contactId === contact.id)
        const lastMessage = leadMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        return {
            ...contact,
            lastMessage: lastMessage ? lastMessage.content : "No messages yet",
            lastMessageTime: lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""
        }
    }).filter(c => c.fullName.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedContactId) return

        await addMessage({
            contactId: selectedContactId,
            content: messageInput,
            type: messageType,
            direction: 'outbound',
            status: 'sent'
        })
        setMessageInput("")
    }

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-card/20 rounded-2xl border border-gold-400/10 backdrop-blur-sm m-6">
            {/* Conversations List */}
            <div className="w-full md:w-80 border-r border-gold-400/10 flex flex-col bg-card/40">
                <div className="p-4 border-b border-gold-400/10">
                    <h2 className="text-xl font-bold text-white mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search conversations..." 
                            className="pl-10 bg-background/50 border-gold-400/10 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.map((conv) => (
                        <div 
                            key={conv.id}
                            onClick={() => setSelectedLeadId(conv.id)}
                            className={cn(
                                "p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gold-400/5",
                                selectedContactId === conv.id ? "bg-gold-400/10 border-l-2 border-gold-400" : "border-l-2 border-transparent"
                            )}
                        >
                            <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold shrink-0">
                                {conv.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-semibold text-white truncate">{conv.fullName}</h4>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{conv.lastMessageTime}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-card/20 relative">
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gold-400/10 flex items-center justify-between bg-card/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold">
                                    {selectedContact.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{selectedContact.fullName}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="hover:text-gold-400">
                                    <Phone className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:text-gold-400">
                                    <Mail className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="hover:text-gold-400">
                                    <Info className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {conversationMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
                                    <p>Start a new conversation with {selectedContact.fullName}</p>
                                </div>
                            ) : (
                                conversationMessages.map((msg) => (
                                    <div 
                                        key={msg.id}
                                        className={cn(
                                            "flex flex-col max-w-[80%]",
                                            msg.direction === 'outbound' ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm",
                                            msg.direction === 'outbound' 
                                                ? "bg-gold-gradient text-black font-medium rounded-tr-none shadow-lg shadow-gold-400/10" 
                                                : "bg-muted text-white rounded-tl-none"
                                        )}>
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 px-1">
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.direction === 'outbound' && <CheckCheck className="w-3 h-3 text-gold-400" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Composer */}
                        <div className="p-4 bg-card/40 border-t border-gold-400/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Badge 
                                    onClick={() => setMessageType('sms')}
                                    className={cn(
                                        "cursor-pointer",
                                        messageType === 'sms' ? "bg-gold-gradient text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    SMS
                                </Badge>
                                <Badge 
                                    onClick={() => setMessageType('email')}
                                    className={cn(
                                        "cursor-pointer",
                                        messageType === 'email' ? "bg-gold-gradient text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                >
                                    Email
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 border border-gold-400/10 rounded-xl p-1.5 pl-4 focus-within:border-gold-400/50 transition-all">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400 h-8 w-8">
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <input 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-muted-foreground"
                                    placeholder={`Type your ${messageType} message...`}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold-400 h-8 w-8">
                                    <Smile className="w-4 h-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    className="bg-gold-gradient text-black h-8 w-8 rounded-lg hover:opacity-90"
                                    onClick={handleSendMessage}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gold-400/5 flex items-center justify-center mb-6">
                            <Mail className="w-10 h-10 text-gold-400/20" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
                        <p className="max-w-xs mx-auto">Choose a contact from the list on the left to start messaging them via SMS or Email.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
