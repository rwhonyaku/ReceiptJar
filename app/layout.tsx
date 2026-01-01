import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReceiptJar - Snap receipts, get tax-ready spreadsheet',
  description: 'Upload receipt photos. Get CSV for taxes. No accounts. No subscriptions. One-time $19. Auto-delete privacy.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        }>
          {children}
        </Suspense>
      </body>
    </html>
  )
}