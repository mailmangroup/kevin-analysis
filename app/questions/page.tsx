'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { DateRangePicker } from '@/components/DateRangePicker'
import useSWR from 'swr'
import { authenticatedFetcher, isKawoAuthError } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useLanguageStore } from '@/lib/store/language-store'
import { KawoConnectionError } from '@/components/KawoConnectionError'
import { subDays, format, startOfWeek, startOfMonth, endOfWeek, endOfMonth, parseISO } from 'date-fns'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
import { Bar, Doughnut } from 'react-chartjs-2'

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

interface Question {
  span_id: string
  start_time: string
  user_email: string
  brand_id: string
  question: string
  answer: string
  generation_type: string
  sub_category?: string
  token_count_total: number
  tool_calls?: { name: string; args: any }[]
  is_video_followup?: boolean
  video_analysis_span_id?: string
  cost_usd?: number
  reasoning_tokens?: number
}

interface BrandSummary {
  brand_id: string
  brand_name?: string
  count: number
}

interface Stats {
  daily_counts: { date_beijing: string; count: number }[]
  daily_counts_by_subcategory?: { date_beijing: string; sub_category: string; count: number }[]
  top_brands: BrandSummary[]
  top_users: { user_email: string; count: number }[]
  sub_categories: { sub_category: string; count: number; percentage: number }[]
}

// Centralized color mapping for sub-categories - warm color palette
const SUB_CATEGORY_COLORS: Record<string, { bg: string; border: string; solid: string }> = {
  'video_analysis': {
    bg: 'rgba(249, 115, 22, 0.5)',    // Orange
    border: 'rgba(249, 115, 22, 1)',
    solid: 'rgb(234, 88, 12)'
  },
  'chat': {
    bg: 'rgba(245, 158, 11, 0.5)',    // Amber (primary)
    border: 'rgba(245, 158, 11, 1)',
    solid: 'rgb(217, 119, 6)'
  },
  'report': {
    bg: 'rgba(251, 191, 36, 0.5)',    // Yellow
    border: 'rgba(251, 191, 36, 1)',
    solid: 'rgb(202, 138, 4)'
  },
  'content': {
    bg: 'rgba(251, 146, 60, 0.5)',    // Light Orange
    border: 'rgba(251, 146, 60, 1)',
    solid: 'rgb(249, 115, 22)'
  },
  'other': {
    bg: 'rgba(148, 163, 184, 0.5)',   // Slate
    border: 'rgba(148, 163, 184, 1)',
    solid: 'rgb(100, 116, 139)'
  },
}

// Helper function to get color for a sub-category
function getSubCategoryColor(subCategory: string): { bg: string; border: string; solid: string } {
  return SUB_CATEGORY_COLORS[subCategory] || SUB_CATEGORY_COLORS['other']
}

type GroupBy = 'day' | 'week' | 'month'

function getGroupKey(dateStr: string, groupBy: GroupBy): string {
  const d = parseISO(dateStr)
  if (groupBy === 'week') {
    const weekStart = startOfWeek(d, { weekStartsOn: 1 })
    return format(weekStart, 'yyyy-MM-dd')
  }
  if (groupBy === 'month') {
    return format(startOfMonth(d), 'yyyy-MM')
  }
  return dateStr
}

function groupDailyCounts(
  daily: { date_beijing: string; count: number }[],
  groupBy: GroupBy
): { label: string; count: number; isPartial: boolean }[] {
  const map = new Map<string, number>()
  for (const d of daily) {
    const key = getGroupKey(d.date_beijing, groupBy)
    map.set(key, (map.get(key) ?? 0) + d.count)
  }
  const latestDate = daily.length > 0 ? daily[daily.length - 1].date_beijing : null
  const latestDateObj = latestDate ? parseISO(latestDate) : null
  const latestGroupKey = latestDate ? getGroupKey(latestDate, groupBy) : null
  const latestBucketIsPartial = latestDateObj
    ? (groupBy === 'week' && latestDateObj < endOfWeek(latestDateObj, { weekStartsOn: 1 }))
      || (groupBy === 'month' && latestDateObj < endOfMonth(latestDateObj))
    : false

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({
      label,
      count,
      isPartial: groupBy !== 'day' && latestBucketIsPartial && label === latestGroupKey,
    }))
}

