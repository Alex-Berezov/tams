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

  /**
   * Обработка SSE события изменения уровня угрозы
   */
  const handleThreatLevelChange = useCallback(
    (
      event: ThreatLevelChangeEvent & {
        anomalyName?: string
        previousThreatLevel?: ThreatLevel
      }
    ) => {
      // Обновляем кэш TanStack Query
      queryClient.setQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((anomaly) =>
          anomaly.id === event.anomalyId
            ? { ...anomaly, threatLevel: event.newThreatLevel }
            : anomaly
        )
      })

      // Вызываем callback, если передан
      onThreatLevelChange?.(event)
    },
    [queryClient, onThreatLevelChange]
  )

  /**
   * Подключение к SSE
   */
  const connect = useCallback(() => {
    // Не подключаемся, если отключено или уже есть соединение
    if (!enabled || eventSourceRef.current) return

    // Проверка на клиентскую среду
    if (typeof window === 'undefined') return

    try {
      const eventSource = new EventSource('/api/anomalies/stream')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        // Сбрасываем счётчик попыток при успешном подключении
        reconnectAttemptsRef.current = 0
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data)

          // Обрабатываем событие изменения уровня угрозы
          if (data.type === 'threat_level_change') {
            // Валидируем данные через Zod
            const validatedBase = threatLevelChangeEventSchema.safeParse(data)

            if (validatedBase.success) {
              handleThreatLevelChange({
                ...validatedBase.data,
                anomalyName: data.anomalyName as string | undefined,
                previousThreatLevel: data.previousThreatLevel as
                  | ThreatLevel
                  | undefined,
              })
            }
          }
          // Другие типы событий (connected, info) можно логировать или игнорировать
        } catch (parseError) {
          console.error('Failed to parse SSE event:', parseError)
        }
      }

      eventSource.onerror = () => {
        // Закрываем соединение
        eventSource.close()
        eventSourceRef.current = null
        setIsConnected(false)

        // Пробуем переподключиться
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectDelay)
        }
      }
    } catch (error) {
      console.error('Failed to create EventSource:', error)
    }
  }, [enabled, reconnectDelay, maxReconnectAttempts, handleThreatLevelChange])

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
   */
  useEffect(() => {
    if (enabled) {
      connect()
    } else {
      disconnect()
    }

    // Очистка при размонтировании
    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    /** Статус подключения */
    isConnected,
    /** Переподключиться вручную */
    reconnect: () => {
      disconnect()
      connect()
    },
    /** Отключиться */
    disconnect,
    /** Подключиться */
    connect,
  }
}
