import './globals.css'
import { Inter } from 'next/font/google'
import { OnboardingGate } from '@/components/OnboardingGate'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kevin Usage Analysis',
  description: 'Analytics Dashboard for Kevin Usage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <OnboardingGate />
      </body>
    </html>
  )
}