function groupDailyCountsBySubcategory(
  daily: { date_beijing: string; sub_category: string; count: number }[],
  groupBy: GroupBy
): { label: string; sub_category: string; count: number; isPartial: boolean }[] {
  const map = new Map<string, number>()
  for (const d of daily) {
    const key = `${getGroupKey(d.date_beijing, groupBy)}||${d.sub_category}`
    map.set(key, (map.get(key) ?? 0) + d.count)
  }
  const latestDate = daily.length > 0 ? daily[daily.length - 1].date_beijing : null
  const latestDateObj = latestDate ? parseISO(latestDate) : null
  const latestGroupKey = latestDate ? getGroupKey(latestDate, groupBy) : null
  const latestBucketIsPartial = latestDateObj
    ? (groupBy === 'week' && latestDateObj < endOfWeek(latestDateObj, { weekStartsOn: 1 }))
      || (groupBy === 'month' && latestDateObj < endOfMonth(latestDateObj))
    : false

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [label, sub_category] = key.split('||')
      return {
        label,
        sub_category,
        count,
        isPartial: groupBy !== 'day' && latestBucketIsPartial && label === latestGroupKey,
      }
    })
}

function FollowUpQuestions({ spanId, apiUrl }: { spanId: string; apiUrl: string }) {
  const [showFollowUps, setShowFollowUps] = useState(false)
  const { data: followUps, error } = useSWR<Question[]>(
    showFollowUps ? `${apiUrl}/phoenix/questions/${spanId}/followups` : null,
    authenticatedFetcher
  )

  if (!showFollowUps) {
    return (
      <button
        onClick={() => setShowFollowUps(true)}
        className="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        Show Follow-up Questions
      </button>
    )
  }

  if (error) {
    return <div className="mt-2 text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded">Failed to load follow-ups</div>
  }

  if (!followUps) {
    return <div className="mt-2 text-xs text-slate-500 animate-pulse">Loading follow-ups...</div>
  }

  if (followUps.length === 0) {
    return (
      <div className="mt-2">
        <button
          onClick={() => setShowFollowUps(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Hide Follow-ups
        </button>
        <div className="text-xs text-slate-400 mt-1 italic">No follow-up questions found</div>
      </div>
    )
  }

  return (
    <div className="mt-3 border-l-2 border-primary-100 pl-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">Follow-up Questions ({followUps.length})</span>
        <button
          onClick={() => setShowFollowUps(false)}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          Hide
        </button>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {followUps.map((followUp) => (
          <div key={followUp.span_id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div className="text-slate-400 mb-1.5 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(followUp.start_time).toLocaleString('zh-CN')}
            </div>
            <div className="mb-2">
              <span className="font-bold text-slate-700">Q: </span>
              <span className="text-slate-800">{followUp.question}</span>
            </div>
            <div className="text-slate-600 bg-white p-2.5 rounded border border-slate-100 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
              <span className="font-bold text-amber-600">A: </span>
              {followUp.answer || '(No answer)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PAGE_SIZE = 50

function BrandQuestionGroup({
  brand,
  apiUrl,
  startDate,
  endDate,
  subCategory,
}: {
  brand: BrandSummary
  apiUrl: string
  startDate: string
  endDate: string
  subCategory: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [offset, setOffset] = useState(0)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const params = new URLSearchParams({
    brand_id: brand.brand_id,
    generation_type: 'question_answering',
    limit: String(PAGE_SIZE),
    offset: String(offset),
  })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (subCategory && subCategory !== 'all') params.append('sub_category', subCategory)

  const shouldFetch = isOpen
  const { data: page, error: pageError, isLoading } = useSWR<Question[]>(
    shouldFetch ? `${apiUrl}/phoenix/questions?${params.toString()}` : null,
    authenticatedFetcher
  )

  useEffect(() => {
    if (page !== undefined) {
      if (offset === 0) {
        setAllQuestions(page)
      } else if (page.length > 0) {
        setAllQuestions(prev => [...prev, ...page])
      }
      setHasLoadedOnce(true)
    }
  }, [page, offset])

  const handleOpen = () => {
    if (!isOpen) {
      setOffset(0)
      setAllQuestions([])
      setHasLoadedOnce(false)
    }
    setIsOpen(!isOpen)
  }

  const handleLoadMore = () => {
    setOffset(prev => prev + PAGE_SIZE)
  }

  const hasMore = page !== undefined && page.length === PAGE_SIZE

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div
        className={`px-6 py-4 flex justify-between items-center cursor-pointer transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
        onClick={handleOpen}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-md transition-colors ${isOpen ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{brand.brand_name || brand.brand_id}</span>
            <span className="text-xs text-slate-400 font-mono">{brand.brand_id}</span>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
          {brand.count} questions
        </span>
      </div>

      {isOpen && (
        <div className="bg-slate-50/50 border-t border-slate-100 overflow-x-auto">
          {pageError && (
            <div className="p-6 text-sm text-rose-600 bg-rose-50">Failed to load questions.</div>
          )}
          {isLoading && allQuestions.length === 0 && (
            <div className="p-6 text-sm text-slate-500 animate-pulse">Loading questions...</div>
          )}
          {hasLoadedOnce && allQuestions.length === 0 && !isLoading && (
            <div className="p-6 text-sm text-slate-400 italic">No questions found for this brand in the selected period.</div>
          )}
          {allQuestions.length > 0 && (
            <>
              <table className="w-full min-w-[800px] divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question & Answer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-56">Tools</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {allQuestions.map((q) => (
                    <tr key={q.span_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 align-top">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-primary-600">Q:</span>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(q.start_time).toLocaleString('zh-CN')}
                            </span>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm"
                              style={{
                                backgroundColor: getSubCategoryColor(q.sub_category || 'chat').bg,
                                color: getSubCategoryColor(q.sub_category || 'chat').solid,
                                border: `1px solid ${getSubCategoryColor(q.sub_category || 'chat').border}`
                              }}
                            >
                              {q.sub_category || 'chat'}
                            </span>
                            <span className="text-xs text-slate-600 font-medium">
                              {q.user_email}
                            </span>
                            {q.cost_usd != null && q.cost_usd > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                ≈${q.cost_usd.toFixed(4)}
                              </span>
                            )}
                            {q.reasoning_tokens != null && q.reasoning_tokens > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100" title="Reasoning tokens used">
                                🧠 {q.reasoning_tokens.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 max-h-32 overflow-y-auto custom-scrollbar">
                            {q.question}
                          </div>
                        </div>
                        <div className="text-slate-600 text-xs">
                          <span className="font-bold text-amber-600 block mb-1">A: </span>
                          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                            {q.answer || '(No answer)'}
                          </div>
                        </div>
                        {q.sub_category === 'video_analysis' && (
                          <FollowUpQuestions spanId={q.span_id} apiUrl={apiUrl} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 align-top">
                        {q.tool_calls && q.tool_calls.length > 0 ? (
                          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                            {q.tool_calls.map((tool, idx) => (
                              <div key={idx} className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 text-xs">
                                <div className="font-semibold text-slate-700 mb-0.5">{tool.name}</div>
                                {tool.args && (
                                  <div className="text-slate-400 font-mono text-[10px] break-all">
                                    {JSON.stringify(tool.args)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-xs">No tools used</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(hasMore || isLoading) && (
                <div className="px-6 py-4 border-t border-slate-100 bg-white">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-slate-400 transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Load more ({allQuestions.length} of {brand.count} shown)
                      </>
                    )}
                  </button>
                </div>
              )}
              {!hasMore && !isLoading && allQuestions.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-100 bg-white">
                  <span className="text-xs text-slate-400">All {allQuestions.length} questions loaded</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Questions Analysis Page
 *
 * This page shows analysis for ONLY the "question_answering" generation type.
 * It breaks down questions by sub_category (chat, video_analysis, report, etc.)
 *
 * Note: This is different from the Overview page which shows all generation_types
 * (question_answering, report_generation, content_generation, etc.)
 */
export default function QuestionsPage() {
  const { profile, fetchProfile } = useUserStore()
  const { t } = useLanguageStore()
  const [quickSelect, setQuickSelect] = useState('yesterday')
  const [startDate, setStartDate] = useState(() => {
    // Default to yesterday
    return format(subDays(new Date(), 1), 'yyyy-MM-dd')
  })
  const [endDate, setEndDate] = useState(() => {
    // Default to yesterday
    return format(subDays(new Date(), 1), 'yyyy-MM-dd')
  })
  const [subCategory, setSubCategory] = useState('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('day')

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setQuickSelect(val)
    
    if (val === 'custom') return

    const today = new Date()
    let start = today
    let end = today
    
    if (val === 'today') {
        start = today
        end = today
    } else if (val === 'yesterday') {
        start = subDays(today, 1)
        end = subDays(today, 1)
    } else if (val === 'last3') {
        start = subDays(today, 3)
        end = subDays(today, 1)
    } else if (val === 'last7') {
        start = subDays(today, 7)
        end = subDays(today, 1)
    } else if (val === 'last14') {
        start = subDays(today, 14)
        end = subDays(today, 1)
    } else if (val === 'last30') {
        start = subDays(today, 30)
        end = subDays(today, 1)
    } else if (val === 'last60') {
        start = subDays(today, 60)
        end = subDays(today, 1)
    } else if (val === 'last90') {
        start = subDays(today, 90)
        end = subDays(today, 1)
    } else if (val === 'thisMonth') {
        start = startOfMonth(today)
        end = today
    } else if (val === 'lastMonth') {
        const firstOfThisMonth = startOfMonth(today)
        end = subDays(firstOfThisMonth, 1)
        start = startOfMonth(end)
    }
    
    setStartDate(format(start, 'yyyy-MM-dd'))
    setEndDate(format(end, 'yyyy-MM-dd'))
  }

  const handleDateChange = (type: 'start' | 'end', date: string) => {
    if (type === 'start') setStartDate(date)
    else setEndDate(date)
    setQuickSelect('custom')
  }

  // Build query string
  const params = new URLSearchParams({ limit: '50' })
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)
  if (subCategory && subCategory !== 'all') params.append('sub_category', subCategory)
  const queryString = params.toString()

  // Use SWR for data fetching
  const apiUrl = profile?.kawo_api_url
  const { data: stats, error: statsError } = useSWR<Stats>(
    apiUrl ? `${apiUrl}/phoenix/questions/stats?${queryString}` : null,
    authenticatedFetcher
  )

  const statsLoading = !stats && !statsError
  const availableDayCount = new Set(stats?.daily_counts?.map(d => d.date_beijing) || []).size
  const canGroupByWeek = availableDayCount >= 7
  const canGroupByMonth = availableDayCount >= 28

  useEffect(() => {
    if (groupBy === 'week' && !canGroupByWeek) setGroupBy('day')
    if (groupBy === 'month' && !canGroupByMonth) setGroupBy('day')
  }, [groupBy, canGroupByWeek, canGroupByMonth])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#64748b' },
        border: { display: false },
        stacked: subCategory === 'all'
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#64748b' },
        border: { display: false },
        stacked: subCategory === 'all'
      }
    }
  }

  const groupedForPartial =
    subCategory !== 'all'
      ? groupDailyCounts(stats?.daily_counts || [], groupBy)
      : groupDailyCountsBySubcategory(stats?.daily_counts_by_subcategory || [], groupBy)
  const hasPartialLatestBucket = groupBy !== 'day' && groupedForPartial.some((d) => d.isPartial)

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              {t('questions.title')} <span className="text-gradient">{t('questions.subtitle')}</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Analyzing question_answering queries broken down by sub-category • All dates in Beijing Time (UTC+8) • Data available up to yesterday
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-8 mb-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Quick Select */}
            <div className="lg:col-span-3">
               <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                 <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 {t('date.quickSelect')}
               </label>
               <div className="relative">
                 <select
                   className="block w-full h-11 rounded-xl border-0 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 bg-white hover:bg-slate-50 transition-all sm:text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow"
                   onChange={handleRangeChange}
                   value={quickSelect}
                 >
                   <option value="today">{t('date.today')}</option>
                   <option value="yesterday">{t('date.yesterday')}</option>
                   <option value="last3">{t('date.last3')}</option>
                   <option value="last7">{t('date.last7')}</option>
                   <option value="last14">{t('date.last14')}</option>
                   <option value="last30">{t('date.last30')}</option>
                   <option value="last60">{t('date.last60')}</option>
                   <option value="last90">{t('date.last90')}</option>
                   <option value="thisMonth">{t('date.thisMonth')}</option>
                   <option value="lastMonth">{t('date.lastMonth')}</option>
                   <option value="custom">{t('date.custom')}</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                   <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
            </div>

            {/* Date Range */}
            <div className="lg:col-span-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                 <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 {t('date.dateRange')}
               </label>
               <DateRangePicker
                 startDate={startDate}
                 endDate={endDate}
                 onStartDateChange={(date) => handleDateChange('start', date)}
                 onEndDateChange={(date) => handleDateChange('end', date)}
               />
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-3">
               <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                 <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                 </svg>
                 Category
               </label>
               <div className="relative">
                 <select
                   value={subCategory}
                   onChange={(e) => setSubCategory(e.target.value)}
                   className="block w-full h-11 rounded-xl border-0 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 bg-white hover:bg-slate-50 transition-all sm:text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow"
                 >
                   <option value="all">All Sub-categories</option>
                   {stats?.sub_categories?.map((item) => (
                     <option key={item.sub_category} value={item.sub_category}>
                       {item.sub_category}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                   <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {statsError && (
          <KawoConnectionError
            variant="banner"
            reason={isKawoAuthError(statsError) ? 'invalid' : 'failed'}
          />
        )}

        {statsLoading && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-card">
                  <div className="h-5 w-40 shimmer rounded mb-6" />
                  <div className="h-72 shimmer rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        )}
        {stats && stats.daily_counts && stats.sub_categories && stats.top_brands && stats.top_users && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Query Volume Trend</h3>
                <SegmentedControl
                  options={[
                    { value: 'day', label: 'Day' },
                    {
                      value: 'week',
                      label: 'Week (Mon-Sun)',
                      disabled: !canGroupByWeek,
                      title: canGroupByWeek ? 'Grouped by calendar week (Monday-Sunday)' : 'Need at least 7 days of data'
                    },
                    {
                      value: 'month',
                      label: 'Month (Calendar)',
                      disabled: !canGroupByMonth,
                      title: canGroupByMonth ? 'Grouped by calendar month' : 'Need at least 28 days of data'
                    },
                  ]}
                  value={groupBy}
                  onChange={(v) => setGroupBy(v as GroupBy)}
                  size="sm"
                />
              </div>
              <p className="text-[11px] text-slate-400 -mt-4 mb-4">Calendar buckets: week starts Monday, month is calendar month.</p>
              {hasPartialLatestBucket && (
                <p className="text-[11px] text-amber-600 -mt-3 mb-4">* Latest {groupBy} bucket is partial (in progress).</p>
              )}
              <div className="h-72">
                <Bar
                  data={(() => {
                    if (subCategory !== 'all') {
                      const grouped = groupDailyCounts(stats.daily_counts, groupBy)
                      const labels = grouped.map(d => (d.isPartial ? `${d.label}*` : d.label))
                      return {
                        labels,
                        datasets: [{
                          label: 'Queries',
                          data: grouped.map(d => d.count),
                          backgroundColor: grouped.map(d => d.isPartial ? 'rgba(245, 158, 11, 0.45)' : 'rgba(245, 158, 11, 0.8)'),
                          hoverBackgroundColor: grouped.map(d => d.isPartial ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 1)'),
                          borderRadius: 6,
                        }]
                      }
                    }

                    const grouped = groupDailyCountsBySubcategory(stats.daily_counts_by_subcategory || [], groupBy)
                    const rawLabels = Array.from(new Set(grouped.map(d => d.label))).sort()
                    const partialLabels = new Set(grouped.filter(d => d.isPartial).map(d => d.label))
                    const labels = rawLabels.map(label => (partialLabels.has(label) ? `${label}*` : label))
                    const subCategories = Array.from(new Set(grouped.map(d => d.sub_category)))

                    const datasets = subCategories.map((subCat) => {
                      const colors = getSubCategoryColor(subCat)
                      return {
                        label: subCat,
                        data: rawLabels.map(label => {
                          const item = grouped.find(d => d.label === label && d.sub_category === subCat)
                          return item ? item.count : 0
                        }),
                        backgroundColor: rawLabels.map(label => partialLabels.has(label) ? colors.bg.replace('0.5', '0.45') : colors.bg.replace('0.5', '0.8')),
                        hoverBackgroundColor: rawLabels.map(label => partialLabels.has(label) ? colors.bg.replace('0.5', '0.65') : colors.solid),
                        borderRadius: 2,
                      }
                    })

                    return { labels, datasets }
                  })()}
                  options={chartOptions}
                />
              </div>
            </div>

            {/* Sub-category Distribution */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Sub-category Distribution</h3>
              <div className="h-72 flex justify-center relative">
                <Doughnut
                  data={{
                    labels: stats.sub_categories.map((item) => {
                      return `${item.sub_category} (${item.percentage}%)`
                    }),
                    datasets: [{
                      data: stats.sub_categories.map(item => item.count),
                      backgroundColor: stats.sub_categories.map(item => getSubCategoryColor(item.sub_category).bg.replace('0.5', '0.8')),
                      borderColor: '#ffffff',
                      borderWidth: 2,
                      hoverOffset: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: { size: 11 },
                                boxWidth: 12,
                                padding: 15,
                                usePointStyle: true,
                            }
                        }
                    },
                    layout: {
                        padding: 20
                    }
                  }}
                />
              </div>
            </div>

            {/* Top Brands */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Brands</h3>
              <div className="overflow-y-auto max-h-72 custom-scrollbar pr-2">
                <ul className="divide-y divide-slate-100">
                  {stats.top_brands.map((b, idx) => (
                    <li key={b.brand_id} className="py-3 flex justify-between items-center group hover:bg-slate-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                         <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                           {idx + 1}
                         </span>
                         <span className="text-sm font-medium text-slate-900">{b.brand_name || b.brand_id || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{b.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Users</h3>
              <div className="overflow-y-auto max-h-72 custom-scrollbar pr-2">
                <ul className="divide-y divide-slate-100">
                  {stats.top_users.map((u, idx) => (
                    <li key={u.user_email} className="py-3 flex justify-between items-center group hover:bg-slate-50 rounded-lg px-2 transition-colors">
                      <div className="flex items-center gap-3">
                         <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                           {idx + 1}
                         </span>
                         <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]" title={u.user_email}>{u.user_email}</span>
                      </div>
                      <span className="text-sm text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{u.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Questions by Brand Table */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Questions by Brand</h3>
            {stats?.top_brands && (
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {stats.top_brands.length} Brands
              </span>
            )}
          </div>
          {statsLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading questions...</div>
          ) : stats?.top_brands && stats.top_brands.length > 0 ? (
            <div>
              {stats.top_brands.map((brand) => (
                <BrandQuestionGroup
                  key={brand.brand_id}
                  brand={brand}
                  apiUrl={apiUrl || ''}
                  startDate={startDate}
                  endDate={endDate}
                  subCategory={subCategory}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No questions found for the selected period.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
