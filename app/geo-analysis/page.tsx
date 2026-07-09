'use client'

import { useState, useEffect, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import useSWR from 'swr'
import { fetchWithAuth } from '@/lib/api'
import { useUserStore } from '@/lib/store/user-store'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const fetcher = (url: string) => fetchWithAuth(url).then(res => {
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
})

const computeStats = (rawStatuses: Record<string, number> = {}) => {
  const successKeys = ['parsed', 'reparsed']
  const failedKeys = ['parse_failed', 'crawl_failed', 'expired', 'timeout', 'cancel', 'error']
  
  let success = 0
  let failed = 0
  let total = 0
  
  for (const [key, val] of Object.entries(rawStatuses)) {
    const num = Number(val) || 0
    total += num
    if (successKeys.includes(key)) {
      success += num
    } else if (failedKeys.includes(key) || key.includes('timeout') || key.includes('error') || key.includes('cancel')) {
      // Also catching partial matches for timeout/cancel/error as instructed "timeout/cancel/error statuses"
      failed += num
    }
  }
  
  const pending = total - success - failed
  return { success, pending, failed, total }
}

export default function GeoAnalysisPage() {
  const { profile } = useUserStore()
  const apiUrl = profile?.kawo_api_url
  
  const [filterDate, setFilterDate] = useState('')
  const [filterDeployment, setFilterDeployment] = useState('')
  const [filterOrg, setFilterOrg] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')

  // Note: Expecting the backend at /phoenix/geo/reports to return { rolling, daily }
  const { data, error, isLoading } = useSWR(
    apiUrl ? `${apiUrl}/phoenix/geo/reports` : null, 
    fetcher
  )

  const { rolling, daily } = data || {}
  const grandTotals = rolling?.grand_totals || { total: 0, success: 0, pending: 0, failed: 0 }
  const successRate = grandTotals.total > 0 ? ((grandTotals.success / grandTotals.total) * 100).toFixed(1) : 0

  const drilldownRows = useMemo(() => {
    if (!daily) return []
    const rows: any[] = []
    daily.forEach((day: any) => {
      day.targets?.forEach((target: any) => {
        target.details?.forEach((detail: any) => {
          const stats = detail.raw_statuses ? computeStats(detail.raw_statuses) : {
            success: detail.success || 0,
            pending: detail.pending || 0,
            failed: detail.failed || 0,
            total: (detail.success || 0) + (detail.pending || 0) + (detail.failed || 0)
          }
          rows.push({
            date: day.date,
            deployment: target.name,
            org: detail.org_name,
            project: detail.project_name,
            platform: detail.platform,
            stats
          })
        })
      })
    })
    return rows
  }, [daily])

  const filteredDrilldownRows = useMemo(() => {
    return drilldownRows.filter(row => {
      const matchDate = !filterDate || row.date === filterDate
      const matchDep = !filterDeployment || row.deployment === filterDeployment
      const matchOrg = !filterOrg || row.org === filterOrg
      const matchProj = !filterProject || row.project === filterProject
      const matchPlat = !filterPlatform || row.platform === filterPlatform
      return matchDate && matchDep && matchOrg && matchProj && matchPlat
    })
  }, [drilldownRows, filterDate, filterDeployment, filterOrg, filterProject, filterPlatform])

  const availableDates = useMemo(() => {
    if (!daily) return []
    return Array.from(new Set(daily.map((d: any) => d.date)))
  }, [daily])

  const availableDeployments = useMemo(() => Array.from(new Set(drilldownRows.map(r => r.deployment))).filter(Boolean).sort(), [drilldownRows])
  const availableOrgs = useMemo(() => Array.from(new Set(drilldownRows.map(r => r.org))).filter(Boolean).sort(), [drilldownRows])
  const availableProjects = useMemo(() => Array.from(new Set(drilldownRows.map(r => r.project))).filter(Boolean).sort(), [drilldownRows])
  const availablePlatforms = useMemo(() => Array.from(new Set(drilldownRows.map(r => r.platform))).filter(Boolean).sort(), [drilldownRows])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-10"></div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-mesh">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
          <div className="text-red-500">Failed to load GEO data.</div>
        </main>
      </div>
    )
  }

  const kpis = [
    { label: 'Total', value: grandTotals.total, color: 'text-slate-900' },
    { label: 'Success', value: grandTotals.success, color: 'text-green-600' },
    { label: 'Pending', value: grandTotals.pending, color: 'text-amber-500' },
    { label: 'Failed', value: grandTotals.failed, color: 'text-red-600' },
    { label: 'Success Rate', value: `${successRate}%`, color: 'text-blue-600' },
  ]

  // Chart data
  const chartLabels = rolling?.daily_reports?.map((r: any) => r.date) || []
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Success',
        data: rolling?.daily_reports?.map((r: any) => r.grand_totals?.success || 0) || [],
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        tension: 0.3,
      },
      {
        label: 'Pending',
        data: rolling?.daily_reports?.map((r: any) => r.grand_totals?.pending || 0) || [],
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.3,
      },
      {
        label: 'Failed',
        data: rolling?.daily_reports?.map((r: any) => r.grand_totals?.failed || 0) || [],
        borderColor: '#dc2626',
        backgroundColor: '#dc2626',
        tension: 0.3,
      }
    ]
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            GEO Run Payload <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500">
            7-day rolling window summary of run payloads across deployments. Data computed daily at 09:30.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Per Deployment Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">Per Deployment (Last 7 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Deployment</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right text-green-600">Success</th>
                  <th className="px-6 py-3 text-right text-amber-500">Pending</th>
                  <th className="px-6 py-3 text-right text-red-600">Failed</th>
                  <th className="px-6 py-3 text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolling?.targets?.map((target: any, idx: number) => {
                  const t = target.raw_statuses ? computeStats(target.raw_statuses) : (target.totals || { total: 0, success: 0, pending: 0, failed: 0 })
                  const rate = t.total > 0 ? ((t.success / t.total) * 100).toFixed(1) : 0
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{target.name}</td>
                      <td className="px-6 py-4 text-right">{t.total}</td>
                      <td className="px-6 py-4 text-right text-green-600">{t.success}</td>
                      <td className="px-6 py-4 text-right text-amber-500">{t.pending}</td>
                      <td className="px-6 py-4 text-right text-red-600">{t.failed}</td>
                      <td className="px-6 py-4 text-right">{rate}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">7-Day Trend</h2>
          <div className="h-72">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
              }} 
            />
          </div>
        </div>

        {/* Drilldown Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 whitespace-nowrap">Daily Drilldown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full lg:w-auto lg:flex-1 lg:max-w-4xl lg:justify-end">
              <select
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <option value="">Date (All)</option>
                {availableDates.map(date => (
                  <option key={date as string} value={date as string}>{date as string}</option>
                ))}
              </select>
              <select
                value={filterDeployment}
                onChange={e => setFilterDeployment(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <option value="">Deployment (All)</option>
                {availableDeployments.map(dep => (
                  <option key={dep as string} value={dep as string}>{dep as string}</option>
                ))}
              </select>
              <select
                value={filterOrg}
                onChange={e => setFilterOrg(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <option value="">Org (All)</option>
                {availableOrgs.map(org => (
                  <option key={org as string} value={org as string}>{org as string}</option>
                ))}
              </select>
              <select
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <option value="">Project (All)</option>
                {availableProjects.map(proj => (
                  <option key={proj as string} value={proj as string}>{proj as string}</option>
                ))}
              </select>
              <select
                value={filterPlatform}
                onChange={e => setFilterPlatform(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-700 shadow-sm transition-all hover:border-slate-300 cursor-pointer"
              >
                <option value="">Platform (All)</option>
                {availablePlatforms.map(plat => (
                  <option key={plat as string} value={plat as string}>{plat as string}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0 shadow-sm">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Deployment</th>
                  <th className="px-6 py-3">Org</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Platform</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-right text-green-600">Success</th>
                  <th className="px-6 py-3 text-right text-amber-500">Pending</th>
                  <th className="px-6 py-3 text-right text-red-600">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrilldownRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 whitespace-nowrap text-slate-500">{row.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-900">{row.deployment}</td>
                    <td className="px-6 py-3 whitespace-nowrap max-w-[150px] truncate" title={row.org}>{row.org}</td>
                    <td className="px-6 py-3 whitespace-nowrap max-w-[200px] truncate" title={row.project}>{row.project}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{row.platform}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right">{row.stats.total}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-green-600">{row.stats.success}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-amber-500">{row.stats.pending}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-right text-red-600">{row.stats.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
