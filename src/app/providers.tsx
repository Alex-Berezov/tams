'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { NotificationContainer } from '@widgets/notification-container'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Глобальные провайдеры приложения
 *
 * - QueryClientProvider: TanStack Query для управления серверным состоянием
 * - NotificationContainer: Система уведомлений (toast notifications)
 */
export function Providers({ children }: ProvidersProps) {
  // Создаём QueryClient на уровне компонента, чтобы избежать
  // shared state между запросами в SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Не рефетчить при фокусе окна
            refetchOnWindowFocus: false,
            // Время, в течение которого данные считаются свежими (30 сек)
            staleTime: 30000,
            // Количество повторных попыток при ошибке
            retry: 1,
          },
          mutations: {
            // Не повторять мутации при ошибке
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationContainer position='top-right'>
        {children}
      </NotificationContainer>
    </QueryClientProvider>
  )
}
