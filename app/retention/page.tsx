'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
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

interface RetentionRecord {
  cohort: string
  activity_period: string
  users: number
}

interface ProcessedCohort {
  cohort: string
  total_users: number
  periods: { [period: string]: number }
}

interface LifecycleUser {
  email: string
  brands: string
}

interface LifecycleWeek {
  week: string
  new: number
  active: number
  resurrected: number
  at_risk: number
  churned: number
  new_users?: LifecycleUser[]
  active_users?: LifecycleUser[]
  resurrected_users?: LifecycleUser[]
  at_risk_users?: LifecycleUser[]
  churned_users?: LifecycleUser[]
}

const fetcher = (url: string) => fetchWithAuth(url).then(res => res.json())

// Simple Modal Component
function UserListModal({ isOpen, onClose, title, users }: { isOpen: boolean; onClose: () => void; title: string; users: LifecycleUser[] }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {title}
              </h3>
              <div className="mt-4 max-h-96 overflow-y-auto">
                {users && users.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {users.map((user, idx) => (
                      <li key={idx} className="py-3 flex justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{user.email}</span>
                            <span className="text-xs text-gray-500">{user.brands || 'No Brand'}</span>
                         </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No users found for this segment.</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RetentionPage() {
  const { profile, fetchProfile } = useUserStore()
  const [period, setPeriod] = useState('week')
  const [maxPeriods, setMaxPeriods] = useState(0)
  const [genType, setGenType] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<LifecycleUser[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleDownload = async () => {
    if (!profile?.kawo_api_url) return

    const params = new URLSearchParams({ period })
    const url = `${profile.kawo_api_url}/phoenix/retention/export?${params.toString()}`

    try {
        // Use fetchWithAuth helper which handles token correctly
        const response = await fetchWithAuth(url)

        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`)
        }

        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `retention_by_type_${new Date().toISOString().slice(0,10)}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
    } catch (e) {
        console.error('Download error:', e)
        alert(`Failed to download CSV: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  const getDiff = (start: string, current: string, periodType: string): number => {
    const [y1, p1] = start.split('-').map((val) => {
        // Handle "W" prefix for weeks like "2024-W01" -> "2024-01" logic or strip W
        return parseInt(val.replace('W', ''), 10)
    })
    const [y2, p2] = current.split('-').map((val) => parseInt(val.replace('W', ''), 10))

    if (periodType === 'week') {
      // Approximate difference (ignoring 53 weeks complexity for now)
      // Note: This is simplified. Ideally we use date objects.
      return (y2 - y1) * 52 + (p2 - p1)
    } else {
      // Monthly
      return (y2 - y1) * 12 + (p2 - p1)
    }
  }

  const addPeriods = (cohortStr: string, offset: number, periodType: string): string => {
    const [yearStr, periodStr] = cohortStr.split('-')
    const year = parseInt(yearStr, 10)
    const periodNum = parseInt(periodStr.replace('W', ''), 10)

    if (periodType === 'week') {
      let newYear = year
      let newWeek = periodNum + offset

      // Handle year overflow (simplified - assumes 52 weeks per year)
      while (newWeek > 52) {
        newWeek -= 52
        newYear += 1
      }

      return `${newYear}-W${String(newWeek).padStart(2, '0')}`
    } else {
      // Monthly
      let newYear = year
      let newMonth = periodNum + offset

      while (newMonth > 12) {
        newMonth -= 12
        newYear += 1
      }

      return `${newYear}-${String(newMonth).padStart(2, '0')}`
    }
  }

  // SWR fetching
  const params = new URLSearchParams({ period })
  if (genType) params.append('generation_type', genType)
  const qs = params.toString()

  const apiUrl = profile?.kawo_api_url
  const { data: rawData = [], isLoading: cohortsLoading } = useSWR<RetentionRecord[]>(
    apiUrl ? `${apiUrl}/phoenix/retention?${qs}` : null,
    fetcher
  )

  const { data: lifecycleStats, isLoading: lifecycleLoading } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/retention/lifecycle?${qs}` : null,
    fetcher
  )
  const lifecycleData = lifecycleStats?.weekly_data || []

  const loading = cohortsLoading || lifecycleLoading

  // Process data for display (memoized)
  const data = useMemo(() => {
      const cohortsMap: { [key: string]: ProcessedCohort } = {}
      
      rawData.forEach(record => {
        if (!cohortsMap[record.cohort]) {
          cohortsMap[record.cohort] = {
            cohort: record.cohort,
            total_users: 0,
            periods: {}
          }
        }
        
        if (record.activity_period === record.cohort) {
          cohortsMap[record.cohort].total_users = record.users
        }
        
        cohortsMap[record.cohort].periods[record.activity_period] = record.users
      })
      
      return Object.values(cohortsMap).sort((a, b) => b.cohort.localeCompare(a.cohort))
  }, [rawData])

  // Update maxPeriods separately to avoid side-effect warnings
  useEffect(() => {
     if (rawData.length === 0) return

     // Find the latest activity period across ALL data
     // This ensures that even if a specific cohort stopped having activity,
     // we still show columns up to the current date (represented by latest activity)
     let globalLatestPeriod = ''
     rawData.forEach(r => {
        if (r.activity_period > globalLatestPeriod) globalLatestPeriod = r.activity_period
     })

     let maxIdx = 0
     rawData.forEach(record => {
        // Calculate diff between cohort and the GLOBAL latest period
        const diff = getDiff(record.cohort, globalLatestPeriod, period)
        if (diff > maxIdx) maxIdx = diff
     })
     setMaxPeriods(maxIdx)
  }, [rawData, period])

  // Helper to get color intensity based on percentage
  const getBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-blue-800 text-white'
    if (percentage >= 60) return 'bg-blue-600 text-white'
    if (percentage >= 40) return 'bg-blue-400 text-white'
    if (percentage >= 20) return 'bg-blue-200 text-blue-900'
    if (percentage > 0) return 'bg-blue-100 text-blue-900'
    return 'bg-gray-50 text-gray-400'
  }

  // Generate relative headers
  const columns = Array.from({ length: maxPeriods + 1 }, (_, i) => i)

  // Chart Data Preparation
  const chartData = {
    labels: lifecycleData.map((d: LifecycleWeek) => d.week),
    datasets: [
        {
            label: 'New',
            data: lifecycleData.map((d: LifecycleWeek) => d.new),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
            label: 'Active',
            data: lifecycleData.map((d: LifecycleWeek) => d.active),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
        },
        {
            label: 'Resurrected',
            data: lifecycleData.map((d: LifecycleWeek) => d.resurrected),
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
        },
        {
            label: 'At-Risk',
            data: lifecycleData.map((d: LifecycleWeek) => -d.at_risk), // Negative for display below axis
            backgroundColor: 'rgba(255, 206, 86, 0.7)',
        },
        {
            label: 'Churned',
            data: lifecycleData.map((d: LifecycleWeek) => -d.churned), // Negative
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
        },
    ],
  }
  
  const chartOptions = {
      responsive: true,
      scales: {
          x: { stacked: true },
          y: { stacked: true },
      },
      plugins: {
          title: {
              display: true,
              text: 'User Lifecycle (Weekly)',
          },
          tooltip: {
              callbacks: {
                  label: function(context: any) {
                      let label = context.dataset.label || '';
                      if (label) {
                          label += ': ';
                      }
                      if (context.parsed.y !== null) {
                          label += Math.abs(context.parsed.y);
                      }
                      return label;
                  }
              }
          }
      },
      onClick: (_event: any, elements: any[]) => {
        if (elements && elements.length > 0) {
            const element = elements[0];
            const datasetIndex = element.datasetIndex;
            const index = element.index;
            
            const weekData = lifecycleData[index];
            if (!weekData) return;
            
            // Map dataset index to user list
            // 0: New, 1: Active, 2: Resurrected, 3: At-Risk (negative), 4: Churned (negative)
            let users: LifecycleUser[] = [];
            let label = '';
            
            if (datasetIndex === 0) {
                users = weekData.new_users || [];
                label = 'New Users';
            } else if (datasetIndex === 1) {
                users = weekData.active_users || [];
                label = 'Active Users';
            } else if (datasetIndex === 2) {
                users = weekData.resurrected_users || [];
                label = 'Resurrected Users';
            } else if (datasetIndex === 3) {
                users = weekData.at_risk_users || [];
                label = 'At-Risk Users';
            } else if (datasetIndex === 4) {
                users = weekData.churned_users || [];
                label = 'Churned Users';
            }
            
            setModalTitle(`${label} - ${weekData.week}`);
            setSelectedUsers(users);
            setIsModalOpen(true);
        }
      }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <UserListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalTitle} 
        users={selectedUsers} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Retention Analysis
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              User cohort retention and lifecycle analysis • All dates in Beijing Time (UTC+8)
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Download CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generation Type</label>
              <select
                value={genType}
                onChange={(e) => setGenType(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border text-gray-900"
              >
                <option value="">All Features</option>
                <option value="question_answering">Question Answering</option>
                <option value="video_analysis">Video Analysis</option>
                <option value="report_qa">Report QA</option>
                <option value="content_generation">Content Generation</option>
                <option value="report_generation">Report Generation</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Lifecycle Chart */}
        {period === 'week' && (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="new">🆕</span>
                    <span className="font-semibold text-gray-900">New:</span>
                    <span className="text-gray-600">first seen</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="active">✅</span>
                    <span className="font-semibold text-gray-900">Active:</span>
                    <span className="text-gray-600">retained from last week</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="resurrected">🔙</span>
                    <span className="font-semibold text-gray-900">Resurrected:</span>
                    <span className="text-gray-600">came back</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="at-risk">⚠️</span>
                    <span className="font-semibold text-gray-900">At-Risk:</span>
                    <span className="text-gray-600">may churn</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span role="img" aria-label="churned">❌</span>
                    <span className="font-semibold text-gray-900">Churned:</span>
                    <span className="text-gray-600">gone 4+ weeks</span>
                  </div>
                </div>
                <Bar options={chartOptions} data={chartData} height={100} />
            </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-32">
                    Cohort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10 w-24 border-r">
                    Users
                  </th>
                  {columns.map((col) => (
                    <th key={col} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[50px]">
                      {period === 'week' ? 'W' : 'M'}{col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((cohort) => (
                  <tr key={cohort.cohort}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 w-32">
                      {cohort.cohort}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 sticky left-32 bg-white z-10 w-24 border-r">
                      {cohort.total_users}
                    </td>
                    {columns.map((col) => {
                      // Convert column index to actual period string
                      const periodKey = addPeriods(cohort.cohort, col, period)
                      const retained = cohort.periods[periodKey] || 0
                      const percentage = cohort.total_users > 0 ? Math.round((retained / cohort.total_users) * 100) : 0
                      const bgColor = retained > 0 ? getBgColor(percentage) : 'bg-white'
                      const textColor = retained > 0 ? '' : 'text-gray-300'

                      return (
                        <td key={col} className={`px-2 py-4 whitespace-nowrap text-xs text-center ${bgColor} ${textColor}`}>
                          {retained > 0 ? `${percentage}%` : ''}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
