'use client'

import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/lib/store/language-store'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const { t } = useLanguageStore()
  return (
    <div className="flex h-11 items-center gap-3 rounded-xl bg-white px-4 ring-1 ring-inset ring-slate-200 hover:ring-slate-300 shadow-sm hover:shadow transition-all">
      <div className="flex items-center gap-3 flex-1">
        <label htmlFor="start-date" className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          {t('date.from')}
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="block w-full h-9 rounded-lg border-0 bg-slate-50 hover:bg-white px-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:bg-white sm:text-sm transition-all font-medium cursor-pointer"
        />
      </div>
      <div className="h-6 w-px bg-slate-200" />
      <div className="flex items-center gap-3 flex-1">
        <label htmlFor="end-date" className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          {t('date.to')}
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="block w-full h-9 rounded-lg border-0 bg-slate-50 hover:bg-white px-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 focus:bg-white sm:text-sm transition-all font-medium cursor-pointer"
        />
      </div>
    </div>
  )
}
