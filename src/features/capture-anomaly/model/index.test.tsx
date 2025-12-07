import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCaptureAnomaly, ANOMALIES_QUERY_KEY } from './index'
import * as api from '@shared/api'
import { ToastProvider } from '@shared/ui'
import type { Anomaly, CaptureAnomalyResponse } from '@shared/types'
import { AnomalyStatus } from '@shared/types'

// Mock API module
vi.mock('@shared/api', async () => {
  const actual = await vi.importActual('@shared/api')
  return {
    ...actual,
    post: vi.fn(),
  }
})

describe('useCaptureAnomaly', () => {
  let queryClient: QueryClient
  const mockPost = vi.mocked(api.post)

  const mockAnomalies: Anomaly[] = [
    {
      id: 'anomaly-1',
      name: 'Kitsune',
      threatLevel: 'high',
      location: 'Shibuya',
      status: 'active',
    },
    {
      id: 'anomaly-2',
      name: 'Tanuki',
      threatLevel: 'low',
      location: 'Akihabara',
      status: 'active',
    },
    {
      id: 'anomaly-3',
      name: 'Tengu',
      threatLevel: 'medium',
      location: 'Shinjuku',
      status: 'captured',
    },
  ]

  // Wrapper with providers
  const createWrapper = () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
    return Wrapper
  }

  beforeEach(() => {
    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set initial anomalies data
    queryClient.setQueryData(ANOMALIES_QUERY_KEY, mockAnomalies)

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('Successful capture', () => {
    it('should successfully capture an anomaly', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: {
          id: 'anomaly-1',
          name: 'Kitsune',
          threatLevel: 'high',
          location: 'Shibuya',
          status: 'captured',
        },
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      // Trigger mutation
      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPost).toHaveBeenCalledWith('/api/anomalies/anomaly-1/capture')
      expect(mockPost).toHaveBeenCalledTimes(1)
    })

    it('should return captured anomaly data on success', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: {
          id: 'anomaly-1',
          name: 'Kitsune',
          threatLevel: 'high',
          location: 'Shibuya',
          status: 'captured',
        },
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(successResponse)
      expect(result.current.data?.anomaly?.status).toBe('captured')
    })

    it('should call API with correct anomaly ID', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: mockAnomalies[1],
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-2')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPost).toHaveBeenCalledWith('/api/anomalies/anomaly-2/capture')
    })
  })

  describe('Optimistic update', () => {
    it('should update anomaly status immediately (optimistic update)', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }

      // Delay the response to observe optimistic update
      mockPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(successResponse), 100)
          )
      )

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      // Immediately check optimistic update (before API resolves)
      await waitFor(() => {
        const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
        const updatedAnomaly = data?.find((a) => a.id === 'anomaly-1')
        expect(updatedAnomaly?.status).toBe('captured')
      })

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('should only update the specific anomaly', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)

      // Check that anomaly-1 is captured
      const capturedAnomaly = data?.find((a) => a.id === 'anomaly-1')
      expect(capturedAnomaly?.status).toBe('captured')

      // Check that other anomalies are unchanged
      const otherAnomaly = data?.find((a) => a.id === 'anomaly-2')
      expect(otherAnomaly?.status).toBe('active')
    })

    it('should preserve other anomaly properties during update', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const updatedAnomaly = data?.find((a) => a.id === 'anomaly-1')

      expect(updatedAnomaly?.name).toBe('Kitsune')
      expect(updatedAnomaly?.location).toBe('Shibuya')
      expect(updatedAnomaly?.threatLevel).toBe('high')
    })
  })

  describe('Error handling and rollback', () => {
    it('should rollback optimistic update on API error', async () => {
      const error = new api.ApiError('Capture failed', 500, 'CAPTURE_FAILED')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      // Get initial state
      const initialData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const initialAnomaly = initialData?.find((a) => a.id === 'anomaly-1')
      expect(initialAnomaly?.status).toBe('active')

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Check rollback - should restore to 'active'
      const rolledBackData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const rolledBackAnomaly = rolledBackData?.find(
        (a) => a.id === 'anomaly-1'
      )
      expect(rolledBackAnomaly?.status).toBe('active')
    })

    it('should restore all anomalies on rollback', async () => {
      const error = new api.ApiError('Network error', 500, 'NETWORK_ERROR')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      const initialData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      const rolledBackData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      expect(rolledBackData).toEqual(initialData)
    })

    it('should set error state on failure', async () => {
      const error = new api.ApiError('Capture failed', 500, 'CAPTURE_FAILED')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
      expect(result.current.isSuccess).toBe(false)
    })

    it('should handle validation errors', async () => {
      // Invalid response (missing required fields)
      const invalidResponse = {
        success: false,
        error: 'Validation failed',
      }

      mockPost.mockResolvedValueOnce(invalidResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Should rollback
      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const anomaly = data?.find((a) => a.id === 'anomaly-1')
      expect(anomaly?.status).toBe('active')
    })
  })

  describe('Query invalidation', () => {
    it('should invalidate queries after successful capture', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ANOMALIES_QUERY_KEY,
      })
    })

    it('should invalidate queries after error', async () => {
      const error = new api.ApiError('Capture failed', 500, 'CAPTURE_FAILED')
      mockPost.mockRejectedValueOnce(error)

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ANOMALIES_QUERY_KEY,
      })
    })
  })

  describe('Loading states', () => {
    it('should set loading state during mutation', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }

      mockPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(successResponse), 50)
          )
      )

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      result.current.mutate('anomaly-1')

      // Should be loading immediately after mutation
      await waitFor(() => {
        expect(result.current.isPending).toBe(true)
      })

      // Should complete eventually
      await waitFor(() => {
        expect(result.current.isPending).toBe(false)
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('should clear loading state after error', async () => {
      const error = new api.ApiError('Capture failed', 500, 'CAPTURE_FAILED')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.isPending).toBe(false)
    })
  })

  describe('Multiple mutations', () => {
    it('should handle multiple sequential captures', async () => {
      const response1: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }
      const response2: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[1], status: 'captured' },
      }

      mockPost.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      // First capture
      result.current.mutate('anomaly-1')
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Second capture
      result.current.mutate('anomaly-2')
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPost).toHaveBeenCalledTimes(2)
      expect(mockPost).toHaveBeenNthCalledWith(
        1,
        '/api/anomalies/anomaly-1/capture'
      )
      expect(mockPost).toHaveBeenNthCalledWith(
        2,
        '/api/anomalies/anomaly-2/capture'
      )
    })

    it('should handle mixed success and failure', async () => {
      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      }
      const error = new api.ApiError('Capture failed', 500, 'CAPTURE_FAILED')

      mockPost
        .mockResolvedValueOnce(successResponse)
        .mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      // First capture - success
      result.current.mutate('anomaly-1')
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Second capture - failure
      result.current.mutate('anomaly-2')
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const anomaly1 = data?.find((a) => a.id === 'anomaly-1')
      const anomaly2 = data?.find((a) => a.id === 'anomaly-2')

      // First should remain captured, second should be rolled back
      expect(anomaly1?.status).toBe('captured')
      expect(anomaly2?.status).toBe('active')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty anomalies list', async () => {
      queryClient.setQueryData(ANOMALIES_QUERY_KEY, [])

      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: mockAnomalies[0],
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('anomaly-1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPost).toHaveBeenCalled()
    })

    it('should handle undefined query data', async () => {
      queryClient.setQueryData(ANOMALIES_QUERY_KEY, undefined)

      const successResponse: CaptureAnomalyResponse = {
        success: true,
        anomaly: mockAnomalies[0],
      }

      mockPost.mockResolvedValueOnce(successResponse)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      expect(() => result.current.mutate('anomaly-1')).not.toThrow()

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })

    it('should handle non-existent anomaly ID', async () => {
      const error = new api.ApiError('Anomaly not found', 404, 'NOT_FOUND')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useCaptureAnomaly(), {
        wrapper: createWrapper(),
      })

      result.current.mutate('non-existent-id')

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error?.status).toBe(404)
    })
  })
})
