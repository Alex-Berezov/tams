import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAnomalyStream } from './index'
import { ANOMALIES_QUERY_KEY } from '@shared/config'
import type { Anomaly } from '@shared/types'

// Mock EventSource
class MockEventSource {
  public url: string
  public onopen: ((event: Event) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null
  public readyState: number = 0
  private static instances: MockEventSource[] = []

  constructor(url: string) {
    this.url = url
    this.readyState = 0 // CONNECTING
    MockEventSource.instances.push(this)
  }

  close() {
    this.readyState = 2 // CLOSED
  }

  simulateOpen() {
    this.readyState = 1 // OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      const event = new MessageEvent('message', {
        data: JSON.stringify(data),
      })
      this.onmessage(event)
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  static getLastInstance(): MockEventSource | undefined {
    return MockEventSource.instances[MockEventSource.instances.length - 1]
  }

  static clearInstances() {
    MockEventSource.instances = []
  }

  static getInstanceCount() {
    return MockEventSource.instances.length
  }
}

global.EventSource = MockEventSource as any

describe('useAnomalyStream', () => {
  let queryClient: QueryClient

  const mockAnomalies: Anomaly[] = [
    {
      id: 'anomaly-1',
      name: 'Kitsune',
      threatLevel: 'low',
      location: 'Shibuya',
      status: 'active',
    },
    {
      id: 'anomaly-2',
      name: 'Tanuki',
      threatLevel: 'medium',
      location: 'Akihabara',
      status: 'active',
    },
  ]

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    return Wrapper
  }

  beforeEach(() => {
    MockEventSource.clearInstances()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    queryClient.setQueryData(ANOMALIES_QUERY_KEY, mockAnomalies)
  })

  afterEach(() => {
    queryClient.clear()
    MockEventSource.clearInstances()
  })

  describe('SSE Connection', () => {
    it('should establish SSE connection on mount', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      const eventSource = MockEventSource.getLastInstance()
      expect(eventSource).toBeDefined()
      expect(eventSource?.url).toBe('/api/anomalies/stream')
    })

    it('should set isConnected to true when connection opens', () => {
      const { result } = renderHook(() => useAnomalyStream(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isConnected).toBe(false)

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
      })

      expect(result.current.isConnected).toBe(true)
    })

    it('should not connect when enabled is false', () => {
      renderHook(() => useAnomalyStream({ enabled: false }), {
        wrapper: createWrapper(),
      })

      expect(MockEventSource.getLastInstance()).toBeUndefined()
    })

    it('should close connection on unmount', () => {
      const { unmount } = renderHook(() => useAnomalyStream(), {
        wrapper: createWrapper(),
      })

      const eventSource = MockEventSource.getLastInstance()
      expect(eventSource).toBeDefined()

      unmount()

      expect(eventSource?.readyState).toBe(2) // CLOSED
    })
  })

  describe('Threat level change events', () => {
    it('should update query cache on threat_level_change event', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'threat_level_change',
          anomalyId: 'anomaly-1',
          newThreatLevel: 'critical',
        })
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const updatedAnomaly = data?.find((a) => a.id === 'anomaly-1')
      expect(updatedAnomaly?.threatLevel).toBe('critical')
    })

    it('should preserve other anomaly properties', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'threat_level_change',
          anomalyId: 'anomaly-1',
          newThreatLevel: 'high',
        })
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      const anomaly = data?.find((a) => a.id === 'anomaly-1')
      expect(anomaly?.name).toBe('Kitsune')
      expect(anomaly?.location).toBe('Shibuya')
      expect(anomaly?.status).toBe('active')
    })

    it('should only update the specific anomaly', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'threat_level_change',
          anomalyId: 'anomaly-1',
          newThreatLevel: 'critical',
        })
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      expect(data?.find((a) => a.id === 'anomaly-1')?.threatLevel).toBe(
        'critical'
      )
      expect(data?.find((a) => a.id === 'anomaly-2')?.threatLevel).toBe(
        'medium'
      )
    })

    it('should ignore events with invalid data', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      const initialData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'threat_level_change',
          anomalyId: 'anomaly-1',
          // missing newThreatLevel
        })
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      expect(data).toEqual(initialData)
    })

    it('should ignore unknown event types', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      const initialData =
        queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'unknown_type',
          data: 'test',
        })
      })

      const data = queryClient.getQueryData<Anomaly[]>(ANOMALIES_QUERY_KEY)
      expect(data).toEqual(initialData)
    })
  })

  describe('Callback onThreatLevelChange', () => {
    it('should call callback when event received', () => {
      const onThreatLevelChange = vi.fn()

      renderHook(() => useAnomalyStream({ onThreatLevelChange }), {
        wrapper: createWrapper(),
      })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        MockEventSource.getLastInstance()?.simulateMessage({
          type: 'threat_level_change',
          anomalyId: 'anomaly-1',
          newThreatLevel: 'critical',
          anomalyName: 'Kitsune',
          previousThreatLevel: 'low',
        })
      })

      expect(onThreatLevelChange).toHaveBeenCalledWith(
        expect.objectContaining({
          anomalyId: 'anomaly-1',
          newThreatLevel: 'critical',
          anomalyName: 'Kitsune',
          previousThreatLevel: 'low',
        })
      )
    })

    it('should work without callback', () => {
      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      expect(() => {
        act(() => {
          MockEventSource.getLastInstance()?.simulateOpen()
          MockEventSource.getLastInstance()?.simulateMessage({
            type: 'threat_level_change',
            anomalyId: 'anomaly-1',
            newThreatLevel: 'critical',
          })
        })
      }).not.toThrow()
    })
  })

  describe('Reconnection logic', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should attempt to reconnect on error', () => {
      const { result } = renderHook(
        () => useAnomalyStream({ reconnectDelay: 1000 }),
        { wrapper: createWrapper() }
      )

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
      })

      expect(result.current.isConnected).toBe(true)

      act(() => {
        MockEventSource.getLastInstance()?.simulateError()
      })

      expect(result.current.isConnected).toBe(false)

      const initialCount = MockEventSource.getInstanceCount()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(MockEventSource.getInstanceCount()).toBeGreaterThan(initialCount)
    })

    it('should respect maxReconnectAttempts', () => {
      renderHook(
        () =>
          useAnomalyStream({
            reconnectDelay: 100,
            maxReconnectAttempts: 2,
          }),
        { wrapper: createWrapper() }
      )

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
      })

      // Trigger errors (initial + 2 reconnects)
      for (let i = 0; i < 3; i++) {
        act(() => {
          MockEventSource.getLastInstance()?.simulateError()
          vi.advanceTimersByTime(100)
        })
      }

      const countAfterMax = MockEventSource.getInstanceCount()

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(MockEventSource.getInstanceCount()).toBe(countAfterMax)
    })
  })

  describe('Disconnect method', () => {
    it('should disconnect and set isConnected to false', () => {
      const { result } = renderHook(() => useAnomalyStream(), {
        wrapper: createWrapper(),
      })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
      })

      expect(result.current.isConnected).toBe(true)

      act(() => {
        result.current.disconnect()
      })

      expect(result.current.isConnected).toBe(false)
    })

    it('should close EventSource on disconnect', () => {
      const { result } = renderHook(() => useAnomalyStream(), {
        wrapper: createWrapper(),
      })

      const eventSource = MockEventSource.getLastInstance()

      act(() => {
        result.current.disconnect()
      })

      expect(eventSource?.readyState).toBe(2) // CLOSED
    })
  })

  describe('Edge cases', () => {
    it('should handle malformed JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      act(() => {
        MockEventSource.getLastInstance()?.simulateOpen()
        const eventSource = MockEventSource.getLastInstance()
        if (eventSource?.onmessage) {
          eventSource.onmessage(
            new MessageEvent('message', { data: 'invalid{json' })
          )
        }
      })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle empty anomalies list', () => {
      queryClient.setQueryData(ANOMALIES_QUERY_KEY, [])

      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      expect(() => {
        act(() => {
          MockEventSource.getLastInstance()?.simulateOpen()
          MockEventSource.getLastInstance()?.simulateMessage({
            type: 'threat_level_change',
            anomalyId: 'anomaly-1',
            newThreatLevel: 'critical',
          })
        })
      }).not.toThrow()
    })

    it('should handle undefined query data', () => {
      queryClient.setQueryData(ANOMALIES_QUERY_KEY, undefined)

      renderHook(() => useAnomalyStream(), { wrapper: createWrapper() })

      expect(() => {
        act(() => {
          MockEventSource.getLastInstance()?.simulateOpen()
          MockEventSource.getLastInstance()?.simulateMessage({
            type: 'threat_level_change',
            anomalyId: 'anomaly-1',
            newThreatLevel: 'critical',
          })
        })
      }).not.toThrow()
    })
  })
})
