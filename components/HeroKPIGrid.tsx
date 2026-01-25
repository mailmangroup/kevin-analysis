'use client'

import { HeroKPICard } from './HeroKPICard'
import { Users, MessageSquare, FileText, Sparkles } from 'lucide-react'

interface MetricData {
  dau?: number
  question_answering_count?: number
  report_generation_count?: number
  content_generation_count?: number
}

interface HeroKPIGridProps {
  metrics: MetricData[]
  previousMetrics?: MetricData[]
}

export function HeroKPIGrid({ metrics, previousMetrics }: HeroKPIGridProps) {
  // Calculate totals for current period
  const totalDAU = metrics.reduce((sum, m) => sum + (m.dau || 0), 0)
  const avgDAU = metrics.length > 0 ? Math.round(totalDAU / metrics.length) : 0
  const totalQuestions = metrics.reduce((sum, m) => sum + (m.question_answering_count || 0), 0)
  const totalReports = metrics.reduce((sum, m) => sum + (m.report_generation_count || 0), 0)
  const estimatedReports = Math.floor(totalReports / 10)
  const totalContent = metrics.reduce((sum, m) => sum + (m.content_generation_count || 0), 0)

  // Calculate totals for previous period (if provided)
  const prevTotalDAU = previousMetrics?.reduce((sum, m) => sum + (m.dau || 0), 0) || 0
  const prevAvgDAU = previousMetrics && previousMetrics.length > 0
    ? Math.round(prevTotalDAU / previousMetrics.length)
    : 0
  const prevTotalQuestions = previousMetrics?.reduce((sum, m) => sum + (m.question_answering_count || 0), 0) || 0
  const prevTotalReports = previousMetrics?.reduce((sum, m) => sum + (m.report_generation_count || 0), 0) || 0
  const prevEstimatedReports = Math.floor(prevTotalReports / 10)
  const prevTotalContent = previousMetrics?.reduce((sum, m) => sum + (m.content_generation_count || 0), 0) || 0

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number | undefined => {
    if (previous === 0) return current > 0 ? 100 : undefined
    return ((current - previous) / previous) * 100
  }

  const dauChange = previousMetrics ? calculateChange(avgDAU, prevAvgDAU) : undefined
  const questionsChange = previousMetrics ? calculateChange(totalQuestions, prevTotalQuestions) : undefined
  const reportsChange = previousMetrics ? calculateChange(estimatedReports, prevEstimatedReports) : undefined
  const contentChange = previousMetrics ? calculateChange(totalContent, prevTotalContent) : undefined

  return (
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
        title="Questions Answered"
        value={totalQuestions}
        change={questionsChange}
        changeLabel="vs previous period"
        icon={<MessageSquare className="w-5 h-5" />}
        index={1}
      />
      <HeroKPICard
        title="Reports Generated"
        value={estimatedReports}
        change={reportsChange}
        changeLabel="vs previous period"
        icon={<FileText className="w-5 h-5" />}
        annotation="estimated"
        index={2}
      />
      <HeroKPICard
        title="Content Generated"
        value={totalContent}
        change={contentChange}
        changeLabel="vs previous period"
        icon={<Sparkles className="w-5 h-5" />}
        index={3}
      />
    </div>
  )
}
