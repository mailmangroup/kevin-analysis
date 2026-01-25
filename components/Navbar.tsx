'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, HelpCircle, DollarSign, Users } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/cost', label: 'Cost', icon: DollarSign },
  { href: '/retention', label: 'Retention', icon: Users },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

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
                Kevin <span className="text-slate-400 font-normal">Analytics</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500
                       hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-slate-200/50 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-200
                  ${active
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-slate-500 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : ''}`} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
