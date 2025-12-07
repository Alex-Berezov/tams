import { describe, it, expect } from 'vitest'
import {
  getThreatLevelBadgeVariant,
  getStatusBadgeVariant,
  formatThreatLevel,
  formatAnomalyStatus,
} from './anomaly-helpers'
import { ThreatLevel, AnomalyStatus } from '../types/anomaly'

describe('Helper Functions - anomaly-helpers.ts', () => {
  describe('getThreatLevelBadgeVariant', () => {
    it('should map LOW to success variant', () => {
      expect(getThreatLevelBadgeVariant(ThreatLevel.LOW)).toBe('success')
    })

    it('should map MEDIUM to warning variant', () => {
      expect(getThreatLevelBadgeVariant(ThreatLevel.MEDIUM)).toBe('warning')
    })

    it('should map HIGH to danger variant', () => {
      expect(getThreatLevelBadgeVariant(ThreatLevel.HIGH)).toBe('danger')
    })

    it('should map CRITICAL to critical variant', () => {
      expect(getThreatLevelBadgeVariant(ThreatLevel.CRITICAL)).toBe('critical')
    })

    it('should handle all ThreatLevel values', () => {
      const allLevels = Object.values(ThreatLevel)
      allLevels.forEach((level) => {
        const variant = getThreatLevelBadgeVariant(level)
        expect(variant).toBeDefined()
        expect(typeof variant).toBe('string')
      })
    })
  })

  describe('getStatusBadgeVariant', () => {
    it('should map ACTIVE to success variant', () => {
      expect(getStatusBadgeVariant(AnomalyStatus.ACTIVE)).toBe('success')
    })

    it('should map CAPTURED to muted variant', () => {
      expect(getStatusBadgeVariant(AnomalyStatus.CAPTURED)).toBe('muted')
    })

    it('should handle all AnomalyStatus values', () => {
      const allStatuses = Object.values(AnomalyStatus)
      allStatuses.forEach((status) => {
        const variant = getStatusBadgeVariant(status)
        expect(variant).toBeDefined()
        expect(typeof variant).toBe('string')
      })
    })
  })

  describe('formatThreatLevel', () => {
    it('should format LOW as "Low"', () => {
      expect(formatThreatLevel(ThreatLevel.LOW)).toBe('Low')
    })

    it('should format MEDIUM as "Medium"', () => {
      expect(formatThreatLevel(ThreatLevel.MEDIUM)).toBe('Medium')
    })

    it('should format HIGH as "High"', () => {
      expect(formatThreatLevel(ThreatLevel.HIGH)).toBe('High')
    })

    it('should format CRITICAL as "Critical"', () => {
      expect(formatThreatLevel(ThreatLevel.CRITICAL)).toBe('Critical')
    })

    it('should return proper case for all threat levels', () => {
      const allLevels = Object.values(ThreatLevel)
      allLevels.forEach((level) => {
        const formatted = formatThreatLevel(level)
        // Should be capitalized
        expect(formatted[0]).toBe(formatted[0].toUpperCase())
        expect(formatted.length).toBeGreaterThan(0)
      })
    })
  })

  describe('formatAnomalyStatus', () => {
    it('should format ACTIVE as "Active"', () => {
      expect(formatAnomalyStatus(AnomalyStatus.ACTIVE)).toBe('Active')
    })

    it('should format CAPTURED as "Captured"', () => {
      expect(formatAnomalyStatus(AnomalyStatus.CAPTURED)).toBe('Captured')
    })

    it('should return proper case for all statuses', () => {
      const allStatuses = Object.values(AnomalyStatus)
      allStatuses.forEach((status) => {
        const formatted = formatAnomalyStatus(status)
        // Should be capitalized
        expect(formatted[0]).toBe(formatted[0].toUpperCase())
        expect(formatted.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Integration - Badge variants match formatting', () => {
    it('should provide consistent mapping for threat levels', () => {
      const levels = Object.values(ThreatLevel)
      levels.forEach((level) => {
        const variant = getThreatLevelBadgeVariant(level)
        const formatted = formatThreatLevel(level)

        // Both should return defined values
        expect(variant).toBeDefined()
        expect(formatted).toBeDefined()

        // Formatted should be a readable string
        expect(formatted.length).toBeGreaterThan(2)
      })
    })

    it('should provide consistent mapping for statuses', () => {
      const statuses = Object.values(AnomalyStatus)
      statuses.forEach((status) => {
        const variant = getStatusBadgeVariant(status)
        const formatted = formatAnomalyStatus(status)

        // Both should return defined values
        expect(variant).toBeDefined()
        expect(formatted).toBeDefined()

        // Formatted should be a readable string
        expect(formatted.length).toBeGreaterThan(2)
      })
    })
  })
})
