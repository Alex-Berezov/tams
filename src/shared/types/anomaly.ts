import { z } from 'zod';

/**
 * Threat level enum - уровень угрозы духа
 */
export const ThreatLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ThreatLevel = (typeof ThreatLevel)[keyof typeof ThreatLevel];

/**
 * Anomaly status enum - статус духа
 */
export const AnomalyStatus = {
  ACTIVE: 'active',
  CAPTURED: 'captured',
} as const;

export type AnomalyStatus = (typeof AnomalyStatus)[keyof typeof AnomalyStatus];

/**
 * Zod schema for ThreatLevel
 */
export const threatLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

/**
 * Zod schema for AnomalyStatus
 */
export const anomalyStatusSchema = z.enum(['active', 'captured']);

/**
 * Anomaly entity - сущность духа/аномалии
 */
export interface Anomaly {
  id: string;
  name: string;
  threatLevel: ThreatLevel;
  location: string;
  status: AnomalyStatus;
}

/**
 * Zod schema for Anomaly validation
 */
export const anomalySchema = z.object({
  id: z.string(),
  name: z.string(),
  threatLevel: threatLevelSchema,
  location: z.string(),
  status: anomalyStatusSchema,
});

/**
 * Zod schema for array of anomalies
 */
export const anomaliesArraySchema = z.array(anomalySchema);

/**
 * API Response types
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Zod schema for API success response
 */
export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/**
 * Zod schema for API error response
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

/**
 * SSE Event types for real-time updates
 */
export const SSEEventType = {
  THREAT_LEVEL_CHANGE: 'threat_level_change',
  STATUS_CHANGE: 'status_change',
} as const;

export type SSEEventType = (typeof SSEEventType)[keyof typeof SSEEventType];

export interface ThreatLevelChangeEvent {
  type: typeof SSEEventType.THREAT_LEVEL_CHANGE;
  anomalyId: string;
  newThreatLevel: ThreatLevel;
}

export const threatLevelChangeEventSchema = z.object({
  type: z.literal('threat_level_change'),
  anomalyId: z.string(),
  newThreatLevel: threatLevelSchema,
});

/**
 * Capture anomaly request/response
 */
export interface CaptureAnomalyRequest {
  anomalyId: string;
}

export interface CaptureAnomalyResponse {
  success: boolean;
  anomaly?: Anomaly;
  error?: string;
}

export const captureAnomalyResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    anomaly: anomalySchema,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);
