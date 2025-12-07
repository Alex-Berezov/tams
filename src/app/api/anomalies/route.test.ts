import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, mockAnomalies } from './route'
import { anomaliesArraySchema } from '@/shared/types/anomaly'

describe('GET /api/anomalies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Success Cases', () => {
    it('should return array of anomalies', async () => {
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(10)
    })

    it('should return validated data matching Zod schema', async () => {
      const response = await GET()
      const data = await response.json()

      // Проверяем, что данные проходят валидацию
      const result = anomaliesArraySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should return all mock anomalies', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data).toEqual(mockAnomalies)
    })

    it('should return 200 status code', async () => {
      const response = await GET()

      expect(response.status).toBe(200)
    })
  })

  describe('Data Structure', () => {
    it('should return anomalies with required fields', async () => {
      const response = await GET()
      const data = await response.json()
      const anomaly = data[0]

      expect(anomaly).toHaveProperty('id')
      expect(anomaly).toHaveProperty('name')
      expect(anomaly).toHaveProperty('threatLevel')
      expect(anomaly).toHaveProperty('location')
      expect(anomaly).toHaveProperty('status')
    })

    it('should include both active and captured anomalies', async () => {
      const response = await GET()
      const data = await response.json()

      const hasActive = data.some((a: any) => a.status === 'active')
      const hasCaptured = data.some((a: any) => a.status === 'captured')

      expect(hasActive).toBe(true)
      expect(hasCaptured).toBe(true)
    })

    it('should include all threat levels', async () => {
      const response = await GET()
      const data = await response.json()

      const hasLow = data.some((a: any) => a.threatLevel === 'low')
      const hasMedium = data.some((a: any) => a.threatLevel === 'medium')
      const hasHigh = data.some((a: any) => a.threatLevel === 'high')
      const hasCritical = data.some((a: any) => a.threatLevel === 'critical')

      expect(hasLow).toBe(true)
      expect(hasMedium).toBe(true)
      expect(hasHigh).toBe(true)
      expect(hasCritical).toBe(true)
    })
  })
})
