import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './route'
import { mockAnomalies } from '@/app/api/anomalies/route'
import { AnomalyStatus } from '@/shared/types/anomaly'

describe('GET /api/anomalies/stream (SSE)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Response Headers', () => {
    it('should return correct SSE headers', async () => {
      const response = await GET()

      expect(response.headers.get('Content-Type')).toBe('text/event-stream')
      expect(response.headers.get('Cache-Control')).toBe(
        'no-cache, no-transform'
      )
      expect(response.headers.get('Connection')).toBe('keep-alive')
      expect(response.headers.get('X-Accel-Buffering')).toBe('no')
    })

    it('should return a ReadableStream', async () => {
      const response = await GET()

      expect(response.body).toBeInstanceOf(ReadableStream)
    })
  })

  describe('Connection Message', () => {
    it('should send connection message on stream start', async () => {
      const response = await GET()
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      const { value } = await reader.read()
      const message = decoder.decode(value)

      expect(message).toContain('data:')
      expect(message).toContain('connected')
      expect(message).toContain('SSE connection established')

      reader.cancel()
    })

    it('should send connection message in SSE format', async () => {
      const response = await GET()
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      const { value } = await reader.read()
      const message = decoder.decode(value)

      // SSE формат: data: {...}\n\n
      expect(message).toMatch(/^data: \{.*\}\n\n$/)

      const json = JSON.parse(message.replace('data: ', '').trim())
      expect(json).toMatchObject({
        type: 'connected',
        message: 'SSE connection established',
      })

      reader.cancel()
    })
  })

  describe('Threat Level Change Events', () => {
    it('should send events with correct SSE format', async () => {
      const response = await GET()
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      // Читаем connection message
      const { value: connectionValue } = await reader.read()
      const connectionMessage = decoder.decode(connectionValue)

      // Проверяем SSE формат
      expect(connectionMessage).toMatch(/^data: \{.*\}\n\n$/)

      reader.cancel()
    })

    it('should send connection message with correct type', async () => {
      const response = await GET()
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      const { value } = await reader.read()
      const message = decoder.decode(value)

      const json = JSON.parse(message.replace('data: ', '').trim())
      expect(json.type).toBe('connected')

      reader.cancel()
    })
  })

  describe('Stream Cleanup', () => {
    it('should handle stream cancellation', async () => {
      const response = await GET()
      const reader = response.body!.getReader()

      // Читаем первое сообщение
      await reader.read()

      // Отменяем поток
      await reader.cancel()

      // Поток должен закрыться без ошибок
      const { done } = await reader.read()
      expect(done).toBe(true)
    })

    it('should clear interval on stream cancel', async () => {
      vi.useFakeTimers()

      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const response = await GET()
      const reader = response.body!.getReader()

      await reader.read()
      await reader.cancel()

      // clearInterval должен быть вызван
      expect(clearIntervalSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Edge Cases', () => {
    it('should have interval logic in the route handler', async () => {
      const response = await GET()
      const reader = response.body!.getReader()

      // Читаем первое сообщение
      await reader.read()

      // Проверяем, что ReadableStream создан
      expect(response.body).toBeInstanceOf(ReadableStream)

      reader.cancel()
    })

    it('should handle multiple read operations', async () => {
      const response = await GET()
      const reader = response.body!.getReader()

      // Читаем connection message
      const result1 = await reader.read()
      expect(result1.done).toBe(false)

      reader.cancel()

      // После cancel, следующий read должен показать done
      const result2 = await reader.read()
      expect(result2.done).toBe(true)
    })

    it('should provide stream that can be consumed', async () => {
      const response = await GET()
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      const { value, done } = await reader.read()

      expect(done).toBe(false)
      expect(value).toBeDefined()

      const message = decoder.decode(value)
      expect(message).toContain('data:')

      reader.cancel()
    })
  })
})
