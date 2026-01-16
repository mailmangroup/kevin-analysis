'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed w-full z-50 glass transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span>Phoenix Analysis</span>
              </Link>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className="border-transparent text-slate-500 hover:text-primary-600 hover:border-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/questions"
                className="border-transparent text-slate-500 hover:text-primary-600 hover:border-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Questions
              </Link>
              <Link
                href="/cost"
                className="border-transparent text-slate-500 hover:text-primary-600 hover:border-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Cost
              </Link>
              <Link
                href="/retention"
                className="border-transparent text-slate-500 hover:text-primary-600 hover:border-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Retention
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
