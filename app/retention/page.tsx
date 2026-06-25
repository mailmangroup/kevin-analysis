'use client'

import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import { useLanguageStore } from '@/lib/store/language-store'
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

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
})

// Simple Modal Component
function UserListModal({ isOpen, onClose, title, users, t }: { isOpen: boolean; onClose: () => void; title: string; users: LifecycleUser[]; t: (key: string) => string }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <div className="relative inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-slate-200">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl leading-6 font-bold text-slate-900" id="modal-title">
                  {title}
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {users && users.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {users.map((user, idx) => (
                      <li key={idx} className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg transition-colors">
                         <div className="flex flex-col text-left">
                            <span className="text-sm font-medium text-slate-900">{user.email}</span>
                            <span className="text-xs text-slate-500 mt-0.5">{user.brands || 'No Brand'}</span>
                         </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-500">{t('retention.noUsers')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-6">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm transition-colors"
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
  const { t } = useLanguageStore()
  const [period, setPeriod] = useState('week')
  const [maxPeriods, setMaxPeriods] = useState(0)
  const [genType, setGenType] = useState('')
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<LifecycleUser[]>([])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

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
  const lifecycleData = Array.isArray(lifecycleStats?.weekly_data) ? lifecycleStats.weekly_data : []

  const loading = cohortsLoading || lifecycleLoading

  // Process data for display (memoized)
  const data = useMemo(() => {
      const cohortsMap: { [key: string]: ProcessedCohort } = {}

      // Ensure rawData is an array
      if (!Array.isArray(rawData)) {
        return []
      }

      rawData.forEach(record => {
        // Skip records with null/undefined cohort
        if (!record?.cohort || record.cohort === 'undefined' || record.cohort === 'null') return

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

      return Object.values(cohortsMap)
        .filter(c => c.cohort && c.cohort !== 'undefined' && c.cohort !== 'null') // Filter out any entries with null/undefined cohort
        .sort((a, b) => (b.cohort || '').localeCompare(a.cohort || ''))
  }, [rawData])

  const globalLatestPeriod = useMemo(() => {
    if (!Array.isArray(rawData) || rawData.length === 0) return ''
    let latestPeriod = ''
    rawData.forEach(r => {
      if (!r?.cohort || r.cohort === 'undefined' || r.cohort === 'null') return
      if (r?.activity_period && r.activity_period > latestPeriod) latestPeriod = r.activity_period
    })
    return latestPeriod
  }, [rawData])

  // Update maxPeriods separately to avoid side-effect warnings
  useEffect(() => {
     if (!Array.isArray(rawData) || rawData.length === 0 || !globalLatestPeriod) return

     let maxIdx = 0
     rawData.forEach(record => {
        if (!record?.cohort || record.cohort === 'undefined' || record.cohort === 'null') return
        const diff = getDiff(record.cohort, globalLatestPeriod, period)
        if (diff > maxIdx) maxIdx = diff
     })
     
     // Cap the number of columns to improve UI/UX
     const MAX_COLUMNS = period === 'week' ? 24 : 12
     setMaxPeriods(Math.min(maxIdx, MAX_COLUMNS))
  }, [rawData, period, globalLatestPeriod])

  // Helper to get color intensity based on percentage - warm amber palette
  const getBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-amber-600 text-white'
    if (percentage >= 60) return 'bg-amber-500 text-white'
    if (percentage >= 40) return 'bg-amber-400 text-white'
    if (percentage >= 20) return 'bg-amber-200 text-amber-900'
    if (percentage > 0) return 'bg-amber-100 text-amber-900'
    return 'bg-gray-50 text-gray-400'
  }

  // Generate relative headers
  const columns = Array.from({ length: maxPeriods + 1 }, (_, i) => i)

  // Chart Data Preparation - improved lifecycle color gradient
  const chartData = {
    labels: lifecycleData.map((d: LifecycleWeek) => d.week),
    datasets: [
        {
            label: t('retention.newUsers'),
            data: lifecycleData.map((d: LifecycleWeek) => d.new),
            backgroundColor: 'rgba(250, 204, 21, 0.9)', // Bright yellow (#facc15)
        },
        {
            label: t('retention.activeUsers'),
            data: lifecycleData.map((d: LifecycleWeek) => d.active),
            backgroundColor: 'rgba(245, 158, 11, 0.9)', // Amber (#f59e0b)
        },
        {
            label: t('retention.resurrectedUsers'),
            data: lifecycleData.map((d: LifecycleWeek) => d.resurrected),
            backgroundColor: 'rgba(251, 146, 60, 0.9)', // Light orange (#fb923c)
        },
        {
            label: t('retention.atRiskUsers'),
            data: lifecycleData.map((d: LifecycleWeek) => -d.at_risk), // Negative for display below axis
            backgroundColor: 'rgba(249, 115, 22, 0.9)', // Orange (#f97316)
        },
        {
            label: t('retention.churnedUsers'),
            data: lifecycleData.map((d: LifecycleWeek) => -d.churned), // Negative
            backgroundColor: 'rgba(220, 38, 38, 0.9)', // Red (#dc2626)
        },
    ],
  }
  
  const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
          x: { stacked: true },
          y: { stacked: true },
      },
      plugins: {
          legend: {
              position: 'top' as const,
              align: 'center' as const,
          },
          title: {
              display: true,
              text: t('retention.lifecycleTitle'),
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
                label = t('retention.newUsers');
            } else if (datasetIndex === 1) {
                users = weekData.active_users || [];
                label = t('retention.activeUsers');
            } else if (datasetIndex === 2) {
                users = weekData.resurrected_users || [];
                label = t('retention.resurrectedUsers');
            } else if (datasetIndex === 3) {
                users = weekData.at_risk_users || [];
                label = t('retention.atRiskUsers');
            } else if (datasetIndex === 4) {
                users = weekData.churned_users || [];
                label = t('retention.churnedUsers');
            }
            
            setModalTitle(`${label} - ${weekData.week}`);
            setSelectedUsers(users);
            setIsModalOpen(true);
        }
      }
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <UserListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        users={selectedUsers}
        t={t}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10 animate-fade-in">
          <div className="md:flex md:items-end md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {t('retention.title')} <span className="text-gradient">{t('retention.subtitle')}</span>
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                User cohort retention and lifecycle analysis • All dates in Beijing Time (UTC+8)
              </p>
            </div>
            <div className="mt-5 md:mt-0">
              <button
                onClick={handleDownload}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t('retention.export')}
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">{t('retention.period')}</label>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="block w-full h-11 rounded-xl border-0 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 bg-white hover:bg-slate-50 transition-all sm:text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow"
                >
                  <option value="week">{t('chart.week')}</option>
                  <option value="month">{t('chart.month')}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">{t('retention.genType')}</label>
              <div className="relative">
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  className="block w-full h-11 rounded-xl border-0 pl-4 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-primary-500 bg-white hover:bg-slate-50 transition-all sm:text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow"
                >
                  <option value="">{t('retention.allTypes')}</option>
                  <option value="question_answering">{t('toplist.questions')}</option>
                  <option value="video_analysis">{t('retention.videoAnalysis')}</option>
                  <option value="report_qa">{t('retention.reportQA')}</option>
                  <option value="content_generation">{t('toplist.content')}</option>
                  <option value="report_generation">{t('toplist.reports')}</option>
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
        
        {/* Lifecycle Chart */}
        {period === 'week' && (
            <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold text-slate-900 mb-6">User Lifecycle Breakdown</h3>
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)', color: 'rgb(161, 98, 7)' }}>
                    🆕 New: first seen
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'rgb(180, 83, 9)' }}>
                    ✅ Active: retained
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)', color: 'rgb(194, 65, 12)' }}>
                    🔙 Resurrected: came back
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', color: 'rgb(154, 52, 18)' }}>
                    ⚠️ At-Risk: may churn
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: 'rgb(153, 27, 27)' }}>
                    ❌ Churned: gone 4+ weeks
                  </span>
                </div>
                <div className="h-96 w-full relative">
                    <Bar options={chartOptions} data={chartData} />
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <h3 className="text-lg font-semibold text-slate-900">Retention Cohorts ({period === 'week' ? 'Weekly' : 'Monthly'})</h3>
          </div>
          <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading retention data...</div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-20 w-32 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {t('retention.cohort')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-32 bg-slate-50 z-20 w-24 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {t('retention.totalUsers')}
                    </th>
                    {columns.map((col) => (
                       <th key={col} className="px-2 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[40px]" title={`${period === 'week' ? t('retention.week') : t('retention.month')} ${col} ${period === 'week' ? t('retention.weekSuffix') : t('retention.monthSuffix')}`}>
                         {period === 'week' ? 'W' : 'M'}{col}
                       </th>
                     ))}
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.map((cohort) => (
                  <tr key={cohort.cohort} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 sticky left-0 bg-white z-10 w-32 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {cohort.cohort}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 sticky left-32 bg-white z-10 w-24 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      {cohort.total_users}
                    </td>
                    {columns.map((col) => {
                      const periodKey = addPeriods(cohort.cohort, col, period)
                      const isFuturePeriod = globalLatestPeriod ? getDiff(periodKey, globalLatestPeriod, period) < 0 : true
                      const hasPeriodData = Object.prototype.hasOwnProperty.call(cohort.periods, periodKey)
                      const retained = hasPeriodData ? cohort.periods[periodKey] : 0
                      const percentage = cohort.total_users > 0 ? Math.round((retained / cohort.total_users) * 100) : 0
                      const bgColor = !isFuturePeriod && retained > 0 ? getBgColor(percentage) : 'bg-white'
                      const textColor = !isFuturePeriod && retained > 0 ? '' : 'text-slate-300'

                      return (
                        <td key={col} className={`px-2 py-4 whitespace-nowrap text-xs text-center border-r border-white/10 ${bgColor} ${textColor}`}>
                          {isFuturePeriod ? '-' : `${percentage}%`}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>
      </main>
    </div>
  )
}
