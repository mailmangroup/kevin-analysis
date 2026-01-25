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
      {/* 1. Daily Active Users */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={titleClass.replace('mb-6', 'mb-0')}>Daily Active Users</h3>
          <span className="text-sm text-slate-500 bg-primary-50 px-3 py-1 rounded-full">Trend</span>
        </div>
        <div className="h-72">
          <Line
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)), // MM-DD
              datasets: [{
                label: 'Active Users',
                data: sortedMetrics.map(m => m.dau),
                borderColor: '#f59e0b', // Warm amber primary
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#f59e0b',
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

      {/* 2. Queries by Type - Split into 3 Charts with consistent amber color */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2a. Report Generation */}
        <div className={cardClass}>
          <div className="mb-4">
            <h3 className={titleClass.replace('mb-6', 'mb-2')}>Report Generation</h3>
            <span className="text-xs font-medium text-slate-400 italic">estimated</span>
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
                datasets: [
                  {
                    label: 'Report Generation',
                    data: sortedMetrics.map(m => (m.report_generation_count || 0) / 10),
                    backgroundColor: '#f59e0b', // Amber primary
                    hoverBackgroundColor: '#d97706', // Darker amber on hover
                    borderRadius: 6,
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
                    backgroundColor: '#f59e0b', // Amber primary
                    hoverBackgroundColor: '#d97706', // Darker amber on hover
                    borderRadius: 6,
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
                    backgroundColor: '#f59e0b', // Amber primary
                    hoverBackgroundColor: '#d97706', // Darker amber on hover
                    borderRadius: 6,
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
