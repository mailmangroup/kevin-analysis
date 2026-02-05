'use client'

import { SegmentedControl } from '@/components/ui/SegmentedControl'

interface MetricModeToggleProps {
  mode: 'count' | 'users'
  onChange: (mode: 'count' | 'users') => void
}

export function MetricModeToggle({ mode, onChange }: MetricModeToggleProps) {
  return (
    <SegmentedControl
      options={[
        { value: 'count', label: 'Total Counts' },
        { value: 'users', label: 'Unique Users' },
      ]}
      value={mode}
      onChange={onChange}
    />
  )
}
