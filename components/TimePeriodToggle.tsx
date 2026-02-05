'use client'

import { Period } from '@/lib/store/time-period-store'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

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
    <SegmentedControl
      options={periods}
      value={value}
      onChange={onChange}
    />
  )
}
