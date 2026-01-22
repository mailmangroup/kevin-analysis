'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { DashboardCharts } from '@/components/DashboardCharts'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
})

export default function Home() {
  const { profile, fetchProfile } = useUserStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const apiUrl = profile?.kawo_api_url

  // Fetch all dashboard data using SWR
  const { data: metrics = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/overview/metrics?days=30` : null,
    fetcher
  )

  const { data: types = [] } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/usage/types?days=30` : null,
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
        </div>

        {loading ? (
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-12 text-center text-slate-500 animate-pulse">
            Loading profile...
          </div>
        ) : (
          <>
            {/* Charts */}
            <DashboardCharts metrics={metrics} types={types} costs={costs} />

            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
              <a 
                href="/questions" 
                className="group relative block p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-50 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity" />
                <span className="text-xl font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">Questions</span>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Browse and filter through user questions to understand common patterns.</p>
                <div className="mt-4 flex items-center text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Questions <span className="ml-1">→</span>
                </div>
              </a>
              
              <a 
                href="/cost" 
                className="group relative block p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity" />
                <span className="text-xl font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Cost</span>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Analyze monthly costs and usage breakdowns across different models.</p>
                <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Cost Analysis <span className="ml-1">→</span>
                </div>
              </a>

              <a 
                href="/retention" 
                className="group relative block p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-50 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity" />
                <span className="text-xl font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">Retention</span>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Track user retention cohorts and long-term engagement metrics.</p>
                <div className="mt-4 flex items-center text-violet-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Retention <span className="ml-1">→</span>
                </div>
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
