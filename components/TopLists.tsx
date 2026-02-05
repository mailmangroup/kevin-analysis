'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'

import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { TopListCard } from '@/components/TopListCard'

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

const GENERATION_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'question_answering', label: 'Questions' },
  { id: 'report_generation', label: 'Reports' },
  { id: 'content_generation', label: 'Content' },
]

export function TopLists({ days, startDate, endDate }: TopListsProps) {
  const { profile } = useUserStore()
  const [selectedType, setSelectedType] = useState('all')

  const apiUrl = profile?.kawo_api_url
  
  // Construct query params
  let queryParams = `days=${days}`
  if (startDate && endDate) {
    queryParams += `&start_date=${startDate}&end_date=${endDate}`
  }
  if (selectedType !== 'all') {
    queryParams += `&generation_type=${selectedType}`
  }

  const fetcher = (url: string) => fetchWithAuth(url).then(res => {
    if (!res.ok) throw new Error('API error')
    return res.json()
  })

  const { data: topBrands, isLoading: loadingBrands } = useSWR<TopItem[]>(
    apiUrl ? `${apiUrl}/phoenix/usage/brands?${queryParams}` : null,
    fetcher
  )

  const { data: topUsers, isLoading: loadingUsers } = useSWR<TopItem[]>(
    apiUrl ? `${apiUrl}/phoenix/usage/users?${queryParams}` : null,
    fetcher
  )

  const typeOptions = GENERATION_TYPES.map(t => ({ value: t.id, label: t.label }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Top Users</h2>
        <SegmentedControl 
          options={typeOptions}
          value={selectedType}
          onChange={setSelectedType}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopListCard 
          title="Top Brands" 
          icon="🏢" 
          items={topBrands} 
          loading={loadingBrands}
          getItemLabel={(item) => item.brand_name || item.brand_id || 'Unknown'}
        />

        <TopListCard 
          title="Top Users" 
          icon="👤" 
          items={topUsers} 
          loading={loadingUsers}
          getItemLabel={(item) => item.user_email || 'Unknown User'}
        />
      </div>
    </div>
  )
}
