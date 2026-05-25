'use client'

import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useLanguageStore } from '@/lib/store/language-store'

interface MetricModeToggleProps {
  mode: 'count' | 'users'
  onChange: (mode: 'count' | 'users') => void
}

export function MetricModeToggle({ mode, onChange }: MetricModeToggleProps) {
  const { t } = useLanguageStore()
  return (
    <SegmentedControl
      options={[
        { value: 'count', label: t('metricMode.count') },
        { value: 'users', label: t('metricMode.users') },
      ]}
      value={mode}
      onChange={onChange}
    />
  )
}
