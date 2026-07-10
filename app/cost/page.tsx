'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Info } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { TimePeriodToggle } from '@/components/TimePeriodToggle'
import { authenticatedFetcher, isKawoAuthError } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useTimePeriodStore, Period } from '@/lib/store/time-period-store'
import { useLanguageStore } from '@/lib/store/language-store'
import { KawoConnectionError } from '@/components/KawoConnectionError'
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

const COST_ESTIMATION_NOTE = {
  overview: 'We track token costs using Global Fixed Rates in Phoenix. Flat-rate estimates only — no tiered pricing.',
  configTitle: 'Per 1M tokens (USD)',
  configItems: [
    { model: 'qwen3.6-max-preview', rates: '$1.30 / $7.80', context: 'Current premium model' },
    { model: 'qwen-max', rates: '$0.58 / $2.32', context: 'Historical' },
    { model: 'qwen-plus', rates: '$0.11 / $1.15', context: 'Historical' },
    { model: 'qwen3.5-plus', rates: '$0.11 / $0.66', context: 'Flat rate' },
    { model: 'qwen3.5-flash', rates: '$0.028 / $0.276', context: 'Flat rate' },
  ],
  limitations: [
    'Non-thinking calls use the higher Thinking rate → reported cost may exceed actual bill.',
    'Contexts >128k use a higher tier not reflected here.',
    'Rates are USD; CNY↔USD is not real-time.',
  ],
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const SUB_CATEGORY_COLORS: Record<string, string> = {
  'video_analysis': 'rgba(249, 115, 22, 0.85)',
  'chat': 'rgba(245, 158, 11, 0.85)',
  'report': 'rgba(251, 191, 36, 0.85)',
  'content': 'rgba(251, 146, 60, 0.85)',
  'other': 'rgba(148, 163, 184, 0.85)',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Question Answering': 'rgba(245, 158, 11, 0.85)', // Amber
  'Other': 'rgba(148, 163, 184, 0.85)',             // Slate
}

// Pre-defined color palette for dynamic assignment
const DYNAMIC_COLOR_PALETTE = [
  'rgba(249, 115, 22, 0.85)', // Orange 500
  'rgba(245, 158, 11, 0.85)', // Amber 500
  'rgba(234, 179, 8, 0.85)',  // Yellow 500
  'rgba(132, 204, 22, 0.85)', // Lime 500
  'rgba(34, 197, 94, 0.85)',  // Green 500
  'rgba(20, 184, 166, 0.85)', // Teal 500
  'rgba(6, 182, 212, 0.85)',  // Cyan 500
  'rgba(14, 165, 233, 0.85)', // Sky 500
  'rgba(59, 130, 246, 0.85)', // Blue 500
  'rgba(99, 102, 241, 0.85)', // Indigo 500
  'rgba(168, 85, 247, 0.85)', // Purple 500
  'rgba(217, 70, 239, 0.85)', // Fuchsia 500
  'rgba(236, 72, 153, 0.85)', // Pink 500
  'rgba(244, 63, 94, 0.85)',  // Rose 500
  'rgba(239, 68, 68, 0.85)',  // Red 500
  'rgba(100, 116, 139, 0.85)', // Slate 500
]

function getColorForString(str: string, type: 'category' | 'subCategory' = 'category'): string {
  // Check explicit mappings first
  if (type === 'category' && CATEGORY_COLORS[str]) return CATEGORY_COLORS[str]
  if (type === 'subCategory' && SUB_CATEGORY_COLORS[str]) return SUB_CATEGORY_COLORS[str]
  
  // Also check if the key exists in the other map (fallback)
  if (CATEGORY_COLORS[str]) return CATEGORY_COLORS[str]
  if (SUB_CATEGORY_COLORS[str]) return SUB_CATEGORY_COLORS[str]

  // Dynamic assignment based on string hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % DYNAMIC_COLOR_PALETTE.length
  return DYNAMIC_COLOR_PALETTE[index]
}

const MAIN_CATEGORIES = ['Question Answering', 'Other'] as const
type MainCategory = typeof MAIN_CATEGORIES[number]

const QUESTION_ANSWERING_SUBCATEGORIES = new Set(['chat', 'report', 'video_analysis'])

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatUsd(value: number) {
  return `$${value.toFixed(4)}`
}

function normalizeCostBreakdown(day: Pick<DailyCostSummary, 'cost_breakdown' | 'total_cost_usd'>) {
  let questionAnsweringTotal = 0
  const questionAnsweringSubCategoryTotals: Record<string, number> = {}
  const otherDetailTotals: Record<string, number> = {}

  if (day.cost_breakdown) {
    Object.entries(day.cost_breakdown).forEach(([category, subCategories]) => {
      Object.entries(subCategories).forEach(([subCategory, cost]) => {
        if (cost <= 0) return
        if (QUESTION_ANSWERING_SUBCATEGORIES.has(subCategory)) {
          questionAnsweringTotal += cost
          questionAnsweringSubCategoryTotals[subCategory] = (questionAnsweringSubCategoryTotals[subCategory] ?? 0) + cost
        } else {
          const label = formatLabel(category)
          otherDetailTotals[label] = (otherDetailTotals[label] ?? 0) + cost
        }
      })
    })
  }

  const otherTotal = Math.max(0, day.total_cost_usd - questionAnsweringTotal)

  return {
    categoryTotals: {
      'Question Answering': questionAnsweringTotal,
      'Other': otherTotal,
    } as Record<MainCategory, number>,
    questionAnsweringSubCategoryTotals,
    otherDetailTotals,
  }
}


interface DailyCostSummary {
  date: string
  total_cost_usd: number
  total_spans: number
  total_tokens: number
  cost_breakdown?: Record<string, Record<string, number>>
}

interface MonthlyCostSummary {
  year_month: string
  total_cost_usd: number
  total_spans: number
  total_tokens: number
}

const periodToDays: Record<Period, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
}

