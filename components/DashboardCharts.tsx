'use client'

import { useEffect } from 'react'

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
import { format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, parseISO } from 'date-fns'
import { SegmentedControl } from '@/components/ui/SegmentedControl'

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

type GroupBy = 'day' | 'week' | 'month'

function getGroupKey(dateStr: string, groupBy: GroupBy): string {
  const d = parseISO(dateStr)
  if (groupBy === 'week') return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  if (groupBy === 'month') return format(startOfMonth(d), 'yyyy-MM')
  return dateStr
}

function groupMetrics(metrics: any[], groupBy: GroupBy) {
  const map = new Map<string, { dau: number; qa: number; rg: number; cg: number }>()
  for (const m of metrics) {
    if (!m?.date_beijing) continue
    const key = getGroupKey(m.date_beijing, groupBy)
    if (!map.has(key)) map.set(key, { dau: 0, qa: 0, rg: 0, cg: 0 })
    const entry = map.get(key)!
    entry.dau += m.dau ?? 0
    entry.qa += m.question_answering_count ?? 0
    entry.rg += m.report_generation_count ?? 0
    entry.cg += m.content_generation_count ?? 0
  }

  const latestDate = metrics.length > 0 ? metrics[metrics.length - 1].date_beijing : null
  const latestDateObj = latestDate ? parseISO(latestDate) : null
  const latestGroupKey = latestDate ? getGroupKey(latestDate, groupBy) : null
  const latestBucketIsPartial = latestDateObj
    ? (groupBy === 'week' && latestDateObj < endOfWeek(latestDateObj, { weekStartsOn: 1 }))
      || (groupBy === 'month' && latestDateObj < endOfMonth(latestDateObj))
    : false

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, v]) => ({
      label,
      dau: v.dau,
      question_answering_count: v.qa,
      report_generation_count: v.rg,
      content_generation_count: v.cg,
      isPartial: groupBy !== 'day' && latestBucketIsPartial && label === latestGroupKey,
    }))
}

interface DashboardChartsProps {
  metrics?: any[]
  types?: any[]
  costs?: any[]
  groupBy?: GroupBy
  onGroupByChange?: (g: GroupBy) => void
}

