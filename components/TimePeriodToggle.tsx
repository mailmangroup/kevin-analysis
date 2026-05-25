'use client'

import { Period } from '@/lib/store/time-period-store'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useLanguageStore } from '@/lib/store/language-store'

interface TimePeriodToggleProps {
  value: Period
  onChange: (period: Period) => void
}

export function TimePeriodToggle({ value, onChange }: TimePeriodToggleProps) {
  const { t } = useLanguageStore()
  
  const periods: { value: Period; label: string }[] = [
    { value: '7D', label: t('period.7D') },
    { value: '30D', label: t('period.30D') },
    { value: '90D', label: t('period.90D') },
  ]

  return (
    <SegmentedControl
      options={periods}
      value={value}
      onChange={onChange}
    />
  )
}
