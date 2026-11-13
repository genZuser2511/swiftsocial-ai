"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Database,
    File,
    FileText,
    FileSpreadsheet,
    Globe,
    GripVertical,
    Link as LinkIcon,
    Mic,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Sheet,
    Trash2,
    Upload,
    X,
    ChevronRight,
    Bot,
    Tag,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { GradientCard, GlassCard } from "@/components/shared/GradientCard"
import { fadeInUp, staggerContainer } from "@/lib/animations"
import { useKnowledgeStore, KnowledgeDoc, FileType, DocStatus } from "@/store/useKnowledgeStore"
import { useAgentStore } from "@/store/useAgentStore"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ─── File type helpers ────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG: Record<FileType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    pdf:   { icon: FileText, color: "text-red-400",    bg: "bg-red-500/10",    label: "PDF" },
    docx:  { icon: File,     color: "text-blue-400",   bg: "bg-blue-500/10",   label: "DOCX" },
    csv:   { icon: FileSpreadsheet, color: "text-green-400", bg: "bg-green-500/10", label: "CSV" },
    mp3:   { icon: Mic,      color: "text-purple-400", bg: "bg-purple-500/10", label: "MP3" },
    link:  { icon: Globe,    color: "text-sky-400",    bg: "bg-sky-500/10",    label: "URL" },
    txt:   { icon: FileText, color: "text-muted-foreground", bg: "bg-muted/50", label: "TXT" },
    other: { icon: File,     color: "text-gold-400",   bg: "bg-gold-400/10",   label: "File" },
}

const STATUS_CONFIG: Record<DocStatus, { label: string; className: string; icon: React.ElementType; animate?: boolean }> = {
    processing: { label: "Processing", className: "bg-yellow-500/10 text-yellow-400", icon: Loader2, animate: true },
    indexed:    { label: "Indexed",    className: "bg-green-500/10 text-green-400",   icon: CheckCircle2 },
    outdated:   { label: "Outdated",   className: "bg-orange-500/10 text-orange-400", icon: AlertCircle },
}

function getFileTypeFromName(name: string): FileType {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf')  return 'pdf'
    if (ext === 'docx' || ext === 'doc') return 'docx'
    if (ext === 'csv')  return 'csv'
    if (ext === 'mp3' || ext === 'wav') return 'mp3'
    if (ext === 'txt')  return 'txt'
    return 'other'
}

function highlightText(text: string, query: string) {
    if (!query.trim()) return <span>{text}</span>
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part)
                    ? <mark key={i} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5">{part}</mark>
                    : <span key={i}>{part}</span>
            )}
        </span>
    )
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

