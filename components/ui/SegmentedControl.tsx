'use client'

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string; disabled?: boolean; title?: string }[]
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
    <div className="inline-flex items-center rounded-2xl p-1 bg-slate-100/90 ring-1 ring-slate-200/80 overflow-x-auto max-w-full scrollbar-hide">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !option.disabled && onChange(option.value)}
          disabled={option.disabled}
          aria-disabled={option.disabled}
          title={option.title}
          className={`
            relative font-semibold rounded-xl transition-all duration-200 whitespace-nowrap
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            ${value === option.value
              ? 'bg-white text-primary-700 ring-1 ring-primary-200 shadow-sm'
              : option.disabled
                ? 'text-slate-300 cursor-not-allowed opacity-70'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
