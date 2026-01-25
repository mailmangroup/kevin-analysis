'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { DashboardCharts } from '@/components/DashboardCharts'
import { HeroKPIGrid } from '@/components/HeroKPIGrid'
import { TimePeriodToggle } from '@/components/TimePeriodToggle'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useTimePeriodStore, Period } from '@/lib/store/time-period-store'

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
})

const periodToDays: Record<Period, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
}

export default function Home() {
  const { profile, fetchProfile } = useUserStore()
  const { period, setPeriod } = useTimePeriodStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const apiUrl = profile?.kawo_api_url
  const days = periodToDays[period]

  // Fetch current period metrics
  const { data: metrics = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/overview/metrics?days=${days}` : null,
    fetcher
  )

  // Fetch previous period metrics for comparison
  const { data: previousMetrics = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/overview/metrics?days=${days * 2}` : null,
    fetcher
  )

  // Get only the previous period data (older half)
  const previousPeriodMetrics = previousMetrics.slice(0, days)

  const { data: types = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/usage/types?days=${days}` : null,
    fetcher
  )

  const { data: costs = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/cost/monthly` : null,
    fetcher
  )

  const loading = !apiUrl

  // Calculate latest date from metrics
  const latestDate = metrics && metrics.length > 0 
    ? metrics.reduce((max: string, curr: any) => (curr.date_beijing > max ? curr.date_beijing : max), metrics[0].date_beijing)
    : new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-tight text-slate-900 tracking-tight">
              Dashboard Overview
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Last updated: {latestDate} • All dates shown in Beijing Time (UTC+8)
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <TimePeriodToggle value={period} onChange={setPeriod} />
          </div>
        </div>

        {loading ? (
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-12 text-center text-slate-500 animate-pulse">
            Loading profile...
          </div>
        ) : (
          <>
            {/* Hero KPI Cards */}
            <div className="mb-8">
              <HeroKPIGrid
                metrics={metrics}
                previousMetrics={previousPeriodMetrics.length > 0 ? previousPeriodMetrics : undefined}
              />
            </div>

            {/* Charts */}
            <DashboardCharts metrics={metrics} types={types} costs={costs} />
          </>
        )}
      </main>
    </div>
  )
}