function SortableDocRow({
    doc,
    search,
    onDelete,
    onReindex,
    onPreview,
}: {
    doc: KnowledgeDoc
    search: string
    onDelete: (id: string) => void
    onReindex: (id: string) => void
    onPreview: (doc: KnowledgeDoc) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: doc.id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
    }

    const ftConfig = FILE_TYPE_CONFIG[doc.fileType]
    const stConfig = STATUS_CONFIG[doc.status]
    const StatusIcon = stConfig.icon

    return (
        <motion.div ref={setNodeRef} style={style} variants={fadeInUp}>
            <GlassCard className="hover:bg-muted/30 transition-colors cursor-default p-3 sm:p-4">
                <div className="flex items-center gap-3">
                    {/* Drag handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none shrink-0"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ftConfig.bg}`}>
                        <ftConfig.icon className={`w-5 h-5 ${ftConfig.color}`} />
                    </div>

                    {/* Name & meta */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPreview(doc)}>
                        <p className="font-medium truncate">{highlightText(doc.name, search)}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                                {doc.type === 'link' ? doc.url : doc.size} • {formatDate(doc.createdAt)}
                            </span>
                            {doc.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gold-400/10 text-gold-400 font-medium">
                                    #{tag}
                                </span>
                            ))}
                            {doc.tags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 2}</span>
                            )}
                        </div>
                    </div>

                    {/* Status badge */}
                    <span className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium shrink-0 ${stConfig.className}`}>
                        <StatusIcon className={`w-3 h-3 ${stConfig.animate ? 'animate-spin' : ''}`} />
                        {stConfig.label}
                    </span>

                    {/* Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onPreview(doc)}>
                                <ChevronRight className="mr-2 w-4 h-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onReindex(doc.id)}>
                                <RefreshCw className="mr-2 w-4 h-4" />
                                Re-index
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-400 focus:text-red-400"
                                onClick={() => onDelete(doc.id)}
                            >
                                <Trash2 className="mr-2 w-4 h-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </GlassCard>
        </motion.div>
    )
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({
    open,
    onClose,
    agents,
}: {
    open: boolean
    onClose: () => void
    agents: { id: string; name: string }[]
}) {
    const addDocument = useKnowledgeStore((s) => s.addDocument)
    const setStatus   = useKnowledgeStore((s) => s.setStatus)

    const [tab, setTab]             = useState<'file' | 'url'>('file')
    const [fileName, setFileName]   = useState('')
    const [fileSize, setFileSize]   = useState('')
    const [fileType, setFileType]   = useState<FileType>('pdf')
    const [url, setUrl]             = useState('')
    const [urlName, setUrlName]     = useState('')
    const [tagInput, setTagInput]   = useState('')
    const [tags, setTags]           = useState<string[]>([])
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setFileName(''); setFileSize(''); setFileType('pdf'); setUrl(''); setUrlName('')
        setTagInput(''); setTags([]); setSelectedAgents([])
    }

    const handleClose = () => { reset(); onClose() }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setFileName(file.name)
        setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`)
        setFileType(getFileTypeFromName(file.name))
    }

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
            e.preventDefault()
            const clean = tagInput.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
            if (clean && !tags.includes(clean)) setTags([...tags, clean])
            setTagInput('')
        }
    }

    const removeTag = (t: string) => setTags(tags.filter(x => x !== t))

    const toggleAgent = (id: string) => {
        setSelectedAgents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleSubmit = () => {
        if (tab === 'file' && !fileName.trim()) return
        if (tab === 'url' && (!url.trim() || !urlName.trim())) return

        const id = tab === 'file'
            ? addDocument({ name: fileName, type: 'document', fileType, size: fileSize || '—', tags, agentIds: selectedAgents })
            : addDocument({ name: urlName, type: 'link', fileType: 'link', url, tags, agentIds: selectedAgents })

        handleClose()

        // Simulate indexing after 1.5s
        setTimeout(() => setStatus(id, 'indexed'), 1500)
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload Content</DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    {(['file', 'url'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                tab === t ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t === 'file' ? '📄 Upload File' : '🔗 Add URL'}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 py-2">
                    {tab === 'file' ? (
                        <>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gold-400/20 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-gold-400/50 hover:bg-gold-400/5 transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-gold-400" />
                                </div>
                                <div className="text-center">
                                    {fileName ? (
                                        <p className="font-medium text-sm">{fileName}</p>
                                    ) : (
                                        <>
                                            <p className="font-medium text-sm">Drop files or click to browse</p>
                                            <p className="text-xs text-muted-foreground">PDF, DOCX, CSV, MP3, TXT</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx,.doc,.csv,.mp3,.wav,.txt"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                                <Input
                                    placeholder="e.g. Alpha Insurance Website"
                                    value={urlName}
                                    onChange={(e) => setUrlName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">URL</label>
                                <Input
                                    placeholder="https://..."
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Tags (press Enter to add)</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {tags.map(t => (
                                <span
                                    key={t}
                                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gold-400/10 text-gold-400"
                                >
                                    #{t}
                                    <button onClick={() => removeTag(t)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <Input
                            placeholder="Add tag…"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={addTag}
                        />
                    </div>

                    {/* Assign to Agents */}
                    {agents.length > 0 && (
                        <div>
                            <label className="text-xs text-muted-foreground mb-2 block">Assign to Agents</label>
                            <div className="flex flex-wrap gap-2">
                                {agents.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => toggleAgent(a.id)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                            selectedAgents.includes(a.id)
                                                ? 'bg-gold-400/20 border-gold-400 text-gold-400'
                                                : 'border-border text-muted-foreground hover:border-gold-400/50'
                                        }`}
                                    >
                                        <Bot className="w-3 h-3" />
                                        {a.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                    <Button
                        className="flex-1 bg-gold-gradient text-black font-semibold"
                        onClick={handleSubmit}
                        disabled={tab === 'file' ? !fileName : !url || !urlName}
                    >
                        {tab === 'file' ? 'Upload' : 'Add URL'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Preview Drawer ───────────────────────────────────────────────────────────

function PreviewDrawer({
    doc,
    agents,
    onClose,
}: {
    doc: KnowledgeDoc | null
    agents: { id: string; name: string }[]
    onClose: () => void
}) {
    if (!doc) return null

    const ftConfig = FILE_TYPE_CONFIG[doc.fileType]
    const stConfig = STATUS_CONFIG[doc.status]
    const StatusIcon = stConfig.icon
    const assignedAgents = agents.filter(a => doc.agentIds.includes(a.id))

    return (
        <AnimatePresence>
            {doc && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 flex flex-col"
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ftConfig.bg}`}>
                                    <ftConfig.icon className={`w-5 h-5 ${ftConfig.color}`} />
                                </div>
                                <div>
                                    <p className="font-semibold leading-tight">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">{ftConfig.label}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Drawer body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Status</p>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${stConfig.className}`}>
                                    <StatusIcon className={`w-3.5 h-3.5 ${stConfig.animate ? 'animate-spin' : ''}`} />
                                    {stConfig.label}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Details</p>
                                <div className="space-y-2">
                                    {doc.size && (
                                        <div className="flex justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                                            <span className="text-muted-foreground">Size</span>
                                            <span className="font-medium">{doc.size}</span>
                                        </div>
                                    )}
                                    {doc.url && (
                                        <div className="flex justify-between p-2.5 rounded-lg bg-muted/30 text-sm gap-4">
                                            <span className="text-muted-foreground shrink-0">URL</span>
                                            <a href={doc.url} target="_blank" rel="noopener" className="font-medium text-blue-400 truncate hover:underline">
                                                {doc.url}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex justify-between p-2.5 rounded-lg bg-muted/30 text-sm">
                                        <span className="text-muted-foreground">Added</span>
                                        <span className="font-medium">{formatDate(doc.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Tags</p>
                                {doc.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {doc.tags.map(t => (
                                            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gold-400/10 text-gold-400">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No tags</p>
                                )}
                            </div>

                            {/* Assigned agents */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Assigned Agents</p>
                                {assignedAgents.length > 0 ? (
                                    <div className="space-y-2">
                                        {assignedAgents.map(a => (
                                            <div key={a.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
                                                <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-black" />
                                                </div>
                                                <span className="text-sm font-medium">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Not assigned to any agent</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgePage() {
    const [isMounted, setIsMounted] = useState(false)
    const [search, setSearch]       = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null)

    const { documents, deleteDocument, reindexDocument, setStatus, updateDocumentOrder } = useKnowledgeStore()
    const agents = useAgentStore((s) => s.agents)

    useEffect(() => { setIsMounted(true) }, [])

    // Simulate re-index: processing → indexed after 1.5s
    const handleReindex = useCallback((id: string) => {
        reindexDocument(id)
        setTimeout(() => setStatus(id, 'indexed'), 1500)
    }, [reindexDocument, setStatus])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = documents.findIndex(d => d.id === active.id)
        const newIndex = documents.findIndex(d => d.id === over.id)
        const reordered = arrayMove(documents, oldIndex, newIndex).map((d, i) => ({ ...d, order: i }))
        updateDocumentOrder(reordered)
    }

    if (!isMounted) return null

    // Stats
    const docCount  = documents.filter(d => d.type === 'document').length
    const urlCount  = documents.filter(d => d.type === 'link').length
    const totalSize = documents
        .filter(d => d.size)
        .reduce((acc, d) => {
            const match = d.size!.match(/[\d.]+/)
            return acc + (match ? parseFloat(match[0]) : 0)
        }, 0)

    // All unique tags
    const allTags = [...new Set(documents.flatMap(d => d.tags))].slice(0, 10)

    // Filter
    const filteredDocs = [...documents]
        .sort((a, b) => a.order - b.order)
        .filter(d => {
            const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase())
            const matchTag    = !activeTag || d.tags.includes(activeTag)
            return matchSearch && matchTag
        })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Knowledge Base</h1>
                    <p className="text-muted-foreground">Train your AI agents with your content</p>
                </div>
                <Button className="bg-gold-gradient text-black font-semibold w-fit" onClick={() => setUploadOpen(true)}>
                    <Upload className="mr-2 w-4 h-4" />
                    Upload Content
                </Button>
            </div>

            {/* Stats */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div variants={fadeInUp}>
                    <GlassCard>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gold-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{docCount}</div>
                                <div className="text-sm text-muted-foreground">Documents</div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <GlassCard>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Database className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
                                <div className="text-sm text-muted-foreground">Total Size</div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <GlassCard>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{urlCount}</div>
                                <div className="text-sm text-muted-foreground">Connected URLs</div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Search + Tag Filters */}
            <GlassCard className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-muted/50"
                    />
                </div>
                {allTags.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <button
                            onClick={() => setActiveTag(null)}
                            className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all ${
                                !activeTag ? 'bg-gold-400/20 border-gold-400 text-gold-400' : 'border-border text-muted-foreground hover:border-gold-400/50'
                            }`}
                        >
                            All
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all ${
                                    activeTag === tag ? 'bg-gold-400/20 border-gold-400 text-gold-400' : 'border-border text-muted-foreground hover:border-gold-400/50'
                                }`}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Document list w/ DnD */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredDocs.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                        {filteredDocs.length > 0 ? (
                            filteredDocs.map((doc) => (
                                <SortableDocRow
                                    key={doc.id}
                                    doc={doc}
                                    search={search}
                                    onDelete={deleteDocument}
                                    onReindex={handleReindex}
                                    onPreview={setPreviewDoc}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="font-medium">No documents found</p>
                                <p className="text-sm mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Upload card (always visible) */}
                        <motion.div variants={fadeInUp}>
                            <GlassCard
                                className="border-dashed border-2 border-gold-400/20 hover:border-gold-400/50 cursor-pointer transition-all hover:bg-gold-400/5"
                                onClick={() => setUploadOpen(true)}
                            >
                                <div className="flex flex-col items-center justify-center py-8 gap-3">
                                    <div className="w-14 h-14 rounded-full bg-gold-400/10 flex items-center justify-center">
                                        <Plus className="w-7 h-7 text-gold-400" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold mb-1">Add Content</h3>
                                        <p className="text-sm text-muted-foreground">Upload documents, add URLs, or connect integrations</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                </SortableContext>
            </DndContext>

            {/* Upload Modal */}
            <UploadModal
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                agents={agents.map(a => ({ id: a.id, name: a.name }))}
            />

            {/* Preview Drawer */}
            <PreviewDrawer
                doc={previewDoc}
                agents={agents.map(a => ({ id: a.id, name: a.name }))}
                onClose={() => setPreviewDoc(null)}
            />
        </div>
    )
}
