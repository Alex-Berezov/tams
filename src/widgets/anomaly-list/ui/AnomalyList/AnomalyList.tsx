'use client'

import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api'
import { AnomalyCard } from '@entities/anomaly'
import { useCaptureAnomaly } from '@features/capture-anomaly'
import { ANOMALIES_QUERY_KEY } from '@shared/config'
import { Button } from '@shared/ui'
import { Anomaly, anomaliesArraySchema } from '@shared/types'
import styles from './AnomalyList.module.scss'

/**
 * Функция для загрузки списка аномалий
 */
async function fetchAnomalies(): Promise<Anomaly[]> {
  const response = await get<Anomaly[]>('/api/anomalies')
  // Валидация через Zod
  return anomaliesArraySchema.parse(response)
}

export interface AnomalyListProps {
  className?: string
}

/**
 * Widget: AnomalyList
 *
 * Отображает список аномалий (духов) с возможностью захвата.
 * Включает состояния: loading, error, empty.
 */
export const AnomalyList: React.FC<AnomalyListProps> = ({ className }) => {
  const {
    data: anomalies,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ANOMALIES_QUERY_KEY,
    queryFn: fetchAnomalies,
    staleTime: 30000, // 30 секунд
    refetchOnWindowFocus: false,
  })

  const {
    mutate: captureAnomaly,
    isPending: isCapturing,
    variables: capturingId,
  } = useCaptureAnomaly()

  const handleCapture = (id: string) => {
    captureAnomaly(id)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`${styles.anomalyList} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Scanning for anomalies...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={`${styles.anomalyList} ${className || ''}`}>
        <div className={styles.error}>
          <svg
            className={styles.errorIcon}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='8' x2='12' y2='12' />
            <line x1='12' y1='16' x2='12.01' y2='16' />
          </svg>
          <h3 className={styles.errorTitle}>Connection Lost</h3>
          <p className={styles.errorMessage}>
            {error instanceof Error
              ? error.message
              : 'Failed to load anomalies. The spiritual network may be disrupted.'}
          </p>
          <Button
            variant='primary'
            onClick={() => refetch()}
            className={styles.retryButton}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className={`${styles.anomalyList} ${className || ''}`}>
        <div className={styles.empty}>
          <svg
            className={styles.emptyIcon}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.5'
          >
            <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' />
            <path d='M8 14s1.5 2 4 2 4-2 4-2' />
            <circle cx='9' cy='9' r='1.5' fill='currentColor' />
            <circle cx='15' cy='9' r='1.5' fill='currentColor' />
          </svg>
          <h3 className={styles.emptyTitle}>All Clear</h3>
          <p className={styles.emptyMessage}>
            No anomalies detected in Tokyo. The city is safe... for now.
          </p>
        </div>
      </div>
    )
  }

  // Count stats
  const activeCount = anomalies.filter((a) => a.status === 'active').length
  const capturedCount = anomalies.filter((a) => a.status === 'captured').length

  return (
    <div className={`${styles.anomalyList} ${className || ''}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Anomaly Monitor</h2>
        <span className={styles.count}>
          {activeCount} active / {capturedCount} captured
        </span>
      </header>

      <div className={styles.grid}>
        {anomalies.map((anomaly) => (
          <AnomalyCard
            key={anomaly.id}
            anomaly={anomaly}
            onCapture={handleCapture}
            isCapturing={isCapturing && capturingId === anomaly.id}
          />
        ))}
      </div>
    </div>
  )
}
