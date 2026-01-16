'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { DateRangePicker } from '@/components/DateRangePicker'
import useSWR from 'swr'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { subDays, format } from 'date-fns'
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
}

interface BrandGroup {
  brand_id: string
  brand_name: string
  count: number
  questions: Question[]
}

interface Stats {
  daily_counts: { date_beijing: string; count: number }[]
  daily_counts_by_subcategory?: { date_beijing: string; sub_category: string; count: number }[]
  top_brands: { brand_id: string; brand_name?: string; count: number }[]
  top_users: { user_email: string; count: number }[]
  sub_categories: { sub_category: string; count: number; percentage: number }[]
  grouped_questions?: BrandGroup[]
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json())

// Centralized color mapping for sub-categories
const SUB_CATEGORY_COLORS: Record<string, { bg: string; border: string; solid: string }> = {
  'video_analysis': {
    bg: 'rgba(255, 99, 132, 0.5)',
    border: 'rgba(255, 99, 132, 1)',
    solid: 'rgb(255, 99, 132)'
  },
  'chat': {
    bg: 'rgba(54, 162, 235, 0.5)',
    border: 'rgba(54, 162, 235, 1)',
    solid: 'rgb(54, 162, 235)'
  },
  'report': {
    bg: 'rgba(255, 206, 86, 0.5)',
    border: 'rgba(255, 206, 86, 1)',
    solid: 'rgb(255, 206, 86)'
  },
  'content': {
    bg: 'rgba(75, 192, 192, 0.5)',
    border: 'rgba(75, 192, 192, 1)',
    solid: 'rgb(75, 192, 192)'
  },
  'other': {
    bg: 'rgba(153, 102, 255, 0.5)',
    border: 'rgba(153, 102, 255, 1)',
    solid: 'rgb(153, 102, 255)'
  },
}

// Helper function to get color for a sub-category
function getSubCategoryColor(subCategory: string): { bg: string; border: string; solid: string } {
  return SUB_CATEGORY_COLORS[subCategory] || SUB_CATEGORY_COLORS['other']
}

