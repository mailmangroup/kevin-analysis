'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/lib/store/user-store'
import { KawoTokenModal } from './KawoTokenModal'

// Shows the token modal whenever a logged-in user has no KAWO token yet.
// Skip on /settings so users can configure the token there instead.
export function OnboardingGate() {
  const pathname = usePathname()
  const profile = useUserStore((s) => s.profile)
  const isLoading = useUserStore((s) => s.isLoading)
  const fetchProfile = useUserStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // No profile = not authenticated (e.g. on /login) or still loading.
  if (isLoading || !profile) return null
  if (profile.kawo_token) return null
  if (pathname?.startsWith('/settings')) return null

  return <KawoTokenModal />
}
