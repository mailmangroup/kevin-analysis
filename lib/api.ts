import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store/user-store'

// Check if we're in local development mode
const isLocalDev = process.env.NEXT_PUBLIC_KAWO_TOKEN !== undefined

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let kawoToken: string | undefined

  if (isLocalDev) {
    // Use .env.local for local development
    kawoToken = process.env.NEXT_PUBLIC_KAWO_TOKEN
  } else {
    // Use Supabase profile table for production
    const { profile } = useUserStore.getState()
    kawoToken = profile?.kawo_token
  }

  // Fallback to Supabase session if no KAWO token (shouldn't normally happen)
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(options.headers)

  // Use KAWO token for backend API authentication
  if (kawoToken) {
    headers.set('Authorization', `Bearer ${kawoToken}`)
  } else if (session?.access_token) {
    // Fallback to Supabase token (this will likely fail backend auth)
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

// Helper function to get KAWO configuration
export function getKawoConfig() {
  if (isLocalDev) {
    return {
      token: process.env.NEXT_PUBLIC_KAWO_TOKEN!,
      orgId: process.env.NEXT_PUBLIC_KAWO_ORG_ID!,
      brandId: process.env.NEXT_PUBLIC_KAWO_BRAND_ID!,
      apiUrl: process.env.NEXT_PUBLIC_KAWO_API_URL!,
    }
  } else {
    const { profile } = useUserStore.getState()
    return {
      token: profile?.kawo_token,
      orgId: profile?.kawo_org_id,
      brandId: profile?.kawo_brand_id,
      apiUrl: profile?.kawo_api_url,
    }
  }
}
