# Kevin Usage Analysis Dashboard

A modern analytics dashboard for tracking and analyzing Kevin usage metrics, built with Next.js 14 and TypeScript.

## Features

- **Dashboard Overview**: Comprehensive metrics visualization with charts and key performance indicators
- **Questions Analysis**: Browse and filter through user questions to understand common patterns
- **Cost Analysis**: Analyze monthly costs and usage breakdowns across different models
- **Retention Tracking**: Track user retention cohorts and long-term engagement metrics
- **Authentication**: Secure login system powered by Supabase
- **Real-time Data**: Data fetching with SWR for efficient caching and revalidation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Date Utilities**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (for authentication)
- Access to the KAWO API backend

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kevin-analysis
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your configuration:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# KAWO Context (Optional - for local development)
# These override the database profile settings
NEXT_PUBLIC_KAWO_BRAND_ID=your_brand_id
NEXT_PUBLIC_KAWO_TOKEN=your_token
NEXT_PUBLIC_KAWO_ORG_ID=your_org_id
NEXT_PUBLIC_KAWO_API_URL=your_api_url
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application for production:

```bash
npm run build
npm start
```

## Project Structure

```
kevin-analysis/
├── app/                    # Next.js app directory
│   ├── cost/              # Cost analysis page
│   ├── login/             # Login page
│   ├── questions/         # Questions analysis page
│   ├── retention/         # Retention analysis page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard home page
│   └── globals.css        # Global styles
├── components/             # React components
│   ├── DashboardCharts.tsx # Chart components with warm gradients
│   ├── DateRangePicker.tsx # Date range selection
│   ├── HeroKPICard.tsx     # Large metric card with trend
│   ├── HeroKPIGrid.tsx     # Grid layout for KPI cards
│   ├── Navbar.tsx          # Navigation bar
│   └── TimePeriodToggle.tsx # 7D/30D/90D toggle
├── lib/                   # Utility libraries
│   ├── api.ts            # API client with auth
│   ├── supabase/         # Supabase client configuration
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   ├── store/            # Zustand stores
│   │   └── user-store.ts
│   └── supabase.ts
├── middleware.ts          # Next.js middleware for auth
└── package.json
```

## Authentication

The application uses Supabase for authentication. Users must log in to access the dashboard. The middleware automatically handles session management and redirects unauthenticated users to the login page.

### User Profile

User profiles stored in Supabase contain KAWO API configuration:
- `kawo_token`: API authentication token
- `kawo_org_id`: Organization ID
- `kawo_brand_id`: Brand ID
- `kawo_api_url`: API endpoint URL

For local development, you can override these settings using environment variables (see `.env.local.example`).

## API Integration

The dashboard connects to the KAWO API backend to fetch analytics data. The API client (`lib/api.ts`) handles authentication using either:
- Environment variables (local development)
- User profile settings from Supabase (production)

### API Endpoints Used

- `/phoenix/overview/metrics?days=30` - Overview metrics
- `/phoenix/usage/types?days=30` - Usage types breakdown
- `/phoenix/cost/monthly` - Monthly cost data

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design System

### Color Palette

The dashboard uses a warm amber-based color scheme:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary 500 | `#f59e0b` | Main interactive elements, highlights |
| Primary 600 | `#d97706` | Hover states |
| Primary 50 | `#fffbeb` | Light backgrounds, cards |
| Orange | `#f97316` | Accent color for charts |
| Lime | `#84cc16` | Success states, growth indicators |
| Trend Up | `#22c55e` | Positive trends |
| Trend Down | `#ef4444` | Negative trends |

### Components

| Component | Location | Description |
|-----------|----------|-------------|
| `HeroKPICard` | `components/HeroKPICard.tsx` | Large metric card with trend indicator |
| `HeroKPIGrid` | `components/HeroKPIGrid.tsx` | Grid layout for KPI cards |
| `TimePeriodToggle` | `components/TimePeriodToggle.tsx` | 7D/30D/90D toggle buttons |
| `DashboardCharts` | `components/DashboardCharts.tsx` | Chart components with warm gradients |
| `Navbar` | `components/Navbar.tsx` | Navigation with warm accent |
| `DateRangePicker` | `components/DateRangePicker.tsx` | Date range selection |

### Design Principles

1. **Hero KPIs First**: Large, prominent metric cards at the top of the dashboard
2. **Warm Color Palette**: Amber/orange/lime gradient scheme for visual appeal
3. **Trend Indicators**: Show percentage changes with up/down arrows
4. **Consistent Cards**: Rounded corners (2xl), subtle shadows, hover effects
5. **Clean Typography**: Inter font, clear hierarchy (4xl for values, sm for labels)

### Chart Styling

All charts use Chart.js with consistent styling:
- Bar charts: Warm gradient fills (yellow → orange → lime)
- Rounded corners on bars (`borderRadius: 6`)
- Dark tooltips with good contrast
- Grid lines only on Y-axis

## License

Private project - All rights reserved
