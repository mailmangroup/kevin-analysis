'use client'

import Link from 'next/link'
import { AlertCircle, KeyRound } from 'lucide-react'

interface KawoConnectionErrorProps {
  /** Compact inline banner vs full empty-state card */
  variant?: 'banner' | 'card'
  /** Override when we know there's no token vs a failed request */
  reason?: 'missing' | 'invalid' | 'failed'
}

export function KawoConnectionError({
  variant = 'card',
  reason = 'failed',
}: KawoConnectionErrorProps) {
  const title =
    reason === 'missing'
      ? 'KAWO token not configured'
      : reason === 'invalid'
        ? 'Staging KAWO token rejected'
        : 'Could not connect to staging KAWO'

  const description =
    reason === 'missing'
      ? 'Add your staging KAWO user token in Settings to load dashboard data.'
      : 'Check that you are using a staging user token for staging-kevin.kawo.com, then update it in Settings.'

  if (variant === 'banner') {
    return (
      <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">{title}</p>
              <p className="mt-0.5 text-sm text-amber-800/80">{description}</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Open Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <KeyRound className="h-6 w-6 text-amber-700" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      <Link
        href="/settings"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/10"
      >
        <KeyRound className="h-4 w-4" />
        Set up in Settings
      </Link>
    </div>
  )
}
