import type { Metadata } from 'next'
import '@shared/styles/globals.scss'
import { Providers } from './providers'

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
