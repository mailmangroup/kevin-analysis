'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { DateRangePicker } from '@/components/DateRangePicker'
import { subDays, format, sub } from 'date-fns'
import useSWR from 'swr'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { HeroKPIGrid } from '@/components/HeroKPIGrid'
import { DashboardCharts } from '@/components/DashboardCharts'
import { Calendar, Users } from 'lucide-react'

// Reuse MetricData from HeroKPIGrid
interface MetricData {
  date_beijing: string
  dau?: number
  question_answering_count?: number
  report_generation_count?: number
  content_generation_count?: number
  is_recorded?: boolean
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
})

export default function AnalysisPage() {
  const { profile } = useUserStore()
  
  // State for date range
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  
  // State for quick select
  const [quickSelect, setQuickSelect] = useState('last30')

  // State for metric mode (count vs unique users)
  const [metricMode, setMetricMode] = useState<'count' | 'users'>('count')

  // Calculate previous period range for comparison
  const start = new Date(dateRange.startDate)
  const end = new Date(dateRange.endDate)
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  // Previous period ends exactly one day before current start
  const prevEnd = subDays(start, 1)
  const prevStart = subDays(prevEnd, duration)
  
  const prevStartDateStr = format(prevStart, 'yyyy-MM-dd')
  const prevEndDateStr = format(prevEnd, 'yyyy-MM-dd')

  const apiUrl = profile?.kawo_api_url

  // Fetch current period metrics
  const { data: metrics = [], error: metricsError } = useSWR<MetricData[]>(
    apiUrl ? `${apiUrl}/phoenix/overview/metrics?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}` : null,
    fetcher
  )

  // Fetch previous period metrics
  const { data: previousMetrics = [] } = useSWR<MetricData[]>(
    apiUrl ? `${apiUrl}/phoenix/overview/metrics?start_date=${prevStartDateStr}&end_date=${prevEndDateStr}` : null,
    fetcher
  )
  
  // Fetch sub-category types (using the same days logic for now, or we might need to update that endpoint too)
  // For now, let's just pass 'days' equivalent
  const { data: types = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/usage/types?days=${duration + 1}` : null,
    fetcher
  )

  const loading = !metrics && !metricsError

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setQuickSelect(value)
    
    const today = new Date()
    let start = new Date()
    
    switch (value) {
      case 'yesterday':
        start = subDays(today, 1)
        setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(start, 'yyyy-MM-dd')
        })
        break
      case 'last3':
        start = subDays(today, 2) // today + 2 days back = 3 days
        setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        })
        break
      case 'last7':
        start = subDays(today, 6)
        setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        })
        break
      case 'last30':
        start = subDays(today, 29)
        setDateRange({
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        })
        break
      // custom is handled by DateRangePicker
    }
  }

  const handleDateSelect = (start: string, end: string) => {
    setQuickSelect('custom')
    setDateRange({ startDate: start, endDate: end })
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Usage <span className="text-gradient">Analysis</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Detailed usage metrics and trends analysis • Beijing Time (UTC+8)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Quick Select */}
            <div className="lg:col-span-3">
               <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                 <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 Quick Select
               </label>
               <div className="relative">
                 <select
                   className="block w-full h-11 rounded-xl border-0 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 bg-white hover:bg-slate-50 transition-all sm:text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow"
                   onChange={handleRangeChange}
                   value={quickSelect}
                 >
                   <option value="yesterday">Yesterday</option>
                   <option value="last3">Last 3 Days</option>
                   <option value="last7">Last 7 Days</option>
                   <option value="last30">Last 30 Days</option>
                   <option value="custom">Custom Range</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                   <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-9">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                <Calendar className="w-4 h-4 text-primary-500" />
                Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onStartDateChange={(date) => handleDateSelect(date, dateRange.endDate)}
                onEndDateChange={(date) => handleDateSelect(dateRange.startDate, date)}
              />
            </div>
            {/* Metric Mode Slider */}
            <div className="lg:col-span-12 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Metric Mode</span>
                <div className="bg-slate-100 p-1 rounded-lg inline-flex relative">
                  <div 
                    className={`absolute inset-y-1 w-1/2 bg-white rounded-md shadow-sm transition-all duration-300 ease-out ${
                      metricMode === 'users' ? 'translate-x-full left-[-4px]' : 'left-1'
                    }`}
                  />
                  <button
                    onClick={() => setMetricMode('count')}
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      metricMode === 'count' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Total Counts
                  </button>
                  <button
                    onClick={() => setMetricMode('users')}
                    className={`relative z-10 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      metricMode === 'users' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Unique Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-card h-32 shimmer" />
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card h-96 shimmer" />
          </div>
        ) : (
          <>
            {/* KPI Cards with Comparison */}
            <div className="mb-10">
              <HeroKPIGrid
                metrics={metrics}
                previousMetrics={previousMetrics}
                mode={metricMode}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
