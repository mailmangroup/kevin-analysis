'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { authenticatedFetcher } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'

import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { TopListCard } from '@/components/TopListCard'

import { useLanguageStore } from '@/lib/store/language-store'

export interface TopItem {
  brand_id?: string
  brand_name?: string
  user_email?: string
  count: number
}

interface TopListsProps {
  days: number
  startDate?: string
  endDate?: string
}

export function TopLists({ days, startDate, endDate }: TopListsProps) {
  const { profile } = useUserStore()
  const { t } = useLanguageStore()
  const [selectedType, setSelectedType] = useState('question_answering')

  const GENERATION_TYPES = [
    { id: 'question_answering', label: t('toplist.questions') },
    { id: 'report_generation', label: t('toplist.reports') },
    { id: 'content_generation', label: t('toplist.content') },
  ]

  const apiUrl = profile?.kawo_api_url
  
  // Construct query params
  let queryParams = `days=${days}`
  if (startDate && endDate) {
    queryParams += `&start_date=${startDate}&end_date=${endDate}`
  }
  // Always append generation_type since 'all' is no longer an option
  queryParams += `&generation_type=${selectedType}`

  const { data: topBrands, isLoading: loadingBrands } = useSWR<TopItem[]>(
    apiUrl ? `${apiUrl}/phoenix/usage/brands?${queryParams}` : null,
    authenticatedFetcher
  )

  const { data: topUsers, isLoading: loadingUsers } = useSWR<TopItem[]>(
    apiUrl ? `${apiUrl}/phoenix/usage/users?${queryParams}` : null,
    authenticatedFetcher
  )

  const typeOptions = GENERATION_TYPES.map(t => ({ value: t.id, label: t.label }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('toplist.users')}</h2>
        <SegmentedControl 
          options={typeOptions}
          value={selectedType}
          onChange={setSelectedType}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopListCard 
          title={t('toplist.brands')}
          icon="🏢" 
          items={topBrands} 
          loading={loadingBrands}
          getItemLabel={(item) => item.brand_name || item.brand_id || t('toplist.unknown')}
          isReportType={selectedType === 'report_generation'}
        />

        <TopListCard 
          title={t('toplist.users')}
          icon="👤" 
          items={topUsers} 
          loading={loadingUsers}
          getItemLabel={(item) => {
             const user = item.user_email || t('toplist.unknownUser')
             const brand = item.brand_name || item.brand_id
             return brand ? `${user} (${brand})` : user
          }}
          isReportType={selectedType === 'report_generation'}
        />
      </div>
    </div>
  )
}
