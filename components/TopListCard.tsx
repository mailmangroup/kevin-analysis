import { TopItem } from './TopLists'

interface TopListCardProps {
  title: string
  icon: string
  items?: TopItem[]
  loading: boolean
  emptyText?: string
  getItemLabel: (item: TopItem) => string
}

export function TopListCard({ 
  title, 
  icon, 
  items, 
  loading, 
  emptyText = "No data available",
  getItemLabel 
}: TopListCardProps) {
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
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm group">
              <span className="text-slate-600 truncate max-w-[70%] group-hover:text-slate-900 transition-colors">
                {getItemLabel(item)}
              </span>
              <span className="font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md text-xs">
                {item.count.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-400 italic py-4 text-center">{emptyText}</div>
        )}
      </div>
    </div>
  )
}
