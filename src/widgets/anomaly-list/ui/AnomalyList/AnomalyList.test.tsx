import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AnomalyList } from './AnomalyList'
import { ToastProvider } from '@shared/ui'
import type { Anomaly } from '@shared/types'
import * as api from '@shared/api'

// Mock API module
vi.mock('@shared/api', async () => {
  const actual = await vi.importActual('@shared/api')
  return {
    ...actual,
    get: vi.fn(),
    post: vi.fn(),
  }
})

describe('AnomalyList', () => {
  let queryClient: QueryClient
  const mockGet = vi.mocked(api.get)
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

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    )
    return Wrapper
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading spinner while fetching', () => {
      mockGet.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<AnomalyList />, { wrapper: createWrapper() })

      expect(screen.getByText('Scanning for anomalies...')).toBeInTheDocument()
      const spinner = document.querySelector('[class*="spinner"]')
      expect(spinner).toBeInTheDocument()
    })

    it('should show loading text', () => {
      mockGet.mockImplementation(() => new Promise(() => {}))

      render(<AnomalyList />, { wrapper: createWrapper() })

      expect(screen.getByText('Scanning for anomalies...')).toBeInTheDocument()
    })

    it('should apply className in loading state', () => {
      mockGet.mockImplementation(() => new Promise(() => {}))

      const { container } = render(<AnomalyList className='custom-class' />, {
        wrapper: createWrapper(),
      })

      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error message on fetch failure', async () => {
      const error = new Error('Network error')
      mockGet.mockRejectedValueOnce(error)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Connection Lost')).toBeInTheDocument()
      })

      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    it('should show default error message for non-Error objects', async () => {
      mockGet.mockRejectedValueOnce('Unknown error')

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(
          screen.getByText(
            'Failed to load anomalies. The spiritual network may be disrupted.'
          )
        ).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      mockGet.mockRejectedValueOnce(new Error('Failed'))

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        const retryButton = screen.getByRole('button', {
          name: /retry connection/i,
        })
        expect(retryButton).toBeInTheDocument()
      })
    })

    it('should refetch data when retry button is clicked', async () => {
      mockGet
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Connection Lost')).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', {
        name: /retry connection/i,
      })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(screen.getByText('Anomaly Monitor')).toBeInTheDocument()
      })

      expect(mockGet).toHaveBeenCalledTimes(2)
    })

    it('should show error icon', async () => {
      mockGet.mockRejectedValueOnce(new Error('Failed'))

      const { container } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const errorIcon = container.querySelector('[class*="errorIcon"]')
        expect(errorIcon).toBeInTheDocument()
      })
    })
  })

  describe('Empty state', () => {
    it('should show empty message when no anomalies', async () => {
      mockGet.mockResolvedValueOnce([])

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('All Clear')).toBeInTheDocument()
      })

      expect(
        screen.getByText(
          'No anomalies detected in Tokyo. The city is safe... for now.'
        )
      ).toBeInTheDocument()
    })

    it('should show empty icon', async () => {
      mockGet.mockResolvedValueOnce([])

      const { container } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const emptyIcon = container.querySelector('[class*="emptyIcon"]')
        expect(emptyIcon).toBeInTheDocument()
      })
    })

    it('should handle undefined anomalies array', async () => {
      mockGet.mockResolvedValueOnce(undefined as any)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        // Undefined will fail Zod validation, showing error state
        expect(screen.getByText('Connection Lost')).toBeInTheDocument()
      })
    })
  })

  describe('Anomalies list rendering', () => {
    it('should render list of anomaly cards', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      expect(screen.getByText('Tanuki')).toBeInTheDocument()
      expect(screen.getByText('Tengu')).toBeInTheDocument()
    })

    it('should render all anomaly details', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      expect(screen.getByText('Shibuya')).toBeInTheDocument()
      expect(screen.getByText('Akihabara')).toBeInTheDocument()
      expect(screen.getByText('Shinjuku')).toBeInTheDocument()
    })

    it('should render header with title', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Anomaly Monitor')).toBeInTheDocument()
      })
    })

    it('should apply custom className', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      const { container } = render(<AnomalyList className='test-class' />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const element = container.querySelector('.test-class')
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Stats (active/captured count)', () => {
    it('should display active and captured counts', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('2 active / 1 captured')).toBeInTheDocument()
      })
    })

    it('should show correct count for all active anomalies', async () => {
      const allActive: Anomaly[] = [
        { ...mockAnomalies[0], status: 'active' },
        { ...mockAnomalies[1], status: 'active' },
        { ...mockAnomalies[2], status: 'active' },
      ]
      mockGet.mockResolvedValueOnce(allActive)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('3 active / 0 captured')).toBeInTheDocument()
      })
    })

    it('should show correct count for all captured anomalies', async () => {
      const allCaptured: Anomaly[] = [
        { ...mockAnomalies[0], status: 'captured' },
        { ...mockAnomalies[1], status: 'captured' },
        { ...mockAnomalies[2], status: 'captured' },
      ]
      mockGet.mockResolvedValueOnce(allCaptured)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('0 active / 3 captured')).toBeInTheDocument()
      })
    })

    it('should show 0/0 for single active anomaly', async () => {
      mockGet.mockResolvedValueOnce([mockAnomalies[0]])

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('1 active / 0 captured')).toBeInTheDocument()
      })
    })
  })

  describe('Capture integration', () => {
    it('should call capture API when Capture button clicked', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)
      mockPost.mockResolvedValueOnce({
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      })

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      const captureButtons = screen.getAllByRole('button', {
        name: /capture/i,
      })
      fireEvent.click(captureButtons[0])

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          '/api/anomalies/anomaly-1/capture'
        )
      })
    })

    it('should show loading state on specific card during capture', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      const captureButtons = screen.getAllByRole('button', {
        name: /capture/i,
      })

      fireEvent.click(captureButtons[0])

      // Button should be disabled during capture
      await waitFor(() => {
        expect(captureButtons[0]).toBeDisabled()
      })
    })

    it('should not affect other cards during capture', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)
      mockPost.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      const captureButtons = screen.getAllByRole('button', {
        name: /capture/i,
      })

      fireEvent.click(captureButtons[0])

      // Second button should still be enabled
      expect(captureButtons[1]).not.toBeDisabled()
    })

    it('should handle capture success', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)
      mockPost.mockResolvedValueOnce({
        success: true,
        anomaly: { ...mockAnomalies[0], status: 'captured' },
      })

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      const captureButtons = screen.getAllByRole('button', {
        name: /capture/i,
      })
      fireEvent.click(captureButtons[0])

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled()
      })
    })

    it('should handle capture error', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)
      mockPost.mockRejectedValueOnce(new Error('Capture failed'))

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      const captureButtons = screen.getAllByRole('button', {
        name: /capture/i,
      })
      fireEvent.click(captureButtons[0])

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled()
      })

      // Button should be re-enabled after error
      await waitFor(() => {
        expect(captureButtons[0]).not.toBeDisabled()
      })
    })

    it('should not show capture button for already captured anomalies', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        expect(screen.getByText('Tengu')).toBeInTheDocument()
      })

      const capturedButton = screen.getByRole('button', { name: /captured/i })
      expect(capturedButton).toBeDisabled()
    })
  })

  describe('Grid layout', () => {
    it('should render cards in a grid', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      const { container } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const grid = container.querySelector('[class*="grid"]')
        expect(grid).toBeInTheDocument()
      })
    })

    it('should render correct number of cards', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      const { container } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="anomalyCard"]')
        expect(cards.length).toBe(3)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle API returning malformed data gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockGet.mockResolvedValueOnce({ invalid: 'data' } as any)

      render(<AnomalyList />, { wrapper: createWrapper() })

      await waitFor(() => {
        // Should show error state due to Zod validation failure
        expect(screen.getByText('Connection Lost')).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('should handle very large number of anomalies', async () => {
      const manyAnomalies: Anomaly[] = Array.from({ length: 100 }, (_, i) => ({
        id: `anomaly-${i}`,
        name: `Spirit ${i}`,
        threatLevel: 'low' as const,
        location: 'Tokyo',
        status: 'active' as const,
      }))

      mockGet.mockResolvedValueOnce(manyAnomalies)

      const { container } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        const cards = container.querySelectorAll('[class*="anomalyCard"]')
        expect(cards.length).toBe(100)
      })
    })

    it('should maintain state across re-renders', async () => {
      mockGet.mockResolvedValueOnce(mockAnomalies)

      const { rerender } = render(<AnomalyList />, {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(screen.getByText('Kitsune')).toBeInTheDocument()
      })

      rerender(<AnomalyList className='updated-class' />)

      expect(screen.getByText('Kitsune')).toBeInTheDocument()
      expect(screen.getByText('Tanuki')).toBeInTheDocument()
    })
  })
})