function FollowUpQuestions({ spanId, apiUrl }: { spanId: string; apiUrl: string }) {
  const [showFollowUps, setShowFollowUps] = useState(false)
  const { data: followUps, error } = useSWR<Question[]>(
    showFollowUps ? `${apiUrl}/phoenix/questions/${spanId}/followups` : null,
    fetcher
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
              <span className="font-bold text-teal-600">A: </span>
              {followUp.answer || '(No answer)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BrandQuestionGroup({ group, apiUrl }: { group: BrandGroup; apiUrl: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div 
        className={`px-6 py-4 flex justify-between items-center cursor-pointer transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-md transition-colors ${isOpen ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
             {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div>
             <span className="font-semibold text-slate-900 block">{group.brand_name}</span>
             <span className="text-xs text-slate-400 font-mono">{group.brand_id}</span>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
          {group.count} questions
        </span>
      </div>
      
      {isOpen && (
        <div className="bg-slate-50/50 border-t border-slate-100">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Sub-category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Question & Answer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-48">Tools</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {group.questions.map((q) => (
                <tr key={q.span_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 align-top font-mono">
                    {new Date(q.start_time).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm align-top">
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
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 align-top">
                    <div className="mb-3">
                      <span className="font-bold text-primary-600 block mb-1">Q: </span>
                      <div className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 max-h-32 overflow-y-auto custom-scrollbar">
                        {q.question}
                      </div>
                    </div>
                    <div className="text-slate-600 text-xs">
                      <span className="font-bold text-teal-600 block mb-1">A: </span>
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
                      <div className="space-y-2">
                        {q.tool_calls.map((tool, idx) => (
                          <div key={idx} className="bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100 text-xs">
                            <div className="font-semibold text-slate-700 mb-0.5">{tool.name}</div>
                            {tool.args && (
                              <div className="text-slate-400 truncate max-w-[140px] font-mono text-[10px]">
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
    
    if (val === 'yesterday') {
        start = subDays(today, 1)
        end = subDays(today, 1)
    } else if (val === 'last7') {
        start = subDays(today, 7)
        end = today
    } else if (val === 'last30') {
        start = subDays(today, 30)
        end = today
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
    fetcher
  )

  const statsLoading = !stats && !statsError

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

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold leading-tight text-slate-900 tracking-tight">
              Questions Analysis
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Analyzing question_answering queries broken down by sub-category • All dates in Beijing Time (UTC+8)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quick Select</label>
               <select
                 className="block w-full h-10 rounded-md border-0 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 shadow-sm"
                 onChange={handleRangeChange}
                 value={quickSelect}
               >
                 <option value="yesterday">Yesterday</option>
                 <option value="last7">Last 7 Days</option>
                 <option value="last30">Last 30 Days</option>
                 <option value="custom">Custom Range</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Date Range</label>
               <DateRangePicker
                 startDate={startDate}
                 endDate={endDate}
                 onStartDateChange={(date) => handleDateChange('start', date)}
                 onEndDateChange={(date) => handleDateChange('end', date)}
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Category</label>
               <select
                 value={subCategory}
                 onChange={(e) => setSubCategory(e.target.value)}
                 className="block w-full h-10 rounded-md border-0 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 shadow-sm"
               >
                 <option value="all">All Sub-categories</option>
                 {stats?.sub_categories?.map((item) => (
                   <option key={item.sub_category} value={item.sub_category}>
                     {item.sub_category}
                   </option>
                 ))}
               </select>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {statsError && (
          <div className="mb-8 bg-rose-50 border border-rose-200 rounded-xl p-4">
            <p className="text-rose-800 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Failed to load statistics. The API returned an error.
            </p>
          </div>
        )}

        {statsLoading && (
          <div className="mb-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center text-slate-500 animate-pulse">
            Loading statistics...
          </div>
        )}
        {stats && stats.daily_counts && stats.sub_categories && stats.top_brands && stats.top_users && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Query Volume Trend</h3>
              <div className="h-72">
                <Bar
                  data={(() => {
                    // If filtering by specific sub-category, show simple bar chart
                    if (subCategory !== 'all') {
                      return {
                        labels: stats.daily_counts.map(d => d.date_beijing),
                        datasets: [{
                          label: 'Queries',
                          data: stats.daily_counts.map(d => d.count),
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                          borderRadius: 4,
                        }]
                      }
                    }

                    // Otherwise, show stacked bar chart by sub-category
                    const dailyData = stats.daily_counts_by_subcategory || []

                    // Get unique dates and sub-categories
                    const dates = Array.from(new Set(dailyData.map(d => d.date_beijing))).sort()
                    const subCategories = Array.from(new Set(dailyData.map(d => d.sub_category)))

                    // Create datasets for each sub-category
                    const datasets = subCategories.map((subCat) => {
                      const colors = getSubCategoryColor(subCat)
                      return {
                        label: subCat,
                        data: dates.map(date => {
                          const item = dailyData.find(d => d.date_beijing === date && d.sub_category === subCat)
                          return item ? item.count : 0
                        }),
                        backgroundColor: colors.bg.replace('0.5', '0.8'), // Make slightly more opaque
                        hoverBackgroundColor: colors.solid,
                        borderRadius: 2,
                      }
                    })

                    return {
                      labels: dates,
                      datasets
                    }
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
                         <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
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

        {/* Grouped Questions Table */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-8">
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Questions by Brand</h3>
            {stats?.grouped_questions && (
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {stats.grouped_questions.length} Brands
                </span>
            )}
          </div>
          {statsLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading questions...</div>
          ) : stats?.grouped_questions && stats.grouped_questions.length > 0 ? (
            <div className="overflow-x-auto">
              {stats.grouped_questions.map((group) => (
                <BrandQuestionGroup key={group.brand_id} group={group} apiUrl={apiUrl || ''} />
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
