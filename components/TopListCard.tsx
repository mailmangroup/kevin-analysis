import { TopItem } from './TopLists'
import { useLanguageStore } from '@/lib/store/language-store'

interface TopListCardProps {
  title: string
  icon: string
  items?: TopItem[]
  loading: boolean
  emptyText?: string
  getItemLabel: (item: TopItem) => string
  isReportType?: boolean
}

export function TopListCard({ 
  title, 
  icon, 
  items, 
  loading, 
  emptyText,
  getItemLabel,
  isReportType = false
}: TopListCardProps) {
  const { t } = useLanguageStore()
  const displayEmptyText = emptyText || t('toplist.noData')

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 h-full">
      <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span className="text-lg">{icon}</span> {title}
      </h3>
      <div className="space-y-3">
        {loading ? (
           [...Array(5)].map((_, i) => (
             <div key={i} className="flex justify-between animate-pulse">
               <div className="h-4 bg-slate-100 rounded w-1/2"></div>
               <div className="h-4 bg-slate-100 rounded w-8"></div>
             </div>
           ))
        ) : items && items.length > 0 ? (
          items.map((item, i) => {
            const displayCount = isReportType ? Math.round(item.count / 10) : item.count
            return (
              <div key={i} className="flex items-center justify-between text-sm group">
                <span className="text-slate-600 truncate max-w-[70%] group-hover:text-slate-900 transition-colors">
                  {getItemLabel(item)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md text-xs">
                    {displayCount.toLocaleString()}
                  </span>
                  {isReportType && (
                    <span className="text-[10px] text-slate-400 italic">{t('kpi.estimated')}</span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-sm text-slate-400 italic py-4 text-center">{displayEmptyText}</div>
        )}
      </div>
    </div>
  )
}
