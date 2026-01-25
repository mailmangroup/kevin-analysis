import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Period = '7D' | '30D' | '90D'

interface TimePeriodStore {
  period: Period
  setPeriod: (period: Period) => void
}

// Persist to localStorage so the selection survives page refreshes
export const useTimePeriodStore = create<TimePeriodStore>()(
  persist(
    (set) => ({
      period: '30D', // default
      setPeriod: (period) => set({ period }),
    }),
    {
      name: 'time-period-storage', // localStorage key
    }
  )
)
