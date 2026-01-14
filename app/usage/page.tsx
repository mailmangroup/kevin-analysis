'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function UsagePage() {
  const [trends, setTrends] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [types, setTypes] = useState<any[]>([])
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendsRes, brandsRes, typesRes] = await Promise.all([
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/usage/trends?days=${days}`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/usage/brands?days=${days}`),
          fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/usage/types?days=${days}`),
        ])

        if (trendsRes.ok) setTrends(await trendsRes.json())
        if (brandsRes.ok) setBrands(await brandsRes.json())
        if (typesRes.ok) setTypes(await typesRes.json())
      } catch (error) {
        console.error('Error fetching usage data:', error)
      }
    }

    fetchData()
  }, [days])

  const lineChartData = {
    labels: trends.map((t) => t.date_beijing),
    datasets: [
      {
        label: 'Daily Queries',
        data: trends.map((t) => t.count),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  const brandChartData = {
    labels: brands.map((b) => b.brand_id || 'Unknown'),
    datasets: [
      {
        label: 'Queries by Brand',
        data: brands.map((b) => b.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  }

  const typeChartData = {
    labels: types.map((t) => t.generation_type || 'Unknown'),
    datasets: [
      {
        label: 'Queries by Type',
        data: types.map((t) => t.count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Usage Analytics
          </h2>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Daily Query Volume</h3>
            <div className="h-80">
              <Line options={{ maintainAspectRatio: false }} data={lineChartData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Brands</h3>
            <div className="h-80">
              <Bar options={{ maintainAspectRatio: false, indexAxis: 'y' as const }} data={brandChartData} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Generation Types</h3>
            <div className="h-80">
              <Bar options={{ maintainAspectRatio: false }} data={typeChartData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
