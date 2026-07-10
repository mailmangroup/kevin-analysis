'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useUserStore } from '@/lib/store/user-store'
import { useLanguageStore } from '@/lib/store/language-store'
import { createClient } from '@/lib/supabase/client'
import { Globe, CheckCircle, Loader2, Save, Key, Languages, LogOut, UserCircle } from 'lucide-react'

// kevin-analysis always talks to the staging backend; the URL is fixed and not
// shown to the user. Only the per-user KAWO token is needed (no org/brand).
const KAWO_API_URL = 'https://staging-kevin.kawo.com'

export default function SettingsPage() {
  const router = useRouter()
  const { language, setLanguage, t } = useLanguageStore()
  const { profile, setProfile, fetchProfile } = useUserStore()
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile?.kawo_token) {
      setToken(profile.kawo_token)
    }
  }, [profile])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const testConnection = async () => {
    if (!token.trim()) {
      setStatus({ ok: false, msg: 'Enter your staging token first.' })
      return
    }
    setTesting(true)
    setStatus(null)
    try {
      const res = await fetch(`${KAWO_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
      if (!res.ok) {
        let errorData: any = {}
        try {
          errorData = await res.json()
        } catch {
          try {
            const text = await res.text()
            errorData = { error: res.statusText, text }
          } catch {
            errorData = { error: res.statusText }
          }
        }
        throw new Error(errorData.error || errorData.message || res.statusText)
      }
      setStatus({ ok: true, msg: 'Successfully connected to staging KAWO API.' })
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || 'Could not connect to staging KAWO. Use a staging user token.' })
    } finally {
      setTesting(false)
    }
  }

  const save = async () => {
    if (!token.trim()) {
      setStatus({ ok: false, msg: 'Enter your staging token first.' })
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

      setProfile({
        id: user.id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? user.email ?? null,
        kawo_token: token.trim(),
        kawo_org_id: profile?.kawo_org_id ?? null,
        kawo_brand_id: profile?.kawo_brand_id ?? null,
        kawo_api_url: KAWO_API_URL,
      })
      setStatus({ ok: true, msg: 'Token saved successfully.' })
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || 'Failed to save token.' })
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full max-w-md px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 mt-2">Manage your connection to KAWO API and preferences</p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* KAWO Connection */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-50 rounded-full">
              <Key className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">KAWO Connection</h2>
              <p className="text-sm text-slate-500">Configure your API credentials for KAWO integration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="kawo_token" className="block text-sm font-medium text-slate-700">
                Staging KAWO User Token
              </label>
              <input
                id="kawo_token"
                type="password"
                className={inputCls}
                placeholder="Paste your staging user token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value)
                  if (status) setStatus(null)
                }}
              />
              <p className="text-xs text-slate-500">
                Must be a staging KAWO user token — this app only talks to staging-kevin.kawo.com.
                If pages fail to load, update the token here and use Test Connection.
              </p>
            </div>

            {status && (
              <div
                className={`max-w-md p-3 rounded-lg border text-sm ${
                  status.ok
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {status.msg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={save}
                disabled={saving || testing}
                className="flex items-center gap-2 py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-600/10"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Connection'}
              </button>

              <button
                type="button"
                onClick={testConnection}
                disabled={testing || saving}
                className={`flex items-center gap-2 py-2.5 px-4 bg-white border font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                  status?.ok && status.msg.includes('Successfully connected')
                    ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                    : 'border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status?.ok && status.msg.includes('Successfully connected') ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                {testing ? 'Testing…' : (status?.ok && status.msg.includes('Successfully connected') ? 'Connected' : 'Test Connection')}
              </button>
            </div>
          </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 rounded-full">
                <Languages className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Preferences</h2>
                <p className="text-sm text-slate-500">Manage your language and display settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Language</h3>
                  <p className="text-xs text-slate-500">Choose your preferred language for the interface</p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('zh')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      language === 'zh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-full">
                <UserCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Account</h2>
                <p className="text-sm text-slate-500">Manage your account session</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Sign Out</h3>
                  <p className="text-xs text-slate-500">Log out of your current session</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-sm font-medium transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
