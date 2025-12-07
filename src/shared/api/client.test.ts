import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ApiError, apiClient, get, post } from './client'

// Mock data
const mockSuccessData = { id: '1', name: 'Test Anomaly' }
const mockErrorData = { error: 'Not found', code: 'NOT_FOUND' }

// Setup MSW server
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Client - client.ts', () => {
  describe('ApiError class', () => {
    it('should create an error with message, status, and code', () => {
      const error = new ApiError('Test error', 404, 'NOT_FOUND')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.name).toBe('ApiError')
    })

    it('should create an error without code', () => {
      const error = new ApiError('Test error', 500)

      expect(error.message).toBe('Test error')
      expect(error.status).toBe(500)
      expect(error.code).toBeUndefined()
    })
  })

  describe('apiClient - success scenarios', () => {
    it('should successfully fetch data from an endpoint', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(mockSuccessData)
        })
      )

      const result = await apiClient('/api/test')
      expect(result).toEqual(mockSuccessData)
    })

    it('should handle custom headers', async () => {
      let receivedHeaders: Headers | undefined

      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          receivedHeaders = request.headers
          return HttpResponse.json(mockSuccessData)
        })
      )

      await apiClient('/api/test', {
        headers: {
          'X-Custom-Header': 'test-value',
        },
      })

      expect(receivedHeaders?.get('X-Custom-Header')).toBe('test-value')
      expect(receivedHeaders?.get('Content-Type')).toBe('application/json')
    })

    it('should use default Content-Type header', async () => {
      let receivedHeaders: Headers | undefined

      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          receivedHeaders = request.headers
          return HttpResponse.json(mockSuccessData)
        })
      )

      await apiClient('/api/test')

      expect(receivedHeaders?.get('Content-Type')).toBe('application/json')
    })
  })

  describe('apiClient - error scenarios', () => {
    it('should throw ApiError on 404 response', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(mockErrorData, { status: 404 })
        })
      )

      await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
      await expect(apiClient('/api/test')).rejects.toMatchObject({
        message: 'Not found',
        status: 404,
      })
    })

    it('should throw ApiError on 500 response', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
      await expect(apiClient('/api/test')).rejects.toMatchObject({
        message: 'Internal server error',
        status: 500,
      })
    })

    it('should handle response without error message', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json({}, { status: 400 })
        })
      )

      await expect(apiClient('/api/test')).rejects.toMatchObject({
        message: 'HTTP Error: 400',
        status: 400,
      })
    })

    it('should handle non-JSON error responses', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return new HttpResponse('Plain text error', { status: 500 })
        })
      )

      await expect(apiClient('/api/test')).rejects.toMatchObject({
        status: 500,
      })
    })
  })

  describe('apiClient - timeout scenarios', () => {
    it('should timeout after specified duration', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', async () => {
          // Delay response longer than timeout
          await new Promise((resolve) => setTimeout(resolve, 200))
          return HttpResponse.json(mockSuccessData)
        })
      )

      await expect(
        apiClient('/api/test', { timeout: 50 })
      ).rejects.toMatchObject({
        message: 'Request timeout',
        status: 408,
        code: 'TIMEOUT',
      })
    }, 10000)

    it('should use default timeout if not specified', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(mockSuccessData)
        })
      )

      // Should not timeout with default (10s)
      const result = await apiClient('/api/test')
      expect(result).toEqual(mockSuccessData)
    })
  })

  describe('get helper', () => {
    it('should make GET request', async () => {
      let requestMethod: string | undefined

      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          requestMethod = request.method
          return HttpResponse.json(mockSuccessData)
        })
      )

      const result = await get('/api/test')

      expect(requestMethod).toBe('GET')
      expect(result).toEqual(mockSuccessData)
    })

    it('should pass config to apiClient', async () => {
      let receivedHeaders: Headers | undefined

      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          receivedHeaders = request.headers
          return HttpResponse.json(mockSuccessData)
        })
      )

      await get('/api/test', {
        headers: { 'X-Custom': 'value' },
      })

      expect(receivedHeaders?.get('X-Custom')).toBe('value')
    })
  })

  describe('post helper', () => {
    it('should make POST request with body', async () => {
      let requestMethod: string | undefined
      let requestBody: any

      server.use(
        http.post('http://localhost:3000/api/test', async ({ request }) => {
          requestMethod = request.method
          requestBody = await request.json()
          return HttpResponse.json(mockSuccessData)
        })
      )

      const postData = { name: 'Test' }
      const result = await post('/api/test', postData)

      expect(requestMethod).toBe('POST')
      expect(requestBody).toEqual(postData)
      expect(result).toEqual(mockSuccessData)
    })

    it('should make POST request without body', async () => {
      let requestMethod: string | undefined
      let hasBody: boolean = false

      server.use(
        http.post('http://localhost:3000/api/test', async ({ request }) => {
          requestMethod = request.method
          const text = await request.text()
          hasBody = text.length > 0
          return HttpResponse.json(mockSuccessData)
        })
      )

      const result = await post('/api/test')

      expect(requestMethod).toBe('POST')
      expect(hasBody).toBe(false)
      expect(result).toEqual(mockSuccessData)
    })

    it('should pass config to apiClient', async () => {
      let receivedHeaders: Headers | undefined

      server.use(
        http.post('http://localhost:3000/api/test', ({ request }) => {
          receivedHeaders = request.headers
          return HttpResponse.json(mockSuccessData)
        })
      )

      await post('/api/test', null, {
        headers: { 'X-Custom': 'value' },
      })

      expect(receivedHeaders?.get('X-Custom')).toBe('value')
    })
  })

  describe('Edge cases', () => {
    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.error()
        })
      )

      await expect(apiClient('/api/test')).rejects.toThrow(ApiError)
    })

    it('should construct proper URL with baseUrl', async () => {
      let requestedUrl: string | undefined

      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          requestedUrl = request.url
          return HttpResponse.json(mockSuccessData)
        })
      )

      await apiClient('/api/test')

      expect(requestedUrl).toBe('http://localhost:3000/api/test')
    })
  })
})
