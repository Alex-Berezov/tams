import type { BadgeVariant } from '@shared/ui'
import { ThreatLevel, AnomalyStatus } from '../types/anomaly'

/**
 * Map ThreatLevel to Badge variant for UI display
 */
export function getThreatLevelBadgeVariant(level: ThreatLevel): BadgeVariant {
  const variantMap: Record<ThreatLevel, BadgeVariant> = {
    [ThreatLevel.LOW]: 'success',
    [ThreatLevel.MEDIUM]: 'warning',
    [ThreatLevel.HIGH]: 'danger',
    [ThreatLevel.CRITICAL]: 'critical',
  }
  return variantMap[level]
}

/**
 * Map AnomalyStatus to Badge variant for UI display
 */
export function getStatusBadgeVariant(status: AnomalyStatus): BadgeVariant {
  const variantMap: Record<AnomalyStatus, BadgeVariant> = {
    [AnomalyStatus.ACTIVE]: 'success',
    [AnomalyStatus.CAPTURED]: 'muted',
  }
  return variantMap[status]
}

/**
 * Format ThreatLevel for display
 */
export function formatThreatLevel(level: ThreatLevel): string {
  const labelMap: Record<ThreatLevel, string> = {
    [ThreatLevel.LOW]: 'Low',
    [ThreatLevel.MEDIUM]: 'Medium',
    [ThreatLevel.HIGH]: 'High',
    [ThreatLevel.CRITICAL]: 'Critical',
  }
  return labelMap[level]
}

/**
 * Format AnomalyStatus for display
 */
export function formatAnomalyStatus(status: AnomalyStatus): string {
  const labelMap: Record<AnomalyStatus, string> = {
    [AnomalyStatus.ACTIVE]: 'Active',
    [AnomalyStatus.CAPTURED]: 'Captured',
  }
  return labelMap[status]
}
