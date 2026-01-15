import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  kawo_token: string | null
  kawo_org_id: string | null
  kawo_brand_id: string | null
  kawo_api_url: string | null
}

interface UserStore {
  profile: UserProfile | null
  isLoading: boolean
  fetchProfile: () => Promise<void>
  setProfile: (profile: UserProfile) => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  isLoading: false,
  fetchProfile: async () => {
    // If already loading or profile exists, skip to avoid duplicate requests
    if (get().isLoading || get().profile) return

    set({ isLoading: true })
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      // Check for local dev overrides
      const envApiUrl = process.env.NEXT_PUBLIC_KAWO_API_URL
      const envToken = process.env.NEXT_PUBLIC_KAWO_TOKEN
      const envBrandId = process.env.NEXT_PUBLIC_KAWO_BRAND_ID
      const envOrgId = process.env.NEXT_PUBLIC_KAWO_ORG_ID

      if (!user) {
        if (envApiUrl && envToken) {
             // Local dev mode without Supabase auth
             set({
                profile: {
                    id: 'dev-user',
                    full_name: 'Local Dev',
                    email: 'dev@example.com',
                    kawo_token: envToken,
                    kawo_org_id: envOrgId || null,
                    kawo_brand_id: envBrandId || null,
                    kawo_api_url: envApiUrl
                }
             })
        }
        set({ isLoading: false })
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, kawo_token, kawo_org_id, kawo_brand_id, kawo_api_url')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        // Merge DB profile with local environment overrides
        // This mirrors hi-kevin behavior where local envs can override/supply context
        const envBrandId = process.env.NEXT_PUBLIC_KAWO_BRAND_ID
        const envToken = process.env.NEXT_PUBLIC_KAWO_TOKEN
        const envOrgId = process.env.NEXT_PUBLIC_KAWO_ORG_ID
        const envApiUrl = process.env.NEXT_PUBLIC_KAWO_API_URL

        set({ 
          profile: {
            id: user.id,
            full_name: data.full_name,
            email: data.email || user.email || null,
            kawo_token: envToken || data.kawo_token,
            kawo_org_id: envOrgId || data.kawo_org_id,
            kawo_brand_id: envBrandId || data.kawo_brand_id,
            kawo_api_url: envApiUrl || data.kawo_api_url
          } 
        })
      } else {
         // Even if no DB profile, allow local env to provide context (useful for dev)
         const envBrandId = process.env.NEXT_PUBLIC_KAWO_BRAND_ID
         if (envBrandId) {
            set({
                profile: {
                    id: user.id,
                    full_name: user.email || 'Dev User',
                    email: user.email || null,
                    kawo_token: process.env.NEXT_PUBLIC_KAWO_TOKEN || null,
                    kawo_org_id: process.env.NEXT_PUBLIC_KAWO_ORG_ID || null,
                    kawo_brand_id: envBrandId,
                    kawo_api_url: process.env.NEXT_PUBLIC_KAWO_API_URL || null
                }
            })
         }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  setProfile: (profile) => set({ profile })
}))
