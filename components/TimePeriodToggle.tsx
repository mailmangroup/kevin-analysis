'use client'

import { Period } from '@/lib/store/time-period-store'

interface TimePeriodToggleProps {
  value: Period
  onChange: (period: Period) => void
}

const periods: { value: Period; label: string }[] = [
  { value: '7D', label: '7D' },
  { value: '30D', label: '30D' },
  { value: '90D', label: '90D' },
]

export function TimePeriodToggle({ value, onChange }: TimePeriodToggleProps) {
  return (
    <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-1.5 shadow-card ring-1 ring-slate-200/50">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`
            relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200
            ${value === period.value
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
