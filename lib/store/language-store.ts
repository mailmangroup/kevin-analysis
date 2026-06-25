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
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Brand
    'brand.analytics': 'Analytics',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.lastUpdated': 'Last updated',
    'dashboard.beijingTime': 'Beijing Time (UTC+8)',
    
    // KPIs
    'kpi.avgDailyUsers': 'Avg Daily Users',
    'kpi.questionsAnswered': 'Questions Answered',
    'kpi.usersAsking': 'Users Asking Questions',
    'kpi.reportsGenerated': 'Reports Generated',
    'kpi.usersGeneratingReports': 'Users Generating Reports',
    'kpi.contentGenerated': 'Content Generated',
    'kpi.usersGeneratingContent': 'Users Generating Content',
    'kpi.vsPrevious': 'vs previous period',
    'kpi.estimated': 'estimated',
    'kpi.breakdown': 'Question Categories Breakdown',

    // Charts & Lists
    'chart.day': 'Day',
    'chart.week': 'Week (Mon-Sun)',
    'chart.month': 'Month',
    'chart.weekTooltip': 'Grouped by calendar week (Monday-Sunday)',
    'chart.needMoreData': 'Need at least 7 days of data',
    'chart.needMoreMonthData': 'Need at least 28 days of data',
    'metricMode.count': 'Total Counts',
    'metricMode.users': 'Unique Users',
    
    // Date Picker
    'date.from': 'From',
    'date.to': 'To',
    'date.custom': 'Custom Range',
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.last3': 'Last 3 Days',
    'date.last7': 'Last 7 Days',
    'date.last14': 'Last 14 Days',
    'date.last30': 'Last 30 Days',
    'date.last60': 'Last 60 Days',
    'date.last90': 'Last 90 Days',
    'date.thisMonth': 'This Month',
    'date.lastMonth': 'Last Month',
    'date.quickSelect': 'Quick Select',
    'date.dateRange': 'Date Range',

    // Time Period Toggle
    'period.7D': '7 Days',
    'period.30D': '30 Days',
    'period.90D': '90 Days',
    
    // Top Lists
    'toplist.users': 'Top Users',
    'toplist.brands': 'Top Brands',
    'toplist.questions': 'Questions',
    'toplist.reports': 'Reports',
    'toplist.content': 'Content',
    'toplist.unknown': 'Unknown',
    'toplist.unknownUser': 'Unknown User',
    'toplist.noData': 'No data available',

    // Analysis Page
    'analysis.title': 'Detailed',
    'analysis.subtitle': 'Analysis',

    // Cost Page
    'cost.title': 'API Cost',
    'cost.subtitle': 'Analysis',
    'cost.description': 'Track token usage and estimated costs over time.',
    'cost.estimationNote': 'Cost estimation',
    'cost.limitations': 'Limitations',
    
    // Questions Page
    'questions.title': 'Recent',
    'questions.subtitle': 'Questions',

    // Retention Page
    'retention.title': 'User',
    'retention.subtitle': 'Retention',
    'retention.newUsers': 'New Users',
    'retention.activeUsers': 'Active Users',
    'retention.resurrectedUsers': 'Resurrected Users',
    'retention.atRiskUsers': 'At Risk Users',
    'retention.churnedUsers': 'Churned Users',
    'retention.cohort': 'Cohort',
    'retention.totalUsers': 'Total Users',
    'retention.week': 'Week ',
    'retention.month': 'Month ',
    'retention.weekSuffix': '',
    'retention.monthSuffix': '',
    'retention.export': 'Export Data',
    'retention.lifecycleTitle': 'User Lifecycle (Weekly)',
    'retention.noUsers': 'No users found for this segment.',
    'retention.period': 'Period',
    'retention.genType': 'Generation Type',
    'retention.allTypes': 'All Types',
    'retention.videoAnalysis': 'Video Analysis',
    'retention.reportQA': 'Report QA',

    // Releases Page
    'releases.title': 'Release',
    'releases.subtitle': 'Notes',
    'releases.backendOnly': 'Backend only',
    'releases.liveInProduct': 'Live in product',
    'releases.whatThisMeans': 'What this means',
    'releases.changes': 'changes',
    'releases.live': 'live',
    'releases.clearFilters': 'Clear filters',
    'releases.noChanges': 'No changes match your filters.',

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
    'nav.settings': '设置',
    'nav.logout': '退出',

    // Brand
    'brand.analytics': '分析',

    // Dashboard
    'dashboard.title': '数据',
    'dashboard.overview': '总览',
    'dashboard.lastUpdated': '最后更新',
    'dashboard.beijingTime': '北京时间 (UTC+8)',

    // KPIs
    'kpi.avgDailyUsers': '平均日活',
    'kpi.questionsAnswered': '回答问题数',
    'kpi.usersAsking': '提问用户数',
    'kpi.reportsGenerated': '生成报告数',
    'kpi.usersGeneratingReports': '生成报告用户数',
    'kpi.contentGenerated': '生成内容数',
    'kpi.usersGeneratingContent': '生成内容用户数',
    'kpi.vsPrevious': '对比上期',
    'kpi.estimated': '估算',
    'kpi.breakdown': '问题分类明细',

    // Charts & Lists
    'chart.day': '日',
    'chart.week': '周 (周一至周日)',
    'chart.month': '月',
    'chart.weekTooltip': '按自然周分组 (周一至周日)',
    'chart.needMoreData': '至少需要 7 天的数据',
    'chart.needMoreMonthData': '至少需要 28 天的数据',
    'metricMode.count': '总次数',
    'metricMode.users': '独立用户数',
    
    // Date Picker
    'date.from': '从',
    'date.to': '至',
    'date.custom': '自定义范围',
    'date.today': '今天',
    'date.yesterday': '昨天',
    'date.last3': '过去 3 天',
    'date.last7': '过去 7 天',
    'date.last14': '过去 14 天',
    'date.last30': '过去 30 天',
    'date.last60': '过去 60 天',
    'date.last90': '过去 90 天',
    'date.thisMonth': '本月',
    'date.lastMonth': '上个月',
    'date.quickSelect': '快速选择',
    'date.dateRange': '日期范围',
    
    // Time Period Toggle
    'period.7D': '7 天',
    'period.30D': '30 天',
    'period.90D': '90 天',

    // Top Lists
    'toplist.users': '头部用户',
    'toplist.brands': '头部品牌',
    'toplist.questions': '问题',
    'toplist.reports': '报告',
    'toplist.content': '内容',
    'toplist.unknown': '未知',
    'toplist.unknownUser': '未知用户',
    'toplist.noData': '暂无数据',

    // Analysis Page
    'analysis.title': '详细',
    'analysis.subtitle': '分析',

    // Cost Page
    'cost.title': 'API 成本',
    'cost.subtitle': '分析',
    'cost.description': '追踪代币使用情况及预估成本。',
    'cost.estimationNote': '成本预估',
    'cost.limitations': '限制与说明',
    
    // Questions Page
    'questions.title': '最近',
    'questions.subtitle': '问题',

    // Retention Page
    'retention.title': '用户',
    'retention.subtitle': '留存',
    'retention.newUsers': '新增用户',
    'retention.activeUsers': '活跃用户',
    'retention.resurrectedUsers': '回流用户',
    'retention.atRiskUsers': '流失风险',
    'retention.churnedUsers': '已流失',
    'retention.cohort': '同期群',
    'retention.totalUsers': '总用户数',
    'retention.week': '第 ',
    'retention.month': '第 ',
    'retention.weekSuffix': ' 周',
    'retention.monthSuffix': ' 月',
    'retention.export': '导出数据',
    'retention.lifecycleTitle': '用户生命周期 (每周)',
    'retention.noUsers': '此分类暂无用户。',
    'retention.period': '周期',
    'retention.genType': '生成类型',
    'retention.allTypes': '所有类型',
    'retention.videoAnalysis': '视频分析',
    'retention.reportQA': '报告问答',

    // Releases Page
    'releases.title': '发布',
    'releases.subtitle': '说明',
    'releases.backendOnly': '仅后端',
    'releases.liveInProduct': '产品已上线',
    'releases.whatThisMeans': '这意味着什么',
    'releases.changes': '个更改',
    'releases.live': '个已上线',
    'releases.clearFilters': '清除筛选',
    'releases.noChanges': '没有符合筛选条件的更改。',
    
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
