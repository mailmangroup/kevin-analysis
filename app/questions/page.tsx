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
  token_count_total: number
  tool_calls?: { name: string; args: any }[]
}

interface BrandGroup {
  brand_id: string
  brand_name: string
  count: number
  questions: Question[]
}

interface Stats {
  daily_counts: { date_beijing: string; count: number }[]
  top_brands: { brand_id: string; brand_name?: string; count: number }[]
  top_users: { user_email: string; count: number }[]
  generation_types: { generation_type: string; sub_category?: string; count: number; percentage: number }[]
  grouped_questions?: BrandGroup[]
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json())

function BrandQuestionGroup({ group }: { group: BrandGroup }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <div 
        className="bg-gray-50 px-6 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          {isOpen ? <ChevronDown className="h-4 w-4 mr-2 text-gray-500" /> : <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />}
          <span className="font-medium text-gray-900">{group.brand_name}</span>
          <span className="ml-2 text-xs text-gray-500">({group.brand_id})</span>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {group.count} questions
        </span>
      </div>
      
      {isOpen && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question & Answer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Tools</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {group.questions.map((q) => (
              <tr key={q.span_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                  {new Date(q.start_time).toLocaleString('zh-CN')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 align-top">
                  <div className="mb-2 max-h-32 overflow-y-auto">
                    <span className="font-medium text-blue-600">Q: </span>
                    {q.question}
                  </div>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded text-xs whitespace-pre-wrap max-h-48 overflow-y-auto">
                    <span className="font-medium text-green-600">A: </span>
                    {q.answer || '(No answer)'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 align-top">
                  {q.tool_calls && q.tool_calls.length > 0 ? (
                    <div className="space-y-1">
                      {q.tool_calls.map((tool, idx) => (
                        <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          <div className="font-medium">{tool.name}</div>
                          {tool.args && (
                            <div className="text-gray-400 truncate max-w-[150px]">
                              {JSON.stringify(tool.args)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

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
  }, [])

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

  const loading = !stats && !statsError
  const statsLoading = !stats && !statsError

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Questions Analysis
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Quick Select</label>
               <select 
                 className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900"
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
               <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
               <DateRangePicker 
                 startDate={startDate} 
                 endDate={endDate} 
                 onStartDateChange={(date) => handleDateChange('start', date)} 
                 onEndDateChange={(date) => handleDateChange('end', date)} 
               />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {statsError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">Failed to load statistics. The API returned an error.</p>
          </div>
        )}
        {statsLoading && (
          <div className="mb-8 bg-white shadow rounded-lg p-8 text-center text-gray-500">
            Loading statistics...
          </div>
        )}
        {stats && stats.daily_counts && stats.generation_types && stats.top_brands && stats.top_users && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Query Volume Trend</h3>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-1 border text-gray-900"
                >
                  <option value="all">All Sub-categories</option>
                  {stats.generation_types.map((type) => (
                    <option key={type.sub_category || type.generation_type} value={type.sub_category || type.generation_type}>
                      {type.sub_category || type.generation_type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: stats.daily_counts.map(d => d.date_beijing),
                    datasets: [{
                      label: 'Queries',
                      data: stats.daily_counts.map(d => d.count),
                      backgroundColor: 'rgba(59, 130, 246, 0.5)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>
            </div>

            {/* Generation Types */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sub-category Distribution</h3>
              <div className="h-64 flex justify-center">
                <Doughnut
                  data={{
                    labels: stats.generation_types.map((d) => {
                      const label = d.sub_category || d.generation_type
                      return `${label} (${d.percentage}%)`
                    }),
                    datasets: [{
                      data: stats.generation_types.map(d => d.count),
                      backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>

            {/* Top Brands */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Brands</h3>
              <div className="overflow-y-auto max-h-64">
                <ul className="divide-y divide-gray-200">
                  {stats.top_brands.map((b) => (
                    <li key={b.brand_id} className="py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{b.brand_name || b.brand_id || 'Unknown'}</span>
                      <span className="text-sm text-gray-500">{b.count} questions</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Users</h3>
              <div className="overflow-y-auto max-h-64">
                <ul className="divide-y divide-gray-200">
                  {stats.top_users.map((u) => (
                    <li key={u.user_email} className="py-3 flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{u.user_email}</span>
                      <span className="text-sm text-gray-500">{u.count} questions</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Grouped Questions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Questions by Brand</h3>
          </div>
          {statsLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : stats?.grouped_questions && stats.grouped_questions.length > 0 ? (
            <div className="overflow-x-auto">
              {stats.grouped_questions.map((group) => (
                <BrandQuestionGroup key={group.brand_id} group={group} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No questions found for the selected period.</div>
          )}
        </div>
      </main>
    </div>
  )
}
