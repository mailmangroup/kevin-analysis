'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { format, subDays } from 'date-fns'
import { Navbar } from '@/components/Navbar'
import { DashboardCharts } from '@/components/DashboardCharts'
import { HeroKPIGrid } from '@/components/HeroKPIGrid'
import { TimePeriodToggle } from '@/components/TimePeriodToggle'
import { authenticatedFetcher, isKawoAuthError } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useTimePeriodStore, Period } from '@/lib/store/time-period-store'
import { Calendar } from 'lucide-react'
import { useLanguageStore } from '@/lib/store/language-store'
import { KawoConnectionError } from '@/components/KawoConnectionError'

const periodToDays: Record<Period, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
}

export default function Home() {
  const { profile, fetchProfile } = useUserStore()
  const { period, setPeriod } = useTimePeriodStore()
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const { t } = useLanguageStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const apiUrl = profile?.kawo_api_url
  const days = periodToDays[period]

  // Data is always available through yesterday — never include today
  const yesterday = subDays(new Date(), 1)
  const endDate = format(yesterday, 'yyyy-MM-dd')
  const startDate = format(subDays(yesterday, days - 1), 'yyyy-MM-dd')
  const prevEndDate = format(subDays(yesterday, days), 'yyyy-MM-dd')
  const prevStartDate = format(subDays(yesterday, days * 2 - 1), 'yyyy-MM-dd')

  // Fetch current period metrics
  const { data: metrics = [], error: metricsError } = useSWR(
    apiUrl
      ? `${apiUrl}/phoenix/overview/metrics?start_date=${startDate}&end_date=${endDate}`
      : null,
    authenticatedFetcher
  )

  // Fetch previous period metrics for comparison
  const { data: previousPeriodMetrics = [] } = useSWR(
    apiUrl
      ? `${apiUrl}/phoenix/overview/metrics?start_date=${prevStartDate}&end_date=${prevEndDate}`
      : null,
    authenticatedFetcher
  )

  const { data: types = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/usage/types?days=${days}` : null,
    authenticatedFetcher
  )

  const { data: costs = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/cost/monthly` : null,
    authenticatedFetcher
  )

  const loading = !apiUrl
  const connectionFailed = isKawoAuthError(metricsError)

  // Calculate latest date from metrics (fallback to yesterday)
  const latestDate = metrics && metrics.length > 0
    ? metrics.reduce((max: string, curr: any) => (curr.date_beijing > max ? curr.date_beijing : max), metrics[0].date_beijing)
    : endDate

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="md:flex md:items-end md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {t('dashboard.title')} <span className="text-gradient">{t('dashboard.overview')}</span>
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                <span>{t('dashboard.lastUpdated')}: {latestDate}</span>
                <span className="text-slate-300">•</span>
                <span>{t('dashboard.beijingTime')}</span>
              </div>
            </div>
            <div className="mt-5 md:mt-0">
              <TimePeriodToggle value={period} onChange={setPeriod} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {/* Skeleton for KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-4 w-24 shimmer rounded" />
                    <div className="h-11 w-11 shimmer rounded-xl" />
                  </div>
                  <div className="h-10 w-32 shimmer rounded mb-4" />
                  <div className="h-6 w-28 shimmer rounded-lg" />
                </div>
              ))}
            </div>
            {/* Skeleton for chart */}
            <div className="bg-white rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 shimmer rounded-xl" />
                <div className="space-y-2">
                  <div className="h-5 w-40 shimmer rounded" />
                  <div className="h-4 w-32 shimmer rounded" />
                </div>
              </div>
              <div className="h-72 shimmer rounded-xl" />
            </div>
          </div>
        ) : connectionFailed || metricsError ? (
          <KawoConnectionError reason={connectionFailed ? 'invalid' : 'failed'} />
        ) : (
          <>
            {/* Hero KPI Cards */}
            <div className="mb-10">
              <HeroKPIGrid
                metrics={metrics}
                previousMetrics={previousPeriodMetrics.length > 0 ? previousPeriodMetrics : undefined}
              />
            </div>

            {/* Charts */}
            <DashboardCharts metrics={metrics} types={types} costs={costs} groupBy={groupBy} onGroupByChange={setGroupBy} />
          </>
        )}
      </main>
    </div>
  )
}
