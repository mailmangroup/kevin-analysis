'use client'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({ 
  options, 
  value, 
  onChange,
  size = 'md'
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-xl p-1.5 shadow-card ring-1 ring-slate-200/50 overflow-x-auto max-w-full scrollbar-hide">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            relative font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            ${value === option.value
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
