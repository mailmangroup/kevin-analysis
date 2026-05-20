'use client'

import { useMemo, useState } from 'react'
import {
  Sparkles,
  Wrench,
  Bug,
  Search,
  ChevronDown,
  Lightbulb,
  Server,
  CalendarDays,
  CheckCircle2,
  EyeOff,
  Layers3,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Navbar } from '@/components/Navbar'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import {
  releases,
  SCOPES,
  CHANGE_TYPES,
  CHANGE_TYPE_LABEL,
  type Scope,
  type ChangeType,
  type ReleaseChange,
} from '@/lib/releases'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

// ---------------------------------------------------------------------------
// Styling helpers
// ---------------------------------------------------------------------------

const TYPE_STYLE: Record<ChangeType, { label: string; pill: string; icon: typeof Sparkles }> = {
  feature: {
    label: 'New',
    pill: 'bg-slate-900 text-white',
    icon: Sparkles,
  },
  improvement: {
    label: 'Improved',
    pill: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/80',
    icon: Wrench,
  },
  fix: {
    label: 'Fixed',
    pill: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/80',
    icon: Bug,
  },
}

const SCOPE_COLORS: Record<Scope, string> = {
  'Kevin Chat':         '#f59e0b',
  'Claw':               '#f97316',
  'Video':              '#9ca3af',
  'Analysis Service':   '#22c55e',
  'AI Report':          '#3b82f6',
  'Content Generation': '#a855f7',
  'Ops & Analytics':    '#64748b',
}

function isLive(change: ReleaseChange) {
  return change.frontendEnabled !== false
}

function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

type View = 'release' | 'project'
type LiveFilter = 'all' | 'live' | 'notlive'

// ---------------------------------------------------------------------------
// Presentational components
// ---------------------------------------------------------------------------

function TypePill({ type }: { type: ChangeType }) {
  const s = TYPE_STYLE[type]
  const Icon = s.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none ${s.pill}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {s.label}
    </span>
  )
}

function ScopeDot({ scope }: { scope: Scope }) {
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: SCOPE_COLORS[scope] }}
    />
  )
}

