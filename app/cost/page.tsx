'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'
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

interface CostSummary {
  year_month: string
  total_cost_usd: number
  total_spans: number
  total_tokens: number
}

export default function CostPage() {
  const [data, setData] = useState<CostSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/cost/monthly`)
        if (res.ok) {
          const json = await res.json()
          // Sort by date ascending for chart
          setData(json.sort((a: CostSummary, b: CostSummary) => a.year_month.localeCompare(b.year_month)))
        }
      } catch (error) {
        console.error('Error fetching cost data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = {
    labels: data.map((d) => d.year_month),
    datasets: [
      {
        label: 'Total Cost (USD)',
        data: data.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1,
      },
    ],
  }

  const tokenData = {
    labels: data.map((d) => d.year_month),
    datasets: [
      {
        label: 'Total Tokens',
        data: data.map((d) => d.total_tokens),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-8">
          Cost Analysis
        </h2>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Key Metrics Cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Cost (All Time)</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${data.reduce((acc, curr) => acc + curr.total_cost_usd, 0).toFixed(2)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Tokens</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {data.reduce((acc, curr) => acc + curr.total_tokens, 0).toLocaleString()}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Queries</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {data.reduce((acc, curr) => acc + curr.total_spans, 0).toLocaleString()}
                  </dd>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Monthly Cost (USD)</h3>
                <div className="h-80">
                  <Bar options={{ maintainAspectRatio: false }} data={chartData} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Monthly Token Usage</h3>
                <div className="h-80">
                  <Bar options={{ maintainAspectRatio: false }} data={tokenData} />
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Month
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Queries
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Cost/Query
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...data].reverse().map((item) => (
                    <tr key={item.year_month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.year_month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.total_cost_usd.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.total_tokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.total_spans.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(item.total_cost_usd / (item.total_spans || 1)).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
