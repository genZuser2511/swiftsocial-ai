import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type FileType = 'pdf' | 'docx' | 'csv' | 'mp3' | 'link' | 'txt' | 'other';
export type DocStatus = 'processing' | 'indexed' | 'outdated';
export type DocType = 'document' | 'link';

export type KnowledgeDoc = {
    id: string;
    name: string;
    type: DocType;
    fileType: FileType;
    size?: string;
    url?: string;
    tags: string[];
    agentIds: string[];
    status: DocStatus;
    createdAt: string;
    order: number;
};

export type KnowledgeState = {
    documents: KnowledgeDoc[];
    addDocument: (doc: Omit<KnowledgeDoc, 'id' | 'createdAt' | 'order' | 'status'>) => string;
    deleteDocument: (id: string) => void;
    reindexDocument: (id: string) => void;
    setStatus: (id: string, status: DocStatus) => void;
    updateDocumentOrder: (documents: KnowledgeDoc[]) => void;
    assignToAgent: (docId: string, agentId: string) => void;
    unassignFromAgent: (docId: string, agentId: string) => void;
};

const mockDocs: KnowledgeDoc[] = [
    {
        id: 'mock-1',
        name: 'Company FAQ.pdf',
        type: 'document',
        fileType: 'pdf',
        size: '2.3 MB',
        tags: ['faq', 'onboarding'],
        agentIds: [],
        status: 'indexed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        order: 0,
    },
    {
        id: 'mock-2',
        name: 'Sales Script Q1 2026.docx',
        type: 'document',
        fileType: 'docx',
        size: '540 KB',
        tags: ['sales', 'scripts'],
        agentIds: [],
        status: 'indexed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        order: 1,
    },
    {
        id: 'mock-3',
        name: 'Alpha Insurance Website',
        type: 'link',
        fileType: 'link',
        url: 'https://alphainsurance.example.com',
        tags: ['insurance', 'website'],
        agentIds: [],
        status: 'indexed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        order: 2,
    },
    {
        id: 'mock-4',
        name: 'Call Recordings Archive.csv',
        type: 'document',
        fileType: 'csv',
        size: '1.1 MB',
        tags: ['analytics', 'calls'],
        agentIds: [],
        status: 'outdated',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        order: 3,
    },
];

export const useKnowledgeStore = create<KnowledgeState>()(
    persist(
        (set, get) => ({
            documents: mockDocs,

            addDocument: (doc) => {
                const id = uuidv4();
                const newDoc: KnowledgeDoc = {
                    ...doc,
                    id,
                    status: 'processing',
                    createdAt: new Date().toISOString(),
                    order: get().documents.length,
                };
                set((state) => ({ documents: [...state.documents, newDoc] }));
                return id;
            },

            deleteDocument: (id) => {
                set((state) => ({
                    documents: state.documents
                        .filter((d) => d.id !== id)
                        .map((d, i) => ({ ...d, order: i })),
                }));
            },

            reindexDocument: (id) => {
                set((state) => ({
                    documents: state.documents.map((d) =>
                        d.id === id ? { ...d, status: 'processing' } : d
                    ),
                }));
            },

            setStatus: (id, status) => {
                set((state) => ({
                    documents: state.documents.map((d) =>
                        d.id === id ? { ...d, status } : d
                    ),
                }));
            },

            updateDocumentOrder: (documents) => {
                set({ documents });
            },

            assignToAgent: (docId, agentId) => {
                set((state) => ({
                    documents: state.documents.map((d) =>
                        d.id === docId && !d.agentIds.includes(agentId)
                            ? { ...d, agentIds: [...d.agentIds, agentId] }
                            : d
                    ),
                }));
            },

            unassignFromAgent: (docId, agentId) => {
                set((state) => ({
                    documents: state.documents.map((d) =>
                        d.id === docId
                            ? { ...d, agentIds: d.agentIds.filter((id) => id !== agentId) }
                            : d
                    ),
                }));
            },
        }),
        {
            name: 'swiftsocial-knowledge-store',
        }
    )
);
