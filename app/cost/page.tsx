'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { TimePeriodToggle } from '@/components/TimePeriodToggle'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useTimePeriodStore, Period } from '@/lib/store/time-period-store'
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

export default function CostPage() {
  const { profile, fetchProfile } = useUserStore()
  const { period, setPeriod } = useTimePeriodStore()
  const days = periodToDays[period]

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const apiUrl = profile?.kawo_api_url
  const { data: dailyData = [], isLoading: dailyLoading } = useSWR<DailyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/daily?days=${days}` : null,
    fetcher,
    {
      onSuccess: (data) => {
        if (Array.isArray(data)) {
          data.sort((a, b) => a.date.localeCompare(b.date))
        }
      }
    }
  )

  const { data: monthlyData = [], isLoading: monthlyLoading } = useSWR<MonthlyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/monthly` : null,
    fetcher,
    {
       onSuccess: (data) => {
         if (Array.isArray(data)) {
           data.sort((a, b) => a.year_month.localeCompare(b.year_month))
         }
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

  // Ensure data is always an array for chart mapping
  const safeDailyData = Array.isArray(dailyData) ? dailyData : []
  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : []

  const dailyChartData = {
    labels: safeDailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Cost (USD)',
        data: safeDailyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber primary
        hoverBackgroundColor: 'rgba(217, 119, 6, 1)',
        borderRadius: 6,
      },
    ],
  }

  const dailyTokenData = {
    labels: safeDailyData.map((d) => d.date),
    datasets: [
      {
        label: 'Daily Tokens',
        data: safeDailyData.map((d) => d.total_tokens),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber primary
        hoverBackgroundColor: 'rgba(217, 119, 6, 1)',
        borderRadius: 6,
      },
    ],
  }

  const monthlyChartData = {
    labels: safeMonthlyData.map((d) => d.year_month),
    datasets: [
      {
        label: 'Monthly Cost (USD)',
        data: safeMonthlyData.map((d) => d.total_cost_usd),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber primary
        hoverBackgroundColor: 'rgba(217, 119, 6, 1)',
        borderRadius: 6,
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
          <div className="mt-4 md:mt-0">
            <TimePeriodToggle value={period} onChange={setPeriod} />
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
