'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguageStore } from '@/lib/store/language-store'

// Only this account may sign in with a password; everyone else uses Google.
const PASSWORD_LOGIN_EMAIL = 'tech@kawo.com'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { t } = useLanguageStore()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (email.trim().toLowerCase() !== PASSWORD_LOGIN_EMAIL) {
      setError(`Password sign-in is only available for ${PASSWORD_LOGIN_EMAIL}. Please use Google.`)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const inputCls =
    'w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400'

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/20">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('login.title')}</h1>
          <p className="text-sm text-slate-500 mt-2">{t('login.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          <GoogleIcon />
          {loading && !showPassword ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {showPassword && (
          <form onSubmit={handlePasswordLogin} className="space-y-3 mt-5">
            <input
              type="email"
              className={inputCls}
              placeholder={PASSWORD_LOGIN_EMAIL}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className={inputCls}
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-primary-600/10"
            >
              {loading ? t('login.loading') : t('login.button')}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => { setShowPassword((v) => !v); setError(null) }}
          className="w-full mt-4 text-center text-xs text-slate-400 hover:text-slate-600"
        >
          {showPassword ? 'Back to Google sign-in' : `${PASSWORD_LOGIN_EMAIL}? Sign in with password`}
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
