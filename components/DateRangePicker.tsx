'use client'

import { useState, useEffect } from 'react'

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
  return (
    <div className="flex h-10 items-center space-x-4 rounded-md bg-white px-2 ring-1 ring-inset ring-slate-300 shadow-sm">
      <div className="flex items-center space-x-2">
        <label htmlFor="start-date" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          From
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="block w-full h-8 rounded-md border-0 bg-white px-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        />
      </div>
      <div className="h-4 w-px bg-slate-200" />
      <div className="flex items-center space-x-2">
        <label htmlFor="end-date" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          To
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="block w-full h-8 rounded-md border-0 bg-white px-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  )
}
