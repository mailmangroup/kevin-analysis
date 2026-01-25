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
  index?: number
}

export function HeroKPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  formatValue,
  annotation,
  index = 0,
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
    <div
      className="group relative bg-white rounded-2xl p-6 shadow-card card-hover overflow-hidden animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Subtle gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border border-primary-200/50" />
      </div>

      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          {icon && (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 flex items-center justify-center text-primary-600 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
              {displayValue}
            </span>
            {annotation && (
              <span className="text-xs font-medium text-slate-400 italic">
                {annotation}
              </span>
            )}
          </div>
        </div>

        {/* Trend */}
        {change !== undefined && (
          <div className="flex items-center gap-2.5">
            <span className={getTrendClass()}>
              {getTrendIcon()}
              {formatChange()}
            </span>
            <span className="text-xs text-slate-400 font-medium">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
