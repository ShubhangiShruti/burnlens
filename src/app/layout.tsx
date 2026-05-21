import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BurnLens',
  description: 'Free AI Spend Audit for startup and engineering teams.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <div className="px-4 pb-4 text-center">
          <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
            Admin
          </a>
        </div>
      </body>
    </html>
  )
}
