'use client'

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
  ArcElement,
  Filler,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { TrendingUp, FileText, MessageCircle, Sparkles } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

interface DashboardChartsProps {
  metrics?: any[]
  types?: any[]
  costs?: any[]
}

export function DashboardCharts({ metrics, types, costs }: DashboardChartsProps) {
  // Sort metrics by date ascending for chart
  const sortedMetrics = [...(Array.isArray(metrics) ? metrics : [])]
    .filter(m => m?.date_beijing)
    .sort((a, b) => a.date_beijing.localeCompare(b.date_beijing))

  // Sort costs by month ascending
  const sortedCosts = [...(Array.isArray(costs) ? costs : [])]
    .filter(c => c?.year_month)
    .sort((a, b) => a.year_month.localeCompare(b.year_month))

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 14,
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 10,
        displayColors: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(241, 245, 249, 0.8)', drawBorder: false },
        ticks: { font: { size: 11 }, color: '#94a3b8', padding: 8 },
        border: { display: false }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8', padding: 8 },
        border: { display: false }
      }
    }
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Daily Active Users - Featured Chart */}
      <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Daily Active Users</h3>
                <p className="text-sm text-slate-500">User engagement over time</p>
              </div>
            </div>
            <span className="text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full ring-1 ring-primary-500/10">
              Trend
            </span>
          </div>
        </div>
        <div className="h-72 px-6 pb-6">
          <Line
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)), // MM-DD
              datasets: [{
                label: 'Active Users',
                data: sortedMetrics.map(m => m.dau),
                borderColor: '#f59e0b',
                backgroundColor: (context: any) => {
                  const ctx = context.chart.ctx
                  const gradient = ctx.createLinearGradient(0, 0, 0, 280)
                  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)')
                  gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
                  return gradient
                },
                borderWidth: 2.5,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#f59e0b',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#f59e0b',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                fill: true,
                tension: 0.4
              }]
            }}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: { ...chartOptions.scales.y, ticks: { ...chartOptions.scales.y.ticks, precision: 0 } }
              }
            }}
          />
        </div>
      </div>

      {/* Query Type Charts - 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Report Generation */}
        <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Report Generation</h3>
                <span className="text-xs text-slate-400 italic">estimated</span>
              </div>
            </div>
          </div>
          <div className="h-56 px-6 pb-6">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Report Generation',
                    data: sortedMetrics.map(m => (m.report_generation_count || 0) / 10),
                    backgroundColor: (context: any) => {
                      const ctx = context.chart.ctx
                      const gradient = ctx.createLinearGradient(0, 0, 0, 200)
                      gradient.addColorStop(0, '#f59e0b')
                      gradient.addColorStop(1, '#fbbf24')
                      return gradient
                    },
                    hoverBackgroundColor: '#d97706',
                    borderRadius: 6,
                    borderSkipped: false,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Question Answering */}
        <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Question Answering</h3>
            </div>
          </div>
          <div className="h-56 px-6 pb-6">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Question Answering',
                    data: sortedMetrics.map(m => m.question_answering_count || 0),
                    backgroundColor: (context: any) => {
                      const ctx = context.chart.ctx
                      const gradient = ctx.createLinearGradient(0, 0, 0, 200)
                      gradient.addColorStop(0, '#f59e0b')
                      gradient.addColorStop(1, '#fbbf24')
                      return gradient
                    },
                    hoverBackgroundColor: '#d97706',
                    borderRadius: 6,
                    borderSkipped: false,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Content Generation */}
        <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="p-6 pb-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Content Generation</h3>
            </div>
          </div>
          <div className="h-56 px-6 pb-6">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Content Generation',
                    data: sortedMetrics.map(m => m.content_generation_count || 0),
                    backgroundColor: (context: any) => {
                      const ctx = context.chart.ctx
                      const gradient = ctx.createLinearGradient(0, 0, 0, 200)
                      gradient.addColorStop(0, '#f59e0b')
                      gradient.addColorStop(1, '#fbbf24')
                      return gradient
                    },
                    hoverBackgroundColor: '#d97706',
                    borderRadius: 6,
                    borderSkipped: false,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
