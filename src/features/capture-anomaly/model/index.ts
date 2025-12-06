// Capture anomaly model (hooks, mutations)

'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post, ApiError } from '@shared/api'
import { useToast } from '@shared/ui'
import {
  Anomaly,
  AnomalyStatus,
  CaptureAnomalyResponse,
  captureAnomalyResponseSchema,
} from '@shared/types'

/**
 * Query key для списка аномалий
 */
export const ANOMALIES_QUERY_KEY = ['anomalies'] as const

/**
 * API функция для захвата духа
 */
async function captureAnomalyApi(
  anomalyId: string
): Promise<CaptureAnomalyResponse> {
  const response = await post<CaptureAnomalyResponse>(
    `/api/anomalies/${anomalyId}/capture`
  )

  // Валидация ответа через Zod
  const validated = captureAnomalyResponseSchema.parse(response)

  if (!validated.success) {
    throw new ApiError(validated.error, 500, 'CAPTURE_FAILED')
  }

  return validated
}

/**
 * Тип контекста для optimistic update
 */
interface CaptureContext {
  previousAnomalies: Anomaly[] | undefined
}

/**
 * Hook для захвата духа (аномалии)
 *
 * Реализует:
 * - Optimistic Update (мгновенное обновление UI)
 * - Rollback при ошибке (откат при 30% вероятности ошибки от API)
 * - Интеграция с Toast уведомлениями
 */
export function useCaptureAnomaly() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation<CaptureAnomalyResponse, ApiError, string, CaptureContext>({
    mutationFn: captureAnomalyApi,

    // Optimistic Update - мгновенно обновляем UI до завершения запроса
    onMutate: async (anomalyId: string) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали optimistic update
      await queryClient.cancelQueries({ queryKey: ANOMALIES_QUERY_KEY })

      // Сохраняем предыдущее состояние для возможного rollback
      const previousAnomalies =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)

      // Optimistic update - меняем статус на CAPTURED
      queryClient.setQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY, (old) => {
        if (!old) return old
        return old.map((anomaly) =>
          anomaly.id === anomalyId
            ? { ...anomaly, status: AnomalyStatus.CAPTURED }
            : anomaly
        )
      })

      // Возвращаем контекст для rollback
      return { previousAnomalies }
    },

    // Обработка ошибки - rollback к предыдущему состоянию
    onError: (error, anomalyId, context) => {
      // Rollback - восстанавливаем предыдущее состояние
      if (context?.previousAnomalies) {
        queryClient.setQueryData(ANOMALIES_QUERY_KEY, context.previousAnomalies)
      }

      // Показываем уведомление об ошибке
      showToast('error', error.message || 'Failed to capture anomaly')
    },

    // Обработка успеха
    onSuccess: (data) => {
      if (data.success && data.anomaly) {
        showToast('success', `${data.anomaly.name} successfully captured!`)
      }
    },

    // После завершения (успех или ошибка) - инвалидируем кэш для синхронизации с сервером
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ANOMALIES_QUERY_KEY })
    },
  })
}
