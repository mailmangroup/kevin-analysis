'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface DailyCostSummary {
  date: string
  total_cost_usd: number
  total_spans: number
  total_tokens: number
}

interface MonthlyCostSummary {
  year_month: string
  total_cost_usd: number
  total_spans: number
  total_tokens: number
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json())

export default function CostPage() {
  const { profile, fetchProfile } = useUserStore()
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchProfile()
  }, [])

  const apiUrl = profile?.kawo_api_url
  const { data: dailyData = [], isLoading: dailyLoading } = useSWR<DailyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/daily?days=${days}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        data.sort((a, b) => a.date.localeCompare(b.date))
      }
    }
  )

  const { data: monthlyData = [], isLoading: monthlyLoading } = useSWR<MonthlyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/monthly` : null,
    fetcher,
    {
       onSuccess: (data) => {
         data.sort((a, b) => a.year_month.localeCompare(b.year_month))
       }
    }
  )
  
  const loading = dailyLoading || monthlyLoading

  const dailyChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Cost (USD)',
        data: dailyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1,
      },
    ],
  }

  const dailyTokenData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Tokens',
        data: dailyData.map((d) => d.total_tokens),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  }

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.year_month),
    datasets: [
      {
        label: 'Monthly Cost (USD)',
        data: monthlyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Cost Analysis
          </h2>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border text-gray-900"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Key Metrics Cards - using monthly data for all-time stats */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cost (All Time)</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${monthlyData.reduce((acc, curr) => acc + curr.total_cost_usd, 0).toFixed(2)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {(monthlyData.reduce((acc, curr) => acc + curr.total_tokens, 0) / 1000000).toFixed(2)}M
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Queries</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {monthlyData.reduce((acc, curr) => acc + curr.total_spans, 0).toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Cost (USD)</h3>
                <div className="h-80">
                  <Bar options={{ maintainAspectRatio: false }} data={dailyChartData} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Token Usage</h3>
                <div className="h-80">
                  <Bar options={{ maintainAspectRatio: false }} data={dailyTokenData} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Overview</h3>
              <div className="h-80">
                <Bar options={{ maintainAspectRatio: false }} data={monthlyChartData} />
              </div>
            </div>

            {/* Daily Table */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Daily Breakdown</h3>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Queries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost/Query</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dailyData.slice().reverse().map((item) => (
                      <tr key={item.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.total_cost_usd.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_tokens.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_spans.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.total_spans > 0 ? (item.total_cost_usd / item.total_spans).toFixed(4) : '0.0000'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