function ChangeRow({
  change,
  showScope = false,
  showVersion,
}: {
  change: ReleaseChange
  showScope?: boolean
  showVersion?: string
}) {
  const [open, setOpen] = useState(false)
  const live = isLive(change)
  return (
    <div className="group py-3.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <TypePill type={change.type} />
            {showScope && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <ScopeDot scope={change.scope} />
                {change.scope}
              </span>
            )}
            {showVersion && (
              <span className="font-mono text-[11px] text-slate-400">{showVersion}</span>
            )}
            {!live && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Server className="h-3 w-3" />
                Backend only
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-800">{change.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{change.description}</p>
        </div>
        <span className="mt-1 shrink-0" title={live ? 'Live in product' : 'Backend only'}>
          {live ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <EyeOff className="h-4 w-4 text-slate-300" />
          )}
        </span>
      </div>
      {change.example && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-600"
          >
            <Lightbulb className="h-3 w-3" />
            What this means
            <ChevronDown
              className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open && (
            <p className="mt-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
              {change.example}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-slate-800 text-white shadow-sm'
          : 'text-slate-600 hover:bg-white/60 hover:text-slate-800'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`text-[10px] tabular-nums ${active ? 'text-slate-300' : 'text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  helper: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-400">{helper}</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReleasesPage() {
  const [view, setView] = useState<View>('release')
  const [query, setQuery] = useState('')
  const [activeScopes, setActiveScopes] = useState<Set<Scope>>(new Set())
  const [activeTypes, setActiveTypes] = useState<Set<ChangeType>>(new Set())
  const [activeVersions, setActiveVersions] = useState<Set<string>>(new Set())
  const [liveFilter, setLiveFilter] = useState<LiveFilter>('all')

  const latestRelease = releases[0]
  const totalReleaseCount = releases.length
  const totalKnownChanges = releases.reduce((sum, r) => sum + r.changes.length, 0)

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  }

  const matchesQuery = (c: ReleaseChange) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      Boolean(c.example?.toLowerCase().includes(q))
    )
  }

  const matches = (c: ReleaseChange, version: string) => {
    if (activeVersions.size > 0 && !activeVersions.has(version)) return false
    if (activeScopes.size > 0 && !activeScopes.has(c.scope)) return false
    if (activeTypes.size > 0 && !activeTypes.has(c.type)) return false
    if (liveFilter === 'live' && !isLive(c)) return false
    if (liveFilter === 'notlive' && isLive(c)) return false
    if (!matchesQuery(c)) return false
    return true
  }

  const filteredReleases = useMemo(
    () =>
      releases
        .map((r) => ({ ...r, changes: r.changes.filter((c) => matches(c, r.version)) }))
        .filter((r) => r.changes.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, activeScopes, activeTypes, activeVersions, liveFilter]
  )

  const allMatching = useMemo(
    () =>
      filteredReleases.flatMap((r) =>
        r.changes.map((c) => ({ ...c, version: r.version, date: r.date }))
      ),
    [filteredReleases]
  )

  const typeCounts = useMemo(() => {
    const counts: Record<ChangeType, number> = { feature: 0, improvement: 0, fix: 0 }
    releases.forEach((r) =>
      r.changes.forEach((c) => {
        if (activeVersions.size > 0 && !activeVersions.has(r.version)) return
        if (activeScopes.size > 0 && !activeScopes.has(c.scope)) return
        if (liveFilter === 'live' && !isLive(c)) return
        if (liveFilter === 'notlive' && isLive(c)) return
        if (!matchesQuery(c)) return
        counts[c.type]++
      })
    )
    return counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScopes, activeVersions, liveFilter, query])

  const scopeCounts = useMemo(() => {
    const counts = {} as Record<Scope, number>
    SCOPES.forEach((s) => (counts[s] = 0))
    releases.forEach((r) =>
      r.changes.forEach((c) => {
        if (activeVersions.size > 0 && !activeVersions.has(r.version)) return
        if (activeTypes.size > 0 && !activeTypes.has(c.type)) return
        if (liveFilter === 'live' && !isLive(c)) return
        if (liveFilter === 'notlive' && isLive(c)) return
        if (!matchesQuery(c)) return
        counts[c.scope]++
      })
    )
    return counts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTypes, activeVersions, liveFilter, query])

  const perReleaseChart = useMemo(() => {
    const ordered = [...filteredReleases].reverse()
    return {
      labels: ordered.map((r) => r.version),
      datasets: [
        {
          label: 'Changes',
          data: ordered.map((r) => r.changes.length),
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          hoverBackgroundColor: 'rgba(15, 23, 42, 1)',
          borderRadius: 4,
        },
      ],
    }
  }, [filteredReleases])

  const perScopeChart = useMemo(() => {
    const counts = {} as Record<Scope, number>
    SCOPES.forEach((s) => (counts[s] = 0))
    allMatching.forEach((c) => counts[c.scope]++)
    const present = SCOPES.filter((s) => counts[s] > 0)
    return {
      labels: present,
      datasets: [
        {
          data: present.map((s) => counts[s]),
          backgroundColor: present.map((s) => SCOPE_COLORS[s] + 'cc'),
          borderWidth: 0,
        },
      ],
    }
  }, [allMatching])

  const totalChanges = allMatching.length
  const liveCount = allMatching.filter(isLive).length
  const backendOnlyCount = totalChanges - liveCount
  const activeFilterCount =
    activeScopes.size +
    activeTypes.size +
    activeVersions.size +
    (liveFilter === 'all' ? 0 : 1) +
    (query.trim() ? 1 : 0)
  const hasFilters = activeFilterCount > 0

  const clearFilters = () => {
    setQuery('')
    setActiveScopes(new Set())
    setActiveTypes(new Set())
    setActiveVersions(new Set())
    setLiveFilter('all')
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-24 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Release <span className="text-gradient">Notes</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                A plain-English view of what shipped, what improved, and what is already live in
                Kevin.
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <span className="rounded-md bg-primary-600 px-2 py-1 font-mono text-xs text-white">
                {latestRelease.version}
              </span>
              <span className="font-semibold text-slate-700">{latestRelease.name}</span>
              <span className="text-slate-400">{formatDate(latestRelease.date)}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 animate-fade-in lg:grid-cols-4">
          <StatCard
            icon={CalendarDays}
            label="Releases"
            value={totalReleaseCount}
            helper={`${formatDate(releases[releases.length - 1].date)} to now`}
          />
          <StatCard
            icon={Layers3}
            label="Total changes"
            value={totalKnownChanges}
            helper={`${totalChanges} with current filters`}
          />
          <StatCard
            icon={CheckCircle2}
            label="Live"
            value={liveCount}
            helper="Available in product UI"
          />
          <StatCard
            icon={EyeOff}
            label="Backend only"
            value={backendOnlyCount}
            helper="Shipped but not surfaced"
          />
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-4 animate-fade-in lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Changes per release</h3>
              <span className="text-xs text-slate-400">
                {totalChanges} total · {liveCount} live
              </span>
            </div>
            <div className="h-44">
              <Bar
                data={perReleaseChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f8fafc' },
                      ticks: { precision: 0, font: { size: 11 }, color: '#94a3b8' },
                      border: { display: false },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 11 }, color: '#94a3b8' },
                      border: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">By area</h3>
            <div className="h-44">
              <Doughnut
                data={perScopeChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        font: { size: 10 },
                        boxWidth: 8,
                        padding: 8,
                        color: '#64748b',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="sticky top-28 z-30 mb-8 border-y border-white/70 bg-white/78 shadow-[0_1px_0_rgba(255,255,255,0.75),0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-2xl animate-fade-in sm:top-20">
          {/* Row 1: View toggle + search */}
          <div className="flex flex-col gap-3 px-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedControl<View>
              options={[
                { value: 'release', label: 'By Release' },
                { value: 'project', label: 'By Area' },
              ]}
              value={view}
              onChange={setView}
              size="sm"
            />
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  <X className="h-3 w-3" />
                  Clear {activeFilterCount}
                </button>
              )}
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search changes…"
                  className="w-52 rounded-lg border border-slate-300/80 bg-white/85 py-1.5 pl-8 pr-3 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Version filter */}
          <div className="flex flex-wrap items-center gap-0.5 border-t border-slate-200/60 px-1 py-1.5">
            <span className="mr-2 w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Version
            </span>
            {releases.map((r) => (
              <Chip
                key={r.version}
                active={activeVersions.has(r.version)}
                onClick={() => setActiveVersions((s) => toggle(s, r.version))}
              >
                {r.version}
              </Chip>
            ))}
          </div>

          {/* Row 3: Type + Live filter */}
          <div className="flex flex-wrap items-center gap-0.5 border-t border-slate-200/60 px-1 py-1.5">
            <span className="mr-2 w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Type
            </span>
            {CHANGE_TYPES.map((t) => (
              <Chip
                key={t}
                active={activeTypes.has(t)}
                onClick={() => setActiveTypes((s) => toggle(s, t))}
                count={typeCounts[t]}
              >
                {CHANGE_TYPE_LABEL[t]}
              </Chip>
            ))}
            <span className="mx-3 h-4 w-px bg-slate-300/70" />
            <SegmentedControl<LiveFilter>
              options={[
                { value: 'all', label: 'All' },
                { value: 'live', label: 'Live' },
                { value: 'notlive', label: 'Not live' },
              ]}
              value={liveFilter}
              onChange={setLiveFilter}
              size="sm"
            />
          </div>

          {/* Row 4: Area filter */}
          <div className="flex flex-wrap items-center gap-0.5 border-t border-slate-200/60 px-1 py-1.5">
            <span className="mr-2 w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Area
            </span>
            {SCOPES.map((s) => (
              <Chip
                key={s}
                active={activeScopes.has(s)}
                onClick={() => setActiveScopes((set) => toggle(set, s))}
                count={scopeCounts[s]}
              >
                <ScopeDot scope={s} />
                {s}
              </Chip>
            ))}
          </div>
        </div>

        {/* Content */}
        {totalChanges === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-white p-12 text-center animate-fade-in">
            <p className="text-sm text-slate-500">No changes match your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Clear filters
            </button>
          </div>
        ) : view === 'release' ? (
          <ReleaseView releases={filteredReleases} />
        ) : (
          <ProjectView changes={allMatching} />
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function ReleaseView({ releases: list }: { releases: typeof releases }) {
  return (
    <div className="space-y-10">
      {list.map((r, i) => {
        const byScope = SCOPES.map((scope) => ({
          scope,
          items: r.changes.filter((c) => c.scope === scope),
        })).filter((g) => g.items.length > 0)
        const live = r.changes.filter(isLive).length

        return (
          <div
            key={r.version}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
          >
            {/* Release header — outside the card */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="rounded-md bg-primary-600 px-2 py-1 font-mono text-xs font-bold text-white">
                {r.version}
              </span>
              <h2 className="text-base font-semibold text-slate-900">{r.name}</h2>
              <span className="text-sm text-slate-400">{formatDate(r.date)}</span>
              <span className="text-xs text-slate-400">
                {r.changes.length} changes · {live} live
              </span>
            </div>
            <p className="mb-4 text-sm text-slate-500">{r.summary}</p>

            {/* Changes card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {byScope.map((g, gi) => (
                <div
                  key={g.scope}
                  className={gi > 0 ? 'border-t border-slate-100' : undefined}
                >
                  <div className="flex items-center gap-2 bg-slate-50/70 px-5 py-2.5">
                    <ScopeDot scope={g.scope} />
                    <span className="text-xs font-semibold text-slate-600">{g.scope}</span>
                    <span className="text-xs text-slate-400">{g.items.length}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    {g.items.map((c, idx) => {
                      const isLastOdd = idx === g.items.length - 1 && g.items.length % 2 === 1
                      return (
                        <div
                          key={idx}
                          className={[
                            'px-5',
                            isLastOdd ? 'col-span-2' : '',
                            idx % 2 === 0 && idx + 1 < g.items.length ? 'border-r border-slate-100' : '',
                            idx >= 2 ? 'border-t border-slate-100' : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <ChangeRow change={c} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProjectView({
  changes,
}: {
  changes: (ReleaseChange & { version: string; date: string })[]
}) {
  const [collapsed, setCollapsed] = useState<Set<Scope>>(new Set())
  const groups = SCOPES.map((scope) => ({
    scope,
    items: changes.filter((c) => c.scope === scope),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-4">
      {groups.map((g, i) => {
        const isCollapsed = collapsed.has(g.scope)
        const live = g.items.filter(isLive).length
        return (
          <div
            key={g.scope}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white animate-fade-in"
            style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}
          >
            <button
              onClick={() =>
                setCollapsed((s) => {
                  const next = new Set(s)
                  next.has(g.scope) ? next.delete(g.scope) : next.add(g.scope)
                  return next
                })
              }
              aria-expanded={!isCollapsed}
              className="flex w-full items-center justify-between gap-4 bg-slate-50/70 px-5 py-3 text-left transition-colors hover:bg-slate-100/60"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <ScopeDot scope={g.scope} />
                <h2 className="text-sm font-semibold text-slate-900">{g.scope}</h2>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {g.items.length} changes
                </span>
                <span className="hidden text-xs text-slate-400 sm:inline">· {live} live</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                  isCollapsed ? '-rotate-90' : ''
                }`}
              />
            </button>
            {!isCollapsed && (
              <div className="divide-y divide-slate-100 px-5">
                {g.items.map((c, idx) => (
                  <ChangeRow key={idx} change={c} showVersion={c.version} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
