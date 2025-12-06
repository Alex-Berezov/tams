'use client'

import {
  Badge,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
} from '@shared/ui'
import {
  getThreatLevelBadgeVariant,
  getStatusBadgeVariant,
  formatThreatLevel,
  formatAnomalyStatus,
} from '@shared/lib'
import type { Anomaly, AnomalyStatus } from '@shared/types'
import styles from './AnomalyCard.module.scss'

export interface AnomalyCardProps {
  anomaly: Anomaly
  onCapture?: (id: string) => void
  isCapturing?: boolean
}

export const AnomalyCard: React.FC<AnomalyCardProps> = ({
  anomaly,
  onCapture,
  isCapturing = false,
}) => {
  const { id, name, threatLevel, location, status } = anomaly
  const isActive = status === 'active'

  const handleCapture = () => {
    if (onCapture && isActive) {
      onCapture(id)
    }
  }

  return (
    <Card
      className={`${styles.anomalyCard} ${styles[`threat-${threatLevel}`]}`}
    >
      <CardHeader className={styles.header}>
        <h3 className={styles.name}>{name}</h3>
        <Badge variant={getThreatLevelBadgeVariant(threatLevel)}>
          {formatThreatLevel(threatLevel)}
        </Badge>
      </CardHeader>

      <CardContent className={styles.content}>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Location:</span>
            <span className={styles.value}>{location}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Status:</span>
            <Badge variant={getStatusBadgeVariant(status)}>
              {formatAnomalyStatus(status)}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className={styles.footer}>
        <Button
          variant={isActive ? 'primary' : 'danger'}
          onClick={handleCapture}
          disabled={!isActive || isCapturing}
          isLoading={isCapturing}
        >
          {isActive ? 'Capture' : 'Captured'}
        </Button>
      </CardFooter>
    </Card>
  )
}
