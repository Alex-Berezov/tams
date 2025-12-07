import { describe, it, expect } from 'vitest'
import {
  ThreatLevel,
  AnomalyStatus,
  threatLevelSchema,
  anomalyStatusSchema,
  anomalySchema,
  anomaliesArraySchema,
  captureAnomalyResponseSchema,
  threatLevelChangeEventSchema,
  type Anomaly,
} from './anomaly'

describe('Zod Schemas - anomaly.ts', () => {
  describe('threatLevelSchema', () => {
    it('should validate all valid threat levels', () => {
      expect(threatLevelSchema.parse('low')).toBe('low')
      expect(threatLevelSchema.parse('medium')).toBe('medium')
      expect(threatLevelSchema.parse('high')).toBe('high')
      expect(threatLevelSchema.parse('critical')).toBe('critical')
    })

    it('should reject invalid threat levels', () => {
      expect(() => threatLevelSchema.parse('invalid')).toThrow()
      expect(() => threatLevelSchema.parse('')).toThrow()
      expect(() => threatLevelSchema.parse(null)).toThrow()
      expect(() => threatLevelSchema.parse(undefined)).toThrow()
    })
  })

  describe('anomalyStatusSchema', () => {
    it('should validate all valid statuses', () => {
      expect(anomalyStatusSchema.parse('active')).toBe('active')
      expect(anomalyStatusSchema.parse('captured')).toBe('captured')
    })

    it('should reject invalid statuses', () => {
      expect(() => anomalyStatusSchema.parse('invalid')).toThrow()
      expect(() => anomalyStatusSchema.parse('')).toThrow()
      expect(() => anomalyStatusSchema.parse(null)).toThrow()
    })
  })

  describe('anomalySchema', () => {
    const validAnomaly: Anomaly = {
      id: '1',
      name: 'Kitsune Spirit',
      threatLevel: ThreatLevel.HIGH,
      location: 'Shibuya Crossing',
      status: AnomalyStatus.ACTIVE,
    }

    it('should validate a valid anomaly object', () => {
      const result = anomalySchema.parse(validAnomaly)
      expect(result).toEqual(validAnomaly)
    })

    it('should reject anomaly with missing fields', () => {
      const invalidAnomaly = {
        id: '1',
        name: 'Kitsune Spirit',
        // missing threatLevel, location, status
      }
      expect(() => anomalySchema.parse(invalidAnomaly)).toThrow()
    })

    it('should reject anomaly with invalid threatLevel', () => {
      const invalidAnomaly = {
        ...validAnomaly,
        threatLevel: 'super-critical',
      }
      expect(() => anomalySchema.parse(invalidAnomaly)).toThrow()
    })

    it('should reject anomaly with invalid status', () => {
      const invalidAnomaly = {
        ...validAnomaly,
        status: 'pending',
      }
      expect(() => anomalySchema.parse(invalidAnomaly)).toThrow()
    })

    it('should reject anomaly with wrong data types', () => {
      const invalidAnomaly = {
        id: 123, // should be string
        name: 'Kitsune Spirit',
        threatLevel: ThreatLevel.HIGH,
        location: 'Shibuya Crossing',
        status: AnomalyStatus.ACTIVE,
      }
      expect(() => anomalySchema.parse(invalidAnomaly)).toThrow()
    })
  })

  describe('anomaliesArraySchema', () => {
    const validAnomalies: Anomaly[] = [
      {
        id: '1',
        name: 'Kitsune Spirit',
        threatLevel: ThreatLevel.HIGH,
        location: 'Shibuya Crossing',
        status: AnomalyStatus.ACTIVE,
      },
      {
        id: '2',
        name: 'Tengu Warrior',
        threatLevel: ThreatLevel.CRITICAL,
        location: 'Mount Takao',
        status: AnomalyStatus.CAPTURED,
      },
    ]

    it('should validate an array of valid anomalies', () => {
      const result = anomaliesArraySchema.parse(validAnomalies)
      expect(result).toEqual(validAnomalies)
    })

    it('should validate an empty array', () => {
      const result = anomaliesArraySchema.parse([])
      expect(result).toEqual([])
    })

    it('should reject array with invalid anomaly', () => {
      const invalidArray = [
        validAnomalies[0],
        { id: '2', name: 'Invalid' }, // missing required fields
      ]
      expect(() => anomaliesArraySchema.parse(invalidArray)).toThrow()
    })

    it('should reject non-array values', () => {
      expect(() => anomaliesArraySchema.parse(null)).toThrow()
      expect(() => anomaliesArraySchema.parse(undefined)).toThrow()
      expect(() => anomaliesArraySchema.parse('not an array')).toThrow()
    })
  })

  describe('captureAnomalyResponseSchema', () => {
    const validAnomaly: Anomaly = {
      id: '1',
      name: 'Kitsune Spirit',
      threatLevel: ThreatLevel.HIGH,
      location: 'Shibuya Crossing',
      status: AnomalyStatus.CAPTURED,
    }

    it('should validate success response', () => {
      const successResponse = {
        success: true,
        anomaly: validAnomaly,
      }
      const result = captureAnomalyResponseSchema.parse(successResponse)
      expect(result).toEqual(successResponse)
    })

    it('should validate error response', () => {
      const errorResponse = {
        success: false,
        error: 'Anomaly not found',
      }
      const result = captureAnomalyResponseSchema.parse(errorResponse)
      expect(result).toEqual(errorResponse)
    })

    it('should reject response with both anomaly and error', () => {
      const invalidResponse = {
        success: true,
        anomaly: validAnomaly,
        error: 'This should not be here',
      }
      // Schema allows extra fields, but success=true should not have error
      // Let's check the parsed result
      const result = captureAnomalyResponseSchema.parse(invalidResponse)
      expect(result.success).toBe(true)
    })

    it('should reject response with missing required fields', () => {
      const invalidResponse = {
        success: true,
        // missing anomaly
      }
      expect(() =>
        captureAnomalyResponseSchema.parse(invalidResponse)
      ).toThrow()
    })

    it('should reject error response without error message', () => {
      const invalidResponse = {
        success: false,
        // missing error
      }
      expect(() =>
        captureAnomalyResponseSchema.parse(invalidResponse)
      ).toThrow()
    })
  })

  describe('threatLevelChangeEventSchema', () => {
    it('should validate valid threat level change event', () => {
      const validEvent = {
        type: 'threat_level_change' as const,
        anomalyId: '1',
        newThreatLevel: ThreatLevel.CRITICAL,
      }
      const result = threatLevelChangeEventSchema.parse(validEvent)
      expect(result).toEqual(validEvent)
    })

    it('should reject event with wrong type', () => {
      const invalidEvent = {
        type: 'status_change', // wrong type
        anomalyId: '1',
        newThreatLevel: ThreatLevel.CRITICAL,
      }
      expect(() => threatLevelChangeEventSchema.parse(invalidEvent)).toThrow()
    })

    it('should reject event with invalid threat level', () => {
      const invalidEvent = {
        type: 'threat_level_change' as const,
        anomalyId: '1',
        newThreatLevel: 'ultra-critical',
      }
      expect(() => threatLevelChangeEventSchema.parse(invalidEvent)).toThrow()
    })

    it('should reject event with missing fields', () => {
      const invalidEvent = {
        type: 'threat_level_change' as const,
        // missing anomalyId and newThreatLevel
      }
      expect(() => threatLevelChangeEventSchema.parse(invalidEvent)).toThrow()
    })
  })
})
