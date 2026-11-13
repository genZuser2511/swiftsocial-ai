import { create } from 'zustand'
import { toast } from 'sonner'

interface SettingsState {
    insuranceEnabled: boolean
    travelEnabled: boolean
    isLoading: boolean
    fetchSettings: () => Promise<void>
    updateSetting: (key: string, value: string | boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    insuranceEnabled: false,
    travelEnabled: false,
    isLoading: false,

    fetchSettings: async () => {
        set({ isLoading: true })
        try {
            const res = await fetch('/api/settings')
            if (res.ok) {
                const data = await res.json()
                set({ 
                    insuranceEnabled: data.insurance_enabled ? data.insurance_enabled === 'true' : true,
                    travelEnabled: data.travel_enabled === 'true'
                })
            }
        } catch (error) {
            console.error('Failed to fetch settings', error)
        } finally {
            set({ isLoading: false })
        }
    },

    updateSetting: async (key: string, value: string | boolean) => {
        try {
            // Optimistic update
            if (key === 'insurance_enabled') set({ insuranceEnabled: value === true || value === 'true' })
            if (key === 'travel_enabled') set({ travelEnabled: value === true || value === 'true' })

            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key_name: key, value: String(value) })
            })

            if (!res.ok) {
                // Revert by refetching
                get().fetchSettings()
                const errData = await res.json().catch(() => ({}))
                toast.error(`Error saving: ${errData?.error || res.statusText}. Did you run schema.sql?`)
            } else {
                toast.success(`Settings saved`)
            }
        } catch (error) {
            console.error(`Failed to update setting ${key}`, error)
        }
    }
}))
