import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'zh'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

export const translations = {
  en: {
    // Navigation
    'nav.overview': 'Overview',
    'nav.analysis': 'Analysis',
    'nav.questions': 'Questions',
    'nav.cost': 'Cost',
    'nav.retention': 'Retention',
    'nav.releases': 'Releases',
    'nav.logout': 'Logout',
    
    // Brand
    'brand.analytics': 'Analytics',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.lastUpdated': 'Last updated',
    'dashboard.beijingTime': 'Beijing Time (UTC+8)',
    
    // Analysis Page
    'analysis.title': 'Detailed',
    'analysis.subtitle': 'Analysis',

    // Cost Page
    'cost.title': 'API Cost',
    'cost.subtitle': 'Analysis',
    
    // Questions Page
    'questions.title': 'Recent',
    'questions.subtitle': 'Questions',

    // Retention Page
    'retention.title': 'User',
    'retention.subtitle': 'Retention',

    // Releases Page
    'releases.title': 'Release',
    'releases.subtitle': 'Notes',

    // Login Page
    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to access your Phoenix Analytics',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.button': 'Sign in',
    'login.loading': 'Logging in...',

    // Common
    'common.loading': 'Loading...',
  },
  zh: {
    // Navigation
    'nav.overview': '总览',
    'nav.analysis': '分析',
    'nav.questions': '问题',
    'nav.cost': '成本',
    'nav.retention': '留存',
    'nav.releases': '发布',
    'nav.logout': '退出',

    // Brand
    'brand.analytics': '分析',

    // Dashboard
    'dashboard.title': '数据',
    'dashboard.overview': '总览',
    'dashboard.lastUpdated': '最后更新',
    'dashboard.beijingTime': '北京时间 (UTC+8)',

    // Analysis Page
    'analysis.title': '详细',
    'analysis.subtitle': '分析',

    // Cost Page
    'cost.title': 'API 成本',
    'cost.subtitle': '分析',
    
    // Questions Page
    'questions.title': '最近',
    'questions.subtitle': '问题',

    // Retention Page
    'retention.title': '用户',
    'retention.subtitle': '留存',

    // Releases Page
    'releases.title': '发布',
    'releases.subtitle': '说明',
    
    // Login Page
    'login.title': '欢迎回来',
    'login.subtitle': '登录以访问 Phoenix 数据分析',
    'login.email': '邮箱地址',
    'login.password': '密码',
    'login.button': '登 录',
    'login.loading': '登录中...',

    // Common
    'common.loading': '加载中...',
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      t: (key: string) => {
        const { language } = get()
        return translations[language][key as keyof typeof translations['en']] || key
      }
    }),
    {
      name: 'language-storage',
    }
  )
)