export function DashboardCharts({ metrics, types, costs, groupBy = 'day', onGroupByChange }: DashboardChartsProps) {
  const rawMetrics = [...(Array.isArray(metrics) ? metrics : [])]
    .filter(m => m?.date_beijing)
    .sort((a, b) => a.date_beijing.localeCompare(b.date_beijing))

  const grouped = groupMetrics(rawMetrics, groupBy)
  const groupedLabels = grouped.map(m => (m.isPartial ? `${m.label}*` : m.label))
  const partialBucketIndex = grouped.findIndex(m => m.isPartial)
  const availableDayCount = new Set(rawMetrics.map(m => m.date_beijing)).size
  const canGroupByWeek = availableDayCount >= 7
  const canGroupByMonth = availableDayCount >= 28
  const hasPartialLatestBucket = groupBy !== 'day' && grouped[grouped.length - 1]?.isPartial

  useEffect(() => {
    if (!onGroupByChange) return
    if (groupBy === 'week' && !canGroupByWeek) onGroupByChange('day')
    if (groupBy === 'month' && !canGroupByMonth) onGroupByChange('day')
  }, [groupBy, canGroupByWeek, canGroupByMonth, onGroupByChange])

  // Sort costs by month ascending
  const sortedCosts = [...(Array.isArray(costs) ? costs : [])]
    .filter(c => c?.year_month)
    .sort((a, b) => a.year_month.localeCompare(b.year_month))

  const chartOptions: any = {
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
        grid: {
          display: true,
          drawOnChartArea: true,
          drawTicks: true,
          color: (context: any) => {
            if (groupBy === 'month') return 'transparent'
            // Ensure context.tick exists before accessing its value
            if (!context.tick) return 'transparent'
            const index = context.tick.value
            if (index === 0) return 'transparent'
            
            const currentLabel = groupedLabels[index]
            const prevLabel = groupedLabels[index - 1]
            if (!currentLabel || !prevLabel) return 'transparent'
            
            const currentMonth = currentLabel.replace('*', '').substring(0, 7)
            const prevMonth = prevLabel.replace('*', '').substring(0, 7)
            
            return currentMonth !== prevMonth ? 'rgba(148, 163, 184, 0.5)' : 'transparent'
          },
          lineWidth: 1,
        },
        ticks: { 
          font: (context: any) => {
            const base = { size: 11 }
            if (groupBy === 'month') return base
            if (!context.tick) return base
            
            const index = context.tick.value
            const currentLabel = groupedLabels[index]
            const prevLabel = groupedLabels[index - 1]
            if (!currentLabel) return base
            
            const currentMonth = currentLabel.replace('*', '').substring(0, 7)
            const prevMonth = prevLabel ? prevLabel.replace('*', '').substring(0, 7) : ''
            
            return (index === 0 || currentMonth !== prevMonth) ? { ...base, weight: 'bold' } : base
          },
          color: (context: any) => {
            if (groupBy === 'month') return '#94a3b8'
            if (!context.tick) return '#94a3b8'
            const index = context.tick.value
            const currentLabel = groupedLabels[index]
            const prevLabel = groupedLabels[index - 1]
            if (!currentLabel) return '#94a3b8'
            
            const currentMonth = currentLabel.replace('*', '').substring(0, 7)
            const prevMonth = prevLabel ? prevLabel.replace('*', '').substring(0, 7) : ''
            
            return (index === 0 || currentMonth !== prevMonth) ? '#475569' : '#94a3b8'
          },
          padding: 8 
        },
        border: { display: false }
      }
    }
  }

  const groupByOptions: { value: GroupBy; label: string; disabled?: boolean; title?: string }[] = [
    { value: 'day', label: 'Day' },
    {
      value: 'week',
      label: 'Week (Mon-Sun)',
      disabled: !canGroupByWeek,
      title: canGroupByWeek ? 'Grouped by calendar week (Monday-Sunday)' : 'Need at least 7 days of data',
    },
    {
      value: 'month',
      label: 'Month (Calendar)',
      disabled: !canGroupByMonth,
      title: canGroupByMonth ? 'Grouped by calendar month' : 'Need at least 28 days of data',
    },
  ]

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
                <h3 className="text-lg font-semibold text-slate-900">Active Users</h3>
                <p className="text-sm text-slate-500">User engagement over time</p>
              </div>
            </div>
            {onGroupByChange ? (
              <div className="flex flex-col items-end gap-1">
                <SegmentedControl
                  options={groupByOptions}
                  value={groupBy}
                  onChange={(v) => onGroupByChange(v as GroupBy)}
                  size="sm"
                />
                <p className="text-[11px] text-slate-400">Calendar buckets: week starts Monday, month is calendar month.</p>
                {hasPartialLatestBucket && (
                  <p className="text-[11px] text-amber-600">* Latest {groupBy} bucket is partial (in progress).</p>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full ring-1 ring-primary-500/10">
                Trend
              </span>
            )}
          </div>
        </div>
        <div className="h-72 px-6 pb-6">
          <Line
            data={{
              labels: groupedLabels,
              datasets: [{
                label: 'Active Users',
                data: grouped.map(m => m.dau),
                borderColor: '#f59e0b',
                backgroundColor: (context: any) => {
                  const ctx = context.chart.ctx
                  const gradient = ctx.createLinearGradient(0, 0, 0, 280)
                  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)')
                  gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
                  return gradient
                },
                borderWidth: 2.5,
                pointBackgroundColor: (context: any) =>
                  context.dataIndex === partialBucketIndex ? '#fde68a' : '#ffffff',
                pointBorderColor: (context: any) =>
                  context.dataIndex === partialBucketIndex ? '#d97706' : '#f59e0b',
                pointBorderWidth: 2,
                pointRadius: (context: any) =>
                  context.dataIndex === partialBucketIndex ? 5 : 4,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: (context: any) =>
                  context.dataIndex === partialBucketIndex ? '#d97706' : '#f59e0b',
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
                labels: groupedLabels,
                datasets: [
                  {
                    label: 'Report Generation',
                    data: grouped.map(m => (m.report_generation_count || 0) / 10),
                    backgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.85)'),
                    hoverBackgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.6)' : '#d97706'),
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
                labels: groupedLabels,
                datasets: [
                  {
                    label: 'Question Answering',
                    data: grouped.map(m => m.question_answering_count || 0),
                    backgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.85)'),
                    hoverBackgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.6)' : '#d97706'),
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
                labels: groupedLabels,
                datasets: [
                  {
                    label: 'Content Generation',
                    data: grouped.map(m => m.content_generation_count || 0),
                    backgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.85)'),
                    hoverBackgroundColor: grouped.map(m => m.isPartial ? 'rgba(245, 158, 11, 0.6)' : '#d97706'),
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
