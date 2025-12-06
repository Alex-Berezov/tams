import type { Metadata } from 'next'
import '@shared/styles/globals.scss'

export const metadata: Metadata = {
  title: 'TAMS - Tokyo Anomaly Monitoring System',
  description: 'Real-time yokai monitoring dashboard for Tokyo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
