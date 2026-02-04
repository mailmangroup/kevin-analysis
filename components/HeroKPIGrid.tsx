'use client'

import { HeroKPICard } from './HeroKPICard'
import { Users, MessageSquare, FileText, Sparkles } from 'lucide-react'

interface MetricData {
  dau?: number
  question_answering_count?: number
  report_generation_count?: number
  content_generation_count?: number
  
  // User metrics
  question_answering_users?: number
  report_generation_users?: number
  content_generation_users?: number
  
  // Subcategories
  sub_categories?: Record<string, { count: number; users: number }>
  
  is_recorded?: boolean
}

interface HeroKPIGridProps {
  metrics: MetricData[]
  previousMetrics?: MetricData[]
  mode?: 'count' | 'users'
}

export function HeroKPIGrid({ metrics, previousMetrics, mode = 'count' }: HeroKPIGridProps) {
  // Check if previous period has valid recorded data
  const isComparisonValid = previousMetrics && previousMetrics.length > 0 && previousMetrics.every(m => m.is_recorded !== false)

  // Helper to sum metric fields
  const sumMetric = (data: MetricData[], field: keyof MetricData) => 
    data.reduce((sum, m) => sum + ((m[field] as number) || 0), 0)

  // Helper to sum subcategory fields
  const sumSubCategory = (data: MetricData[], subCat: string, type: 'count' | 'users') => 
    data.reduce((sum, m) => sum + (m.sub_categories?.[subCat]?.[type] || 0), 0)

  // --- Main Metrics Calculation ---
  
  // DAU is special: it's always "Avg Daily Users" regardless of mode (since it's user-based)
  // OR we could interpret "Total Counts" as "Total Sessions" if we had that data.
  // For now, let's keep DAU as is for the first card.
  const totalDAU = sumMetric(metrics, 'dau')
  const avgDAU = metrics.length > 0 ? Math.round(totalDAU / metrics.length) : 0
  const prevTotalDAU = previousMetrics ? sumMetric(previousMetrics, 'dau') : 0
  const prevAvgDAU = previousMetrics && previousMetrics.length > 0
    ? Math.round(prevTotalDAU / previousMetrics.length)
    : 0

  // Questions
  const totalQuestions = mode === 'count' 
    ? sumMetric(metrics, 'question_answering_count')
    : sumMetric(metrics, 'question_answering_users')
  const prevTotalQuestions = previousMetrics 
    ? (mode === 'count' ? sumMetric(previousMetrics, 'question_answering_count') : sumMetric(previousMetrics, 'question_answering_users'))
    : 0

  // Reports
  // Note: Backend returns raw generation count. "Reports Generated" card previously showed "estimated" (count / 10).
  // If mode is 'users', we should probably just show unique users who generated reports.
  const rawReports = mode === 'count'
    ? sumMetric(metrics, 'report_generation_count')
    : sumMetric(metrics, 'report_generation_users')
  
  // Apply estimation logic only for counts? The original code did `Math.floor(totalReports / 10)`.
  // If we are counting users, we shouldn't divide by 10.
  const displayReports = mode === 'count' ? Math.floor(rawReports / 10) : rawReports
  
  const prevRawReports = previousMetrics
    ? (mode === 'count' ? sumMetric(previousMetrics, 'report_generation_count') : sumMetric(previousMetrics, 'report_generation_users'))
    : 0
  const prevDisplayReports = mode === 'count' ? Math.floor(prevRawReports / 10) : prevRawReports

  // Content
  const totalContent = mode === 'count'
    ? sumMetric(metrics, 'content_generation_count')
    : sumMetric(metrics, 'content_generation_users')
  const prevTotalContent = previousMetrics
    ? (mode === 'count' ? sumMetric(previousMetrics, 'content_generation_count') : sumMetric(previousMetrics, 'content_generation_users'))
    : 0

  // --- Subcategories Calculation ---
  // Identify all unique subcategories present in current or previous data
  const allSubCats = new Set<string>()
  metrics.forEach(m => m.sub_categories && Object.keys(m.sub_categories).forEach(k => allSubCats.add(k)))
  // previousMetrics?.forEach(m => m.sub_categories && Object.keys(m.sub_categories).forEach(k => allSubCats.add(k)))
  
  // Calculate totals for each subcategory
  const subCatMetrics = Array.from(allSubCats).map(sub => {
    const current = sumSubCategory(metrics, sub, mode)
    const previous = previousMetrics ? sumSubCategory(previousMetrics, sub, mode) : 0
    return {
      name: sub,
      current,
      previous
    }
  }).sort((a, b) => b.current - a.current) // Sort by volume desc

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number | undefined => {
    if (previous === 0) return current > 0 ? 100 : undefined
    return ((current - previous) / previous) * 100
  }

  const dauChange = isComparisonValid ? calculateChange(avgDAU, prevAvgDAU) : undefined
  const questionsChange = isComparisonValid ? calculateChange(totalQuestions, prevTotalQuestions) : undefined
  const reportsChange = isComparisonValid ? calculateChange(displayReports, prevDisplayReports) : undefined
  const contentChange = isComparisonValid ? calculateChange(totalContent, prevTotalContent) : undefined

  return (
    <div className="space-y-8">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <HeroKPICard
          title="Avg Daily Users"
          value={avgDAU}
          change={dauChange}
          changeLabel="vs previous period"
          icon={<Users className="w-5 h-5" />}
          index={0}
        />
        <HeroKPICard
          title={mode === 'count' ? "Questions Answered" : "Users Asking Questions"}
          value={totalQuestions}
          change={questionsChange}
          changeLabel="vs previous period"
          icon={<MessageSquare className="w-5 h-5" />}
          index={1}
        />
        <HeroKPICard
          title={mode === 'count' ? "Reports Generated" : "Users Generating Reports"}
          value={displayReports}
          change={reportsChange}
          changeLabel="vs previous period"
          icon={<FileText className="w-5 h-5" />}
          annotation={mode === 'count' ? "estimated" : undefined}
          index={2}
        />
        <HeroKPICard
          title={mode === 'count' ? "Content Generated" : "Users Generating Content"}
          value={totalContent}
          change={contentChange}
          changeLabel="vs previous period"
          icon={<Sparkles className="w-5 h-5" />}
          index={3}
        />
      </div>

      {/* Subcategories Section */}
      {subCatMetrics.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
            Question Categories Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {subCatMetrics.map((sub, i) => {
              const change = isComparisonValid ? calculateChange(sub.current, sub.previous) : undefined
              return (
                <HeroKPICard
                  key={sub.name}
                  title={sub.name.charAt(0).toUpperCase() + sub.name.slice(1)}
                  value={sub.current}
                  change={change}
                  changeLabel="vs previous period"
                  // Using a generic icon for subcategories or specific if known
                  icon={<div className="w-2 h-2 rounded-full bg-primary-400" />} 
                  index={i + 4}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
