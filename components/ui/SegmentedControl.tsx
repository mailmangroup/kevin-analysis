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
    <div className="inline-flex max-w-full items-center overflow-x-auto rounded-2xl border border-white/60 bg-slate-100/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-xl scrollbar-hide">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => !option.disabled && onChange(option.value)}
          disabled={option.disabled}
          aria-disabled={option.disabled}
          title={option.title}
          className={`
            relative whitespace-nowrap rounded-xl font-semibold transition-all duration-200
            ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
            ${value === option.value
              ? 'bg-white/95 text-primary-700 ring-1 ring-primary-200/80 shadow-sm'
              : option.disabled
                ? 'text-slate-300 cursor-not-allowed opacity-70'
                : 'text-slate-600 hover:bg-white/55 hover:text-slate-800'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
