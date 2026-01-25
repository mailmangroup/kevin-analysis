# Kevin Usage Analysis Dashboard - Design Document

## Table of Contents
1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Design System](#design-system)
4. [Component Library](#component-library)
5. [Page Layouts](#page-layouts)
6. [User Experience Patterns](#user-experience-patterns)
7. [Data Visualization](#data-visualization)
8. [Technical Architecture](#technical-architecture)
9. [Accessibility & Responsiveness](#accessibility--responsiveness)

---

## Overview

The Kevin Usage Analysis Dashboard is a modern analytics platform built to track and analyze usage metrics for the Kevin AI assistant. The dashboard provides comprehensive insights into user engagement, question patterns, cost analysis, and retention metrics.

### Key Features
- **Real-time Metrics**: Live dashboard with key performance indicators
- **Question Analysis**: Deep dive into user questions with filtering and categorization
- **Cost Tracking**: Monitor token usage and estimated costs over time
- **Retention Analysis**: Cohort-based retention tracking and user lifecycle analysis
- **Secure Authentication**: Supabase-powered authentication with user profile management

---

## Design Philosophy

### Core Principles

1. **Hero KPIs First**: Critical metrics are prominently displayed at the top of each page
2. **Warm & Inviting**: Amber-based color palette creates a welcoming, energetic feel
3. **Data-Driven**: Charts and visualizations prioritize clarity and actionable insights
4. **Progressive Disclosure**: Complex data is organized hierarchically with expandable sections
5. **Consistent Patterns**: Reusable components ensure a cohesive experience across pages

### Visual Identity

The dashboard uses a **warm amber color scheme** that replaced the previous sky blue palette. This shift creates:
- A more energetic and engaging visual experience
- Better differentiation from typical analytics dashboards
- Visual warmth that matches the conversational nature of the product

---

## Design System

### Color Palette

#### Primary Colors (Amber)
| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#fffbeb` | Light backgrounds, card backgrounds |
| 100 | `#fef3c7` | Subtle highlights |
| 200 | `#fde68a` | Hover states |
| 300 | `#fcd34d` | Secondary actions |
| 400 | `#fbbf24` | Chart fills (yellow) |
| **500** | **`#f59e0b`** | **Primary brand color** |
| 600 | `#d97706` | Hover states, active states |
| 700 | `#b45309` | Darker accents |
| 800-950 | Darker shades | Reserved for future use |

#### Accent Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Orange | `#f97316` | Warning states, lifecycle at-risk segment |
| Red-Orange | `#fb923c` | Secondary accents, lifecycle resurrected segment |
| Bright Yellow | `#facc15` | Lifecycle new users segment |
| Red | `#dc2626` | Negative states, lifecycle churned segment |
| Cream | `#fffbeb` | Backgrounds |

#### Trend Indicators
| State | Hex | Usage |
|-------|-----|-------|
| Up (Positive) | `#22c55e` | Growth indicators, positive trends |
| Down (Negative) | `#ef4444` | Decline indicators, negative trends |
| Neutral | `#64748b` | No change |

#### Neutral Colors (Slate)
- Background: `rgb(248, 250, 252)` - `bg-slate-50/50`
- Text Primary: `rgb(15, 23, 42)` - `text-slate-900`
- Text Secondary: `rgb(100, 116, 139)` - `text-slate-500`
- Borders: `rgb(226, 232, 240)` - `border-slate-200`

#### Gradients
- **Primary**: `gradient-primary` - Primary brand gradient
- **Mesh**: `gradient-mesh` - Subtle background mesh
- **Background**: `bg-mesh` - Radial gradient background for pages
- **Text**: `text-gradient` - Gradient text for headings
- **Border**: `gradient-border` - Gradient border effects

### Typography

- **Font Family**: Inter (system font stack fallback)
- **Headings**:
  - H1: `text-3xl font-bold` - Page titles
  - H2: `text-lg font-semibold` - Section titles
  - H3: `text-sm font-medium` - Subsection titles
- **Body Text**:
  - Large: `text-4xl font-bold` - KPI values
  - Regular: `text-sm` - Body text
  - Small: `text-xs` - Labels, metadata
- **Tracking**: `tracking-tight` for headings, `tracking-wide` for labels

### Spacing & Layout

- **Container**: `max-w-7xl mx-auto` - Centered, max-width container
- **Padding**: `px-4 sm:px-6 lg:px-8` - Responsive horizontal padding
- **Card Padding**: `p-6` - Standard card padding
- **Grid Gaps**: `gap-4` (16px) for card grids, `gap-6` (24px) for sections

### Shadows & Elevation

- **KPI Card Shadow**: `shadow-kpi` - Subtle shadow (0 1px 3px rgba(0,0,0,0.04))
- **Card Hover**: `hover:shadow-md` - Medium shadow on hover
- **Navbar**: Glass effect with backdrop blur

### Border Radius

- **Cards**: `rounded-2xl` (16px) - Primary card radius
- **Buttons**: `rounded-lg` (8px) - Standard buttons
- **Badges**: `rounded-full` - Pill-shaped badges
- **Chart Bars**: `borderRadius: 6` - Rounded bar corners

### Scrollbar

- **Style**: Custom thin scrollbar
- **Track**: Transparent
- **Thumb**: Slate-300 with hover effect

---

## Component Library

### HeroKPICard

**Purpose**: Display a single key metric with trend indicator

**Props**:
```typescript
{
  title: string              // Metric label (e.g., "Avg Daily Users")
  value: string | number    // Current value
  change?: number           // Percentage change vs previous period
  changeLabel?: string      // Label for change (default: "vs last period")
  icon?: ReactNode          // Optional icon
  formatValue?: (n: number) => string  // Custom formatter
}
```

**Visual Structure**:
- Header: Title (uppercase, small) + Icon (optional) in animated container
- Value: Large, bold number (4xl)
- Footer: Trend badge + change label
- Animations: Staggered fade-in entrance

**States**:
- **Trend Up**: Green badge with ↑ icon
- **Trend Down**: Red badge with ↓ icon
- **Neutral**: Gray badge with - icon

**Styling**:
- Background: White, subtle gradient on hover
- Border: `border-slate-200`, gradient border on hover
- Padding: `p-6`
- Shadow: `shadow-card`, `shadow-card-hover` on hover
- Hover: Smoother transitions

### HeroKPIGrid

**Purpose**: Grid layout for displaying multiple KPI cards

**Layout**: 
- Mobile: 1 column
- Tablet: 2 columns (`sm:grid-cols-2`)
- Desktop: 4 columns (`lg:grid-cols-4`)

**Metrics Displayed**:
1. Avg Daily Users (DAU)
2. Questions Answered
3. Reports Generated
4. Content Generated

**Data Processing**:
- Aggregates metrics across date range
- Calculates percentage changes vs previous period
- Handles empty/zero states gracefully

### TimePeriodToggle

**Purpose**: Quick period selection (7D/30D/90D)

**Design**:
- Segmented control style
- Background: `bg-slate-100`
- Active: White background with shadow
- Inactive: Transparent with hover state

**States**:
- Active: `bg-white text-slate-900 shadow-sm`
- Inactive: `text-slate-500 hover:text-slate-700`

### DashboardCharts

**Purpose**: Reusable chart components with warm color gradients

**Chart Types**:

1. **Daily Active Users (Line Chart)**
   - Color: Amber (`#f59e0b`)
   - Fill: Light amber with transparency
   - Points: White with amber border

2. **Report Generation (Bar Chart)**
   - Color: Amber (`#f59e0b`)
   - Hover: Darker amber (`#d97706`)

3. **Question Answering (Bar Chart)**
   - Color: Amber (`#f59e0b`)
   - Hover: Darker amber (`#d97706`)

4. **Content Generation (Bar Chart)**
   - Color: Amber (`#f59e0b`)
   - Hover: Darker amber (`#d97706`)

5. **Cost Analysis Charts (Bar Charts)**
   - All use consistent Amber (`#f59e0b`)
   - Hover: Darker amber (`#d97706`)

**Chart Options**:
- Responsive: `true`
- Aspect Ratio: `maintainAspectRatio: false`
- Tooltips: Dark background (`rgba(15, 23, 42, 0.9)`)
- Grid: Y-axis only, light gray
- Border Radius: 6px on bars

### Navbar

**Purpose**: Global navigation with authentication

**Features**:
- Fixed position with glass effect
- Logo: Gradient logo with glow effect on hover
- Navigation: Icons for each item, Active state indicators with background highlight
- Mobile: Bottom navigation bar
- Logout button

**Styling**:
- Background: `glass` utility (white/80 with backdrop blur)
- Links: Icons + Text, hover effects
- Active state: Background highlight with gradient text

### DateRangePicker

**Purpose**: Date selection for filtering data

**Features**:
- Start and end date inputs
- Integration with quick select dropdown
- Date formatting with date-fns

---

## Page Layouts

### Common Elements
- **Background**: Consistent `bg-mesh` with subtle radial gradient
- **Headings**: Gradient text (`text-gradient`) for page titles
- **Loading**: Skeleton loading states with shimmer effect
- **Spacing**: Improved spacing and responsive layouts

### Dashboard Overview (`/`)

**Structure**:
1. **Header Section**
   - Page title: "Dashboard Overview"
   - Last updated timestamp
   - Time period toggle (7D/30D/90D)

2. **Hero KPIs Section**
   - 4-column grid of KPI cards
   - Shows current period vs previous period comparison

3. **Charts Section**
   - Daily Active Users (line chart)
   - Usage by Type (3-column grid: Report/Question/Content)

4. **Quick Links Section**
   - 3 cards linking to Questions, Cost, Retention pages
   - Hover effects with colored blur backgrounds

**Data Flow**:
- Fetches metrics for selected period
- Fetches previous period for comparison
- Uses SWR for caching and revalidation

### Questions Analysis (`/questions`)

**Structure**:
1. **Header & Filters**
   - Page title
   - Quick select dropdown (Yesterday/Last 7/Last 30/Custom)
   - Date range picker
   - Category filter dropdown

2. **Statistics Grid** (2x2)
   - Query Volume Trend (bar chart)
   - Sub-category Distribution (doughnut chart)
   - Top Brands (list)
   - Top Users (list)

3. **Questions Table**
   - Grouped by brand
   - Expandable rows
   - Shows question/answer pairs
   - Tool calls display
   - Follow-up questions for video analysis

**Color Mapping** (Sub-categories):
- `video_analysis`: Orange (`#f97316`)
- `chat`: Amber (`#f59e0b`)
- `report`: Yellow (`#fbbf24`)
- `content`: Light Orange (`#fb923c`)
- `other`: Slate gray

**Features**:
- Markdown export for grouped questions
- Expandable follow-up questions
- Tool call visualization
- Brand grouping with counts

### Cost Analysis (`/cost`)

**Structure**:
1. **Header**
   - Page title
   - Period selector (7D/30D/90D)

2. **Charts** (Stacked vertically)
   - Daily Cost (USD) - Amber bars
   - Daily Token Usage - Amber bars
   - Monthly Cost Summary - Amber bars

**Visual Design**:
- All charts use consistent amber color (`#f59e0b`)
- Consistent styling with rounded bars
- Clear USD formatting

### Retention Analysis (`/retention`)

**Structure**:
1. **Header**
   - Page title
   - CSV download button

2. **Filters**
   - Period selector (Weekly/Monthly)
   - Generation type filter

3. **Lifecycle Chart** (Weekly only)
   - Stacked bar chart showing:
     - New users (Bright Yellow `#facc15`)
     - Active users (Amber `#f59e0b`)
     - Resurrected users (Light Orange `#fb923c`)
     - At-risk users (Orange `#f97316`, negative)
     - Churned users (Red `#dc2626`, negative)
   - Color gradient from bright yellow (positive) to red (negative)
   - Clickable bars to view user lists

4. **Retention Cohort Table**
   - Heatmap style with amber color scale
   - Sticky first column (cohort name)
   - Percentage-based color intensity:
     - 80%+: `bg-amber-600`
     - 60-79%: `bg-amber-500`
     - 40-59%: `bg-amber-400`
     - 20-39%: `bg-amber-200`
     - 1-19%: `bg-amber-100`
     - 0%: `bg-gray-50`

**Features**:
- Modal for viewing user lists by lifecycle segment
- CSV export functionality
- Dynamic period calculation
- Responsive table with horizontal scroll

---

## User Experience Patterns

### Loading States

- **Skeleton Loading**: Shimmer effect (`shimmer` animation)
- **Loading Messages**: Centered text with backdrop blur
- **Empty States**: Icon + message with helpful text

### Error Handling

- **API Errors**: Red alert boxes with error messages
- **Empty Data**: Friendly empty state messages
- **Network Errors**: Graceful degradation with retry options

### Interactions

1. **Hover Effects**:
   - Cards: Shadow elevation (`hover:shadow-md`)
   - Links: Color transition to amber
   - Buttons: Background color change

2. **Transitions**:
   - Duration: `duration-300` (300ms)
   - Properties: Shadow, color, transform

3. **Focus States**:
   - Ring: `focus:ring-2 focus:ring-primary-600`
   - Outline: Removed in favor of ring

### Data Display Patterns

1. **Numbers**:
   - Large values: `toLocaleString()` for thousands separators
   - Percentages: 1 decimal place with sign (+/-)
   - Currency: USD formatting

2. **Dates**:
   - Format: Beijing Time (UTC+8) consistently displayed
   - Display: `MM-DD` for charts, full date for tables
   - Parsing: Uses date-fns for consistency

3. **Trends**:
   - Visual indicators: ↑/↓ icons
   - Color coding: Green (up), Red (down), Gray (neutral)
   - Context: Always shown with comparison period label

---

## Data Visualization

### Chart.js Configuration

**Common Options**:
```javascript
{
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },  // Usually hidden
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      cornerRadius: 8
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: '#f1f5f9' },
      ticks: { font: { size: 11 }, color: '#64748b' },
      border: { display: false }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, color: '#64748b' },
      border: { display: false }
    }
  }
}
```

### Color Gradients

**Bar Charts**:
- Single color with 80% opacity
- Hover: 100% opacity, slightly darker shade
- Border radius: 6px for modern look

**Line Charts**:
- Solid line with fill
- Point styling: White center with colored border
- Tension: 0.4 for smooth curves

**Doughnut Charts**:
- Multiple warm colors from palette
- White borders between segments
- Hover offset: 4px

### Heatmaps

**Retention Table**:
- Color scale based on percentage retention
- Intensity increases with retention rate
- Empty cells: Light gray background
- Text: White on dark backgrounds, dark on light

---

## Technical Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **State**: Zustand
- **Data Fetching**: SWR
- **Auth**: Supabase
- **Icons**: Lucide React
- **Date Utils**: date-fns

### File Structure

```
app/
├── page.tsx              # Dashboard overview
├── questions/page.tsx    # Questions analysis
├── cost/page.tsx        # Cost analysis
├── retention/page.tsx    # Retention analysis
├── login/page.tsx       # Authentication
├── layout.tsx           # Root layout
└── globals.css          # Global styles

components/
├── HeroKPICard.tsx      # Individual KPI card
├── HeroKPIGrid.tsx      # KPI grid layout
├── TimePeriodToggle.tsx # Period selector
├── DashboardCharts.tsx  # Chart components
├── Navbar.tsx          # Navigation
└── DateRangePicker.tsx # Date selection

lib/
├── api.ts              # API client with auth
├── supabase/           # Supabase clients
└── store/              # Zustand stores
```

### Data Flow

1. **Authentication**:
   - User logs in via Supabase
   - Profile fetched and stored in Zustand
   - API credentials from profile or env vars

2. **Data Fetching**:
   - SWR hooks fetch data from KAWO API
   - Automatic caching and revalidation
   - Error handling at component level

3. **State Management**:
   - User profile: Zustand store
   - UI state: React useState
   - Server state: SWR cache

### API Integration

**Endpoints Used**:
- `/phoenix/overview/metrics?days={n}` - Dashboard metrics
- `/phoenix/usage/types?days={n}` - Usage breakdown
- `/phoenix/cost/monthly` - Monthly costs
- `/phoenix/cost/daily?days={n}` - Daily costs
- `/phoenix/questions/stats` - Question statistics
- `/phoenix/questions/{spanId}/followups` - Follow-up questions
- `/phoenix/retention` - Retention cohorts
- `/phoenix/retention/lifecycle` - User lifecycle

**Authentication**:
- Token-based auth via `fetchWithAuth` helper
- Token from user profile or environment variables

---

## Accessibility & Responsiveness

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm-md)
- **Desktop**: > 1024px (lg)

### Responsive Patterns

1. **Grids**:
   - Mobile: Single column
   - Tablet: 2 columns
   - Desktop: 3-4 columns

2. **Navigation**:
   - Mobile: Hidden menu (future: hamburger)
   - Desktop: Horizontal links

3. **Tables**:
   - Horizontal scroll on mobile
   - Sticky columns for retention table

### Accessibility Considerations

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Modal dialogs, buttons
- **Keyboard Navigation**: Focus states visible
- **Color Contrast**: WCAG AA compliant
- **Screen Readers**: Alt text for icons (future enhancement)

### Performance Optimizations

- **SWR Caching**: Reduces API calls
- **Code Splitting**: Next.js automatic
- **Image Optimization**: Not applicable (no images)
- **Lazy Loading**: Components loaded on demand

---

## Future Enhancements

### Design Improvements

1. **Dark Mode**: Support for dark theme
2. **Custom Date Ranges**: Enhanced date picker
3. **Export Options**: PDF reports, CSV downloads
4. **Real-time Updates**: WebSocket integration
5. **Mobile Menu**: Hamburger navigation

### Feature Additions

1. **Alerts**: Threshold-based notifications
2. **Comparisons**: Side-by-side period comparison
3. **Drill-downs**: Click charts to see details
4. **Filters**: Advanced filtering options
5. **Saved Views**: User-customizable dashboards

### Technical Improvements

1. **Testing**: Unit and integration tests
2. **Error Boundaries**: Better error handling
3. **Performance Monitoring**: Analytics integration
4. **Type Safety**: Stricter TypeScript config
5. **Documentation**: Component Storybook

---

## Design Tokens Reference

### Spacing Scale
- `4` = 16px (1rem) - Card gaps
- `6` = 24px (1.5rem) - Section gaps
- `8` = 32px (2rem) - Large gaps

### Border Radius
- `lg` = 8px - Buttons
- `xl` = 12px - Medium cards
- `2xl` = 16px - Primary cards
- `full` = 9999px - Pills/badges

### Shadows
- `sm` = Subtle elevation
- `md` = Medium elevation (hover)
- `lg` = Large elevation (modals)

### Transitions
- Duration: `300ms` standard
- Easing: Default (ease-in-out)

---

## Conclusion

The Kevin Usage Analysis Dashboard represents a modern, data-driven analytics platform with a warm, inviting design system. The shift to an amber-based color palette creates a distinctive visual identity while maintaining excellent usability and accessibility standards.

The component-based architecture ensures consistency and maintainability, while the use of modern React patterns (SWR, Zustand) provides excellent performance and developer experience.

This design document serves as a living reference for future development and should be updated as the product evolves.
