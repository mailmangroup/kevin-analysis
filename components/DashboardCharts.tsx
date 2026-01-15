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
  ArcElement
)

interface DashboardChartsProps {
  metrics: any[]
  types: any[]
  costs: any[]
}

export function DashboardCharts({ metrics, types, costs }: DashboardChartsProps) {
  // Sort metrics by date ascending for chart
  const sortedMetrics = [...metrics].sort((a, b) => a.date_beijing.localeCompare(b.date_beijing))
  
  // Sort costs by month ascending
  const sortedCosts = [...costs].sort((a, b) => a.year_month.localeCompare(b.year_month))

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* 1. Daily Active Users (Last 30 Days) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Active Users (Last 30 Days)</h3>
        <div className="h-64">
          <Line
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)), // MM-DD
              datasets: [{
                label: 'Active Users',
                data: sortedMetrics.map(m => m.dau),
                borderColor: 'rgb(16, 185, 129)', // Green
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.3
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }}
          />
        </div>
      </div>

      {/* 2. Queries by Type per Day (Last 30 Days) - Split into 3 Charts */}
      
      {/* 2a. Report Generation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Report Generation (Last 30 Days)</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
              datasets: [
                {
                  label: 'Report Generation',
                  data: sortedMetrics.map(m => m.report_generation_count || 0),
                  backgroundColor: 'rgba(255, 99, 132, 0.7)',
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      </div>

      {/* 2b. Question Answering */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Question Answering (Last 30 Days)</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
              datasets: [
                {
                  label: 'Question Answering',
                  data: sortedMetrics.map(m => m.question_answering_count || 0),
                  backgroundColor: 'rgba(54, 162, 235, 0.7)',
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      </div>

      {/* 2c. Content Generation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Content Generation (Last 30 Days)</h3>
        <div className="h-64">
          <Bar
            data={{
              labels: sortedMetrics.map(m => m.date_beijing.slice(5)),
              datasets: [
                {
                  label: 'Content Generation',
                  data: sortedMetrics.map(m => m.content_generation_count || 0),
                  backgroundColor: 'rgba(255, 206, 86, 0.7)',
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      </div>
    </div>
  )
}