function CostEstimationTooltip({ t }: { t: (key: string) => string }) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const visible = open || hover

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center justify-center rounded-full text-slate-400 hover:text-amber-600 focus:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors"
        aria-label="How we estimate costs"
      >
        <Info className="h-4 w-4" />
      </button>
      {visible && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white text-left shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5"
        >
          <div className="border-l-2 border-amber-400 bg-amber-50/60 px-3.5 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800/90">{t('cost.estimationNote')}</p>
          </div>
          <div className="p-3.5 space-y-3.5">
            <p className="text-xs leading-relaxed text-slate-600">{COST_ESTIMATION_NOTE.overview}</p>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">{COST_ESTIMATION_NOTE.configTitle}</p>
              <ul className="space-y-1.5">
                {COST_ESTIMATION_NOTE.configItems.map((item) => (
                  <li key={item.model} className="text-xs text-slate-600 flex flex-wrap gap-x-1.5">
                    <span className="font-medium text-slate-700">{item.model}:</span>
                    <span className="text-amber-700">{item.rates}</span>
                    <span className="text-slate-500">({item.context})</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-700 mb-2">{t('cost.limitations')}</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 marker:text-amber-500/70">
                {COST_ESTIMATION_NOTE.limitations.map((lim, i) => (
                  <li key={i} className="leading-relaxed pl-0.5">{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </span>
  )
}

export default function CostPage() {
  const { profile, fetchProfile } = useUserStore()
  const { period, setPeriod } = useTimePeriodStore()
  const { t } = useLanguageStore()
  const days = periodToDays[period]

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const apiUrl = profile?.kawo_api_url
  const { data: dailyData = [], error: dailyError, isLoading: dailyLoading } = useSWR<DailyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/daily?days=${days}` : null,
    authenticatedFetcher
  )

  const { data: monthlyData = [], error: monthlyError, isLoading: monthlyLoading } = useSWR<MonthlyCostSummary[]>(
    apiUrl ? `${apiUrl}/phoenix/cost/monthly` : null,
    authenticatedFetcher
  )
  
  const loading = dailyLoading || monthlyLoading
  const connectionError = dailyError || monthlyError
  const connectionFailed = isKawoAuthError(dailyError) || isKawoAuthError(monthlyError)

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
  const safeDailyData = Array.isArray(dailyData) 
    ? [...dailyData].sort((a, b) => a.date.localeCompare(b.date)) 
    : []
  const safeMonthlyData = Array.isArray(monthlyData) 
    ? [...monthlyData].sort((a, b) => a.year_month.localeCompare(b.year_month)) 
    : []
  const normalizedDailyData = safeDailyData.map((day) => ({
    ...day,
    normalized: normalizeCostBreakdown(day),
  }))

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

  // Average cost per category and sub-category
  const daysWithBreakdown = normalizedDailyData.filter((d) => d.cost_breakdown).length
  const categoryTotals: Record<MainCategory, number> = {
    'Question Answering': 0,
    'Other': 0,
  }
  const questionAnsweringSubCategoryTotals: Record<string, number> = {}
  const otherDetailAggTotals: Record<string, number> = {}
  normalizedDailyData.forEach((day) => {
    MAIN_CATEGORIES.forEach((category) => {
      categoryTotals[category] = (categoryTotals[category] ?? 0) + day.normalized.categoryTotals[category]
    })

    Object.entries(day.normalized.questionAnsweringSubCategoryTotals).forEach(([subCategory, cost]) => {
      questionAnsweringSubCategoryTotals[subCategory] = (questionAnsweringSubCategoryTotals[subCategory] ?? 0) + cost
    })

    Object.entries(day.normalized.otherDetailTotals).forEach(([label, cost]) => {
      otherDetailAggTotals[label] = (otherDetailAggTotals[label] ?? 0) + cost
    })
  })
  const categoryAverages = Object.entries(categoryTotals)
    .map(([name, total]) => ({ name, avgCost: daysWithBreakdown > 0 ? total / daysWithBreakdown : 0 }))
    .sort((a, b) => b.avgCost - a.avgCost)
  const subCatAverages = Object.entries(questionAnsweringSubCategoryTotals)
    .map(([name, total]) => ({ name, avgCost: daysWithBreakdown > 0 ? total / daysWithBreakdown : 0 }))
    .sort((a, b) => b.avgCost - a.avgCost)
  const otherDetailAverages = Object.entries(otherDetailAggTotals)
    .map(([name, total]) => ({ name, avgCost: daysWithBreakdown > 0 ? total / daysWithBreakdown : 0 }))
    .sort((a, b) => b.avgCost - a.avgCost)

  // Prepare Daily Cost stacked by Category
  const dailyCostByCategoryChartData = {
    labels: normalizedDailyData.map((d) => d.date),
    datasets: MAIN_CATEGORIES.map((targetCategory) => ({
      label: targetCategory,
      data: normalizedDailyData.map((day) =>
        Number(day.normalized.categoryTotals[targetCategory].toFixed(4))
      ),
      backgroundColor: CATEGORY_COLORS[targetCategory] ?? CATEGORY_COLORS['Other'],
      borderRadius: 4,
      stack: 'cost',
    }))
  }

  const stackedChartOptions = {
    ...chartOptions,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      ...chartOptions.plugins,
      legend: { display: true, position: 'bottom' as const, labels: { font: { size: 11 }, boxWidth: 12, padding: 16 } },
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          title: (items: Array<{ dataIndex: number; label: string }>) => {
            const day = normalizedDailyData[items[0]?.dataIndex]
            return day?.date ?? items[0]?.label ?? ''
          },
          label: (context: { dataset: { label?: string }; parsed: { y?: number } }) => {
            const value = context.parsed.y ?? 0
            return `${context.dataset.label ?? 'Cost'}: ${formatUsd(value)}`
          },
          afterBody: (items: Array<{ dataIndex: number }>) => {
            const day = normalizedDailyData[items[0]?.dataIndex]
            if (!day) return []
            const lines: string[] = []
            const qaItems = Object.entries(day.normalized.questionAnsweringSubCategoryTotals)
              .filter(([, cost]) => cost > 0)
              .sort((a, b) => b[1] - a[1])
            if (qaItems.length > 0) {
              lines.push('', 'Question Answering breakdown:')
              qaItems.forEach(([label, cost]) => lines.push(`  ${formatLabel(label)}: ${formatUsd(cost)}`))
            }
            const otherItems = Object.entries(day.normalized.otherDetailTotals)
              .filter(([, cost]) => cost > 0)
              .sort((a, b) => b[1] - a[1])
            if (otherItems.length > 0) {
              lines.push('', 'Other breakdown:')
              otherItems.forEach(([label, cost]) => lines.push(`  ${label}: ${formatUsd(cost)}`))
            }
            return lines
          },
          footer: (items: Array<{ dataIndex: number }>) => {
            const day = normalizedDailyData[items[0]?.dataIndex]
            return day ? `Total: ${formatUsd(day.total_cost_usd)}` : ''
          },
        },
      },
    },
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, stacked: true },
      y: { ...chartOptions.scales.y, stacked: true },
    },
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="md:flex md:items-end md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {t('cost.title')} <span className="text-gradient">{t('cost.subtitle')}</span>
              </h1>
              <p className="mt-3 text-sm text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span>{t('cost.description')}</span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">Phoenix fixed rates (Medium Context)</span>
                  <CostEstimationTooltip t={t} />
                </span>
              </p>
            </div>
            <div className="mt-5 md:mt-0">
              <TimePeriodToggle value={period} onChange={setPeriod} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="h-5 w-40 shimmer rounded mb-6" />
                <div className="h-72 shimmer rounded-xl" />
              </div>
            ))}
          </div>
        ) : connectionError ? (
          <KawoConnectionError reason={connectionFailed ? 'invalid' : 'failed'} />
        ) : (
          <div className="space-y-6">
            {/* 1. Daily Cost Chart */}
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Daily Cost (USD)</h3>
              <div className="h-72">
                <Bar data={dailyCostByCategoryChartData} options={stackedChartOptions} />
              </div>
            </div>

            {/* 2. Average Cost per Category / Sub-Category */}
            {categoryAverages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Avg Daily Cost</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">By Main Category</p>
                    <div className="space-y-3">
                      {categoryAverages.map((item) => {
                        const max = categoryAverages[0].avgCost
                        const pct = max > 0 ? (item.avgCost / max) * 100 : 0
                        return (
                          <div key={item.name}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600 capitalize">{item.name.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-medium text-slate-700">${item.avgCost.toFixed(4)}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">By Question Answering Sub-Category</p>
                    <div className="space-y-3">
                      {subCatAverages.map((item) => {
                        const max = subCatAverages[0].avgCost
                        const pct = max > 0 ? (item.avgCost / max) * 100 : 0
                        const color = getColorForString(item.name, 'subCategory')
                        return (
                          <div key={item.name}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600 capitalize">{item.name.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-medium text-slate-700">${item.avgCost.toFixed(4)}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">By Other Sub-Category</p>
                    <div className="space-y-3">
                      {otherDetailAverages.map((item) => {
                        const max = otherDetailAverages[0]?.avgCost ?? 0
                        const pct = max > 0 ? (item.avgCost / max) * 100 : 0
                        return (
                          <div key={item.name}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600">{item.name}</span>
                              <span className="text-xs font-medium text-slate-700">${item.avgCost.toFixed(4)}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-slate-400" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Daily Token Usage - Removed */}

            {/* 4. Monthly Cost Summary */}
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
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
