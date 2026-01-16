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
  }, [fetchProfile])

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#64748b' },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' },
        border: { display: false }
      }
    }
  }

  const dailyChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Cost (USD)',
        data: dailyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(249, 115, 22, 0.2)', // Orange-500
        borderColor: '#f97316',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const dailyTokenData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Tokens',
        data: dailyData.map((d) => d.total_tokens),
        backgroundColor: 'rgba(14, 165, 233, 0.2)', // Sky-500
        borderColor: '#0ea5e9',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const monthlyChartData = {
    labels: monthlyData.map((d) => d.year_month),
    datasets: [
      {
        label: 'Monthly Cost (USD)',
        data: monthlyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald-500
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-tight text-slate-900 tracking-tight">
              Cost Analysis
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Track token usage and estimated costs over time
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
             <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="block w-full h-10 rounded-md border-0 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 shadow-sm"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl p-12 text-center text-slate-500 animate-pulse">
            Loading cost data...
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Daily Cost Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Daily Cost (USD)</h3>
              <div className="h-72">
                <Bar data={dailyChartData} options={chartOptions} />
              </div>
            </div>

            {/* 2. Daily Token Usage */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Daily Token Usage</h3>
              <div className="h-72">
                <Bar data={dailyTokenData} options={chartOptions} />
              </div>
            </div>

            {/* 3. Monthly Cost Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Cost (USD)</h3>
              <div className="h-72">
                <Bar data={monthlyChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
