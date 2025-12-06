// Anomaly entity types
// Re-export from shared for FSD compliance

export {
  ThreatLevel,
  AnomalyStatus,
  threatLevelSchema,
  anomalyStatusSchema,
  anomalySchema,
  anomaliesArraySchema,
} from '@shared/types'

export type { Anomaly } from '@shared/types'
