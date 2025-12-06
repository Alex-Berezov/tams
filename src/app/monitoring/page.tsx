'use client'

import { useAnomalyStream } from '@features/realtime-updates'
import { AnomalyList } from '@widgets/anomaly-list'
import { useNotifications } from '@widgets/notification-container'
import styles from './page.module.scss'

/**
 * Страница мониторинга аномалий (духов)
 *
 * Композиция виджетов:
 * - AnomalyList: список аномалий с возможностью захвата
 * - SSE подписка для real-time обновлений
 */
export default function MonitoringPage() {
  const { info, warning } = useNotifications()

  // Подключаем SSE стрим для real-time обновлений
  const { isConnected } = useAnomalyStream({
    enabled: true,
    onThreatLevelChange: (event) => {
      // Уведомление при изменении уровня угрозы
      const name = event.anomalyName || `Anomaly ${event.anomalyId}`
      const level = event.newThreatLevel.toUpperCase()

      if (event.newThreatLevel === 'critical') {
        warning(`⚠️ ${name} threat level escalated to ${level}!`)
      } else {
        info(`${name} threat level changed to ${level}`)
      }
    },
  })

  return (
    <main className={styles.monitoringPage}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>
            <svg
              className={styles.titleIcon}
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
            Tokyo Anomaly Monitoring System
          </h1>

          <div className={styles.status}>
            <span
              className={`${styles.statusDot} ${
                !isConnected ? styles.statusDotDisconnected : ''
              }`}
            />
            {isConnected ? 'Live Updates Active' : 'Reconnecting...'}
          </div>
        </div>

        <p className={styles.subtitle}>
          Real-time monitoring dashboard for spiritual anomalies across Tokyo.
          Track yokai activity, threat levels, and dispatch capture teams.
        </p>
      </header>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>
          <svg
            className={styles.sectionIcon}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
            <circle cx='9' cy='7' r='4' />
            <path d='M23 21v-2a4 4 0 0 0-3-3.87' />
            <path d='M16 3.13a4 4 0 0 1 0 7.75' />
          </svg>
          Active Anomalies
        </h2>

        <AnomalyList />
      </section>
    </main>
  )
}
