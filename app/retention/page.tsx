'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { fetchWithAuth } from '@/lib/api'

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

export default function RetentionPage() {
  const [data, setData] = useState<ProcessedCohort[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/phoenix/retention?period=${period}`)
        if (res.ok) {
          const rawData: RetentionRecord[] = await res.json()
          
          // Process raw data into Cohort structure
          const cohortsMap: { [key: string]: ProcessedCohort } = {}
          
          rawData.forEach(record => {
            if (!cohortsMap[record.cohort]) {
              cohortsMap[record.cohort] = {
                cohort: record.cohort,
                total_users: 0,
                periods: {}
              }
            }
            // If the activity period matches cohort, it's the base size (Week 0)
            if (record.activity_period === record.cohort) {
              cohortsMap[record.cohort].total_users = record.users
            }
            cohortsMap[record.cohort].periods[record.activity_period] = record.users
          })
          
          // Convert map to sorted array
          const sortedCohorts = Object.values(cohortsMap).sort((a, b) => b.cohort.localeCompare(a.cohort))
          setData(sortedCohorts)
        }
      } catch (error) {
        console.error('Error fetching retention data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  // Helper to get color intensity based on percentage
  const getBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-blue-800 text-white'
    if (percentage >= 60) return 'bg-blue-600 text-white'
    if (percentage >= 40) return 'bg-blue-400 text-white'
    if (percentage >= 20) return 'bg-blue-200 text-blue-900'
    if (percentage > 0) return 'bg-blue-100 text-blue-900'
    return 'bg-gray-50 text-gray-400'
  }

  // Get all unique periods (columns)
  // For simplicity, we just show relative columns: "Week 0", "Week 1", etc.
  // But since we have absolute dates, let's map them.
  // Actually, standard cohort tables use "Month 0", "Month 1".
  // We need to calculate the index difference.
  
  const getPeriodIndex = (cohort: string, activity: string) => {
    // This is rough approximation for display index
    // Assuming format YYYY-WW or YYYY-MM
    // Proper way requires parsing dates.
    // Let's keep it simple: just list actual dates in header? No, that's diagonal.
    // Let's try to calculate offset.
    return 0; // Placeholder if we did relative.
  }

  // To render a proper cohort table, we need to normalize columns to 0, 1, 2...
  // But our backend returns absolute periods.
  // Let's just list the activity periods for now, or better:
  // Dynamically generate column headers based on max duration.
  
  // Revised approach: Just show absolute dates for now? No, that's hard to read.
  // Let's calculate relative index on client.
  
  const calculateRelativeCohorts = (cohorts: ProcessedCohort[]) => {
    return cohorts.map(c => {
      // Sort periods for this cohort
      const periods = Object.keys(c.periods).sort()
      
      // Calculate offsets
      const relativeData: number[] = []
      
      // We need a reliable way to count diff.
      // Since format is standard (YYYY-WW or YYYY-MM), we can parse.
      const parse = (s: string) => {
          const parts = s.split('-').map(Number)
          if (period === 'week') {
              // Approximate week number absolute
              return parts[0] * 52 + parts[1]
          } else {
              return parts[0] * 12 + parts[1]
          }
      }
      
      const start = parse(c.cohort)
      
      // Find max offset in this cohort
      let maxOffset = 0;
      Object.keys(c.periods).forEach(p => {
          const diff = parse(p) - start
          if (diff > maxOffset) maxOffset = diff
      })
      
      // Fill array
      const offsets = new Array(maxOffset + 1).fill(0)
      Object.entries(c.periods).forEach(([p, count]) => {
          const diff = parse(p) - start
          if (diff >= 0) offsets[diff] = count
      })
      
      return { ...c, relativeData }
    })
  }

  const processedData = calculateRelativeCohorts(data)
  const maxColumns = Math.max(...processedData.map(d => d.relativeData.length), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            User Retention
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>

        <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 border-r">
                    Cohort
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    Users
                  </th>
                  {Array.from({ length: Math.min(maxColumns, 12) }).map((_, i) => (
                    <th key={i} className="px-4 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {period === 'week' ? 'Week' : 'Month'} {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedData.map((row) => (
                  <tr key={row.cohort}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white border-r">
                      {row.cohort}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-r bg-gray-50">
                      {row.total_users}
                    </td>
                    {row.relativeData.slice(0, 12).map((count, i) => {
                      // Calculate percentage
                      const percentage = row.total_users > 0 ? Math.round((count / row.total_users) * 100) : 0
                      return (
                        <td key={i} className={`px-2 py-4 whitespace-nowrap text-xs text-center ${getBgColor(percentage)}`}>
                          {percentage > 0 ? `${percentage}%` : '-'}
                          <div className="text-[10px] opacity-75">{count > 0 ? count : ''}</div>
                        </td>
                      )
                    })}
                    {/* Fill remaining cells if row is shorter than header */}
                    {Array.from({ length: Math.max(0, Math.min(maxColumns, 12) - row.relativeData.length) }).map((_, i) => (
                      <td key={`empty-${i}`} className="px-2 py-4 whitespace-nowrap text-xs text-center bg-gray-50">
                        -
                      </td>
                    ))}
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
