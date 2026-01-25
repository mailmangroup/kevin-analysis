'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HeroKPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  formatValue?: (value: number) => string
  annotation?: string
}

export function HeroKPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  formatValue,
  annotation,
}: HeroKPICardProps) {
  const displayValue = typeof value === 'number' && formatValue
    ? formatValue(value)
    : typeof value === 'number'
      ? value.toLocaleString()
      : value

  const getTrendClass = () => {
    if (change === undefined || change === 0) return 'trend-neutral'
    return change > 0 ? 'trend-up' : 'trend-down'
  }

  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-3 h-3" />
    }
    return change > 0
      ? <TrendingUp className="w-3 h-3" />
      : <TrendingDown className="w-3 h-3" />
  }

  const formatChange = () => {
    if (change === undefined) return null
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-kpi card-hover">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            {icon}
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-slate-900 tracking-tight">
            {displayValue}
          </span>
          {annotation && (
            <span className="text-xs font-medium text-slate-400 italic">
              {annotation}
            </span>
          )}
        </div>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={getTrendClass()}>
            {getTrendIcon()}
            {formatChange()}
          </span>
          <span className="text-xs text-slate-400">{changeLabel}</span>
        </div>
      )}
    </div>
  )
}
