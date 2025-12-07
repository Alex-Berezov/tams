// Real-time updates model (SSE hooks)

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Anomaly,
  ThreatLevel,
  ThreatLevelChangeEvent,
  threatLevelChangeEventSchema,
} from '@shared/types'
import { ANOMALIES_QUERY_KEY } from '@features/capture-anomaly'

/**
 * Тип SSE события от сервера
 */
interface SSEEvent {
  type: string
  [key: string]: unknown
}

/**
 * Конфигурация для useAnomalyStream
 */
interface UseAnomalyStreamOptions {
  /** Включить/выключить подписку */
  enabled?: boolean
  /** Задержка перед переподключением (мс) */
  reconnectDelay?: number
  /** Максимальное количество попыток переподключения */
  maxReconnectAttempts?: number
  /** Callback при изменении уровня угрозы */
  onThreatLevelChange?: (
    event: ThreatLevelChangeEvent & {
      anomalyName?: string
      previousThreatLevel?: ThreatLevel
    }
  ) => void
}

/**
 * Hook для подписки на SSE обновления аномалий
 *
 * Реализует:
 * - Подписку на Server-Sent Events
 * - Обновление кэша TanStack Query при получении события
 * - Автоматическое переподключение при разрыве соединения
 */
export function useAnomalyStream(options: UseAnomalyStreamOptions = {}) {
  const {
    enabled = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 10,
    onThreatLevelChange,
  } = options

  const queryClient = useQueryClient()
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Храним callbacks в refs, чтобы избежать пересоздания эффекта
  const onThreatLevelChangeRef = useRef(onThreatLevelChange)
  const queryClientRef = useRef(queryClient)
  
  // Обновляем refs при изменении
  useEffect(() => {
    onThreatLevelChangeRef.current = onThreatLevelChange
  }, [onThreatLevelChange])
  
  useEffect(() => {
    queryClientRef.current = queryClient
  }, [queryClient])

  /**
   * Обработка SSE события изменения уровня угрозы
   * Использует refs для избежания пересоздания функции
   */
  const handleThreatLevelChange = useCallback(
    (
      event: ThreatLevelChangeEvent & {
        anomalyName?: string
        previousThreatLevel?: ThreatLevel
      }
    ) => {
      // Обновляем кэш TanStack Query через ref
      queryClientRef.current.setQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((anomaly) =>
          anomaly.id === event.anomalyId
            ? { ...anomaly, threatLevel: event.newThreatLevel }
            : anomaly
        )
      })

      // Вызываем callback, если передан (через ref)
      onThreatLevelChangeRef.current?.(event)
    },
    [] // Пустые зависимости - используем refs
  )

  /**
   * Отключение от SSE
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    reconnectAttemptsRef.current = 0
    setIsConnected(false)
  }, [])

  /**
   * Эффект для управления подключением
   * Зависимости минимизированы для избежания бесконечных циклов
   */
  useEffect(() => {
    // Проверка на клиентскую среду
    if (typeof window === 'undefined') return
    if (!enabled) return

    let isMounted = true
    let localEventSource: EventSource | null = null
    let localReconnectTimeout: NodeJS.Timeout | null = null
    let localReconnectAttempts = 0

    const connectSSE = () => {
      // Не подключаемся, если уже есть соединение или компонент размонтирован
      if (!isMounted || localEventSource) return

      try {
        const eventSource = new EventSource('/api/anomalies/stream')
        localEventSource = eventSource
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          if (!isMounted) return
          localReconnectAttempts = 0
          reconnectAttemptsRef.current = 0
          setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
          if (!isMounted) return
          try {
            const data: SSEEvent = JSON.parse(event.data)

            if (data.type === 'threat_level_change') {
              const validatedBase = threatLevelChangeEventSchema.safeParse(data)

              if (validatedBase.success) {
                handleThreatLevelChange({
                  ...validatedBase.data,
                  anomalyName: data.anomalyName as string | undefined,
                  previousThreatLevel: data.previousThreatLevel as ThreatLevel | undefined,
                })
              }
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError)
          }
        }

        eventSource.onerror = () => {
          if (!isMounted) return
          
          // Закрываем соединение
          eventSource.close()
          localEventSource = null
          eventSourceRef.current = null
          setIsConnected(false)

          // Пробуем переподключиться
          if (localReconnectAttempts < maxReconnectAttempts) {
            localReconnectAttempts++
            reconnectAttemptsRef.current = localReconnectAttempts

            localReconnectTimeout = setTimeout(() => {
              if (isMounted) {
                connectSSE()
              }
            }, reconnectDelay)
            reconnectTimeoutRef.current = localReconnectTimeout
          }
        }
      } catch (error) {
        console.error('Failed to create EventSource:', error)
      }
    }

    connectSSE()

    // Очистка при размонтировании
    return () => {
      isMounted = false
      
      if (localReconnectTimeout) {
        clearTimeout(localReconnectTimeout)
      }
      
      if (localEventSource) {
        localEventSource.close()
      }
      
      eventSourceRef.current = null
      reconnectTimeoutRef.current = null
      setIsConnected(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reconnectDelay, maxReconnectAttempts])

  return {
    /** Статус подключения */
    isConnected,
    /** Отключиться */
    disconnect,
  }
}
