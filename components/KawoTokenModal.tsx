"use client"

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/lib/store/user-store'

// kevin-analysis always talks to the staging backend; the URL is fixed and not
// shown to the user. Only the per-user KAWO token is needed (no org/brand).
const KAWO_API_URL = 'https://staging-kevin.kawo.com'

export function KawoTokenModal() {
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const profile = useUserStore((s) => s.profile)
  const setProfile = useUserStore((s) => s.setProfile)

  const testConnection = async () => {
    if (!token.trim()) {
      setStatus({ ok: false, msg: 'Enter your token first.' })
      return
    }
    setTesting(true)
    setStatus(null)
    try {
      const res = await fetch(`${KAWO_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
      if (!res.ok) throw new Error(`Connection failed (HTTP ${res.status}).`)
      setStatus({ ok: true, msg: 'Connection successful.' })
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || 'Connection failed. Check your token.' })
    } finally {
      setTesting(false)
    }
  }

  const save = async () => {
    if (!token.trim()) {
      setStatus({ ok: false, msg: 'Enter your token first.' })
      return
    }
    setSaving(true)
    setStatus(null)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        setStatus({ ok: false, msg: 'You must be logged in to save.' })
        return
      }

      const { error } = await supabase.from('user_kawo_credentials').upsert({
        user_id: user.id,
        kawo_token: token.trim(),
        kawo_api_url: KAWO_API_URL,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error

      // Update the store so the gate closes and pages pick up the token.
      setProfile({
        id: user.id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? user.email ?? null,
        kawo_token: token.trim(),
        kawo_org_id: null,
        kawo_brand_id: null,
        kawo_api_url: KAWO_API_URL,
      })
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || 'Failed to save token.' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Connect your KAWO account</h2>
        <p className="text-sm text-slate-500 mt-2">
          Enter your KAWO user token to let Kevin Analysis access your data.
        </p>

        <div className="mt-6 space-y-2">
          <label htmlFor="kawo_token" className="block text-sm font-medium text-slate-700">
            KAWO User Token
          </label>
          <input
            id="kawo_token"
            type="password"
            className={inputCls}
            placeholder="Enter your user token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        {status && (
          <div
            className={`mt-4 p-3 rounded-lg border text-sm ${
              status.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={testConnection}
            disabled={testing || saving}
            className="flex-1 py-2.5 px-4 bg-white border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || testing}
            className="flex-1 py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-600/10"
          >
            {saving ? 'Saving…' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
