import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { mockAnomalies } from '@/app/api/anomalies/route'
import { AnomalyStatus, type Anomaly } from '@/shared/types/anomaly'

// Mock Math.random для контроля 30% вероятности ошибки
const mockRandom = vi.spyOn(Math, 'random')

describe('POST /api/anomalies/[id]/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // По умолчанию успешный сценарий (random > 0.3)
    mockRandom.mockReturnValue(0.5)

    // Сбрасываем состояние mockAnomalies
    mockAnomalies[0] = {
      id: '1',
      name: 'Kitsune',
      threatLevel: 'high',
      location: 'Shibuya District',
      status: AnomalyStatus.ACTIVE,
    }
  })

  describe('Success Cases', () => {
    it('should successfully capture an active anomaly', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('anomaly')
      expect(data.anomaly.status).toBe(AnomalyStatus.CAPTURED)
    })

    it('should update anomaly status to captured', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      await POST(request, { params })

      const capturedAnomaly = mockAnomalies.find((a: Anomaly) => a.id === '1')
      expect(capturedAnomaly?.status).toBe(AnomalyStatus.CAPTURED)
    })

    it('should return validated anomaly data', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(data.anomaly).toMatchObject({
        id: '1',
        name: 'Kitsune',
        threatLevel: 'high',
        location: 'Shibuya District',
        status: 'captured',
      })
    })
  })

  describe('Error Cases - 404 Not Found', () => {
    it('should return 404 if anomaly does not exist', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: 'non-existent-id' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('not found')
    })

    it('should include anomaly id in error message', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '999' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(data.error).toContain('999')
    })
  })

  describe('Error Cases - 400 Already Captured', () => {
    it('should return 400 if anomaly is already captured', async () => {
      // Устанавливаем статус как захваченный
      mockAnomalies[0] = {
        ...mockAnomalies[0],
        status: AnomalyStatus.CAPTURED,
      }

      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('already captured')
    })

    it('should include anomaly name in already captured error', async () => {
      mockAnomalies[0] = {
        ...mockAnomalies[0],
        status: AnomalyStatus.CAPTURED,
      }

      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(data.error).toContain('Kitsune')
    })
  })

  describe('Error Cases - 500 Random Failure', () => {
    it('should return 500 when random failure occurs (30% chance)', async () => {
      // Симулируем failure (random < 0.3)
      mockRandom.mockReturnValue(0.2)

      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Capture failed')
    })

    it('should include anomaly name in failure message', async () => {
      mockRandom.mockReturnValue(0.1)

      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(data.error).toContain('Kitsune')
      expect(data.error).toContain('escaped')
    })

    it('should not update anomaly status on random failure', async () => {
      mockRandom.mockReturnValue(0.15)

      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      await POST(request, { params })

      const anomaly = mockAnomalies.find((a: Anomaly) => a.id === '1')
      expect(anomaly?.status).toBe(AnomalyStatus.ACTIVE)
    })
  })

  describe('Edge Cases', () => {
    it('should handle different anomaly IDs', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '2' })

      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.anomaly.id).toBe('2')
    })

    it('should preserve anomaly properties on capture', async () => {
      const request = {} as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await POST(request, { params })
      const data = await response.json()

      const anomaly = data.anomaly
      expect(anomaly.name).toBe('Kitsune')
      expect(anomaly.threatLevel).toBe('high')
      expect(anomaly.location).toBe('Shibuya District')
    })
  })
})
