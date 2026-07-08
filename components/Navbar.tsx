'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, HelpCircle, DollarSign, Users, BarChart3, Rocket, Languages, Settings, Globe } from 'lucide-react'
import { useLanguageStore } from '@/lib/store/language-store'

const navItems = [
  { href: '/', labelKey: 'nav.overview', icon: LayoutDashboard },
  { 
    id: 'analysis-group', 
    labelKey: 'nav.analysis', 
    icon: BarChart3,
    subItems: [
      { href: '/analysis', labelKey: 'nav.kevinAnalysis' },
      { href: '/geo-analysis', labelKey: 'nav.geoAnalysis' },
    ]
  },
  { href: '/questions', labelKey: 'nav.questions', icon: HelpCircle },
  { href: '/cost', labelKey: 'nav.cost', icon: DollarSign },
  { href: '/retention', labelKey: 'nav.retention', icon: Users },
  { href: '/releases', labelKey: 'nav.releases', icon: Rocket },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { language, setLanguage, t } = useLanguageStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed w-full z-50 glass transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
              <span className="text-lg font-semibold text-slate-900 hidden sm:block">
                Kevin <span className="text-slate-400 font-normal">{t('brand.analytics')}</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              
              if (item.subItems) {
                const isActiveGroup = item.subItems.some(sub => isActive(sub.href))
                return (
                  <div key={item.id} className="relative group">
                    <button
                      className={`
                        relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${isActiveGroup
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${isActiveGroup ? 'text-primary-600' : ''}`} />
                      {t(item.labelKey)}
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {isActiveGroup && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                      )}
                    </button>
                    <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-xl overflow-hidden min-w-[140px] py-1">
                        {item.subItems.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              isActive(sub.href) 
                                ? 'text-primary-600 bg-primary-50/50 font-medium' 
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            {t(sub.labelKey)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }

              const active = isActive(item.href!)
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${active
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : ''}`} />
                  {t(item.labelKey)}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === '/settings'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-500 hover:text-primary-600 hover:bg-primary-50'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.settings') || 'Settings'}</span>
            </Link>
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500
                       hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
              title={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? '中' : 'EN'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500
                       hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-slate-200/50 px-2 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 min-w-max px-2">
          {navItems.flatMap((item) => {
            if (item.subItems) {
              return item.subItems.map(sub => ({
                href: sub.href,
                labelKey: sub.labelKey,
                icon: item.icon
              }))
            }
            return [item as any]
          }).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-lg text-[10px] font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-slate-500 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : ''}`} />
                <span className="truncate w-full text-center px-1">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
