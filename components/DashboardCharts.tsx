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

  const cardClass = "bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
  const titleClass = "text-lg font-semibold text-slate-900 mb-6"

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

  return (
    <div className="space-y-6 mb-8">
      {/* 1. Daily Active Users (Last 30 Days) */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={titleClass.replace('mb-6', 'mb-0')}>Daily Active Users</h3>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Last 30 Days</span>
        </div>
        <div className="h-72">
          <Line
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)), // MM-DD
              datasets: [{
                label: 'Active Users',
                data: sortedMetrics.map(m => m.dau),
                borderColor: '#0ea5e9', // Primary-500
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#0ea5e9',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
              }]
            }}
            options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: { ...chartOptions.scales.y, ticks: { precision: 0 } }
              }
            }}
          />
        </div>
      </div>

      {/* 2. Queries by Type per Day (Last 30 Days) - Split into 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2a. Report Generation */}
        <div className={cardClass}>
          <h3 className={titleClass}>Report Generation</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Report Generation',
                    data: sortedMetrics.map(m => m.report_generation_count || 0),
                    backgroundColor: '#10b981', // Emerald-500
                    borderRadius: 4,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* 2b. Question Answering */}
        <div className={cardClass}>
          <h3 className={titleClass}>Question Answering</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Question Answering',
                    data: sortedMetrics.map(m => m.question_answering_count || 0),
                    backgroundColor: '#8b5cf6', // Violet-500
                    borderRadius: 4,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* 2c. Content Generation */}
        <div className={cardClass}>
          <h3 className={titleClass}>Content Generation</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Content Generation',
                    data: sortedMetrics.map(m => m.content_generation_count || 0),
                    backgroundColor: '#f59e0b', // Amber-500
                    borderRadius: 4,
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
