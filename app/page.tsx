'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { DashboardCharts } from '@/components/DashboardCharts'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json())

export default function Home() {
  const { profile, fetchProfile } = useUserStore()

  useEffect(() => {
    fetchProfile()
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
            Loading profile...
          </div>
        ) : (
          <>
            {/* Charts */}
            <DashboardCharts metrics={metrics} types={types} costs={costs} />

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8">
                <a href="/questions" className="block p-6 bg-white shadow rounded-lg hover:bg-gray-50 text-center">
                    <span className="text-lg font-medium text-gray-900">Questions</span>
                    <p className="text-sm text-gray-500 mt-1">Browse & Filter</p>
                </a>
                <a href="/cost" className="block p-6 bg-white shadow rounded-lg hover:bg-gray-50 text-center">
                    <span className="text-lg font-medium text-gray-900">Cost</span>
                    <p className="text-sm text-gray-500 mt-1">Monthly Breakdown</p>
                </a>
                <a href="/retention" className="block p-6 bg-white shadow rounded-lg hover:bg-gray-50 text-center">
                    <span className="text-lg font-medium text-gray-900">Retention</span>
                    <p className="text-sm text-gray-500 mt-1">Cohort Analysis</p>
                </a>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
