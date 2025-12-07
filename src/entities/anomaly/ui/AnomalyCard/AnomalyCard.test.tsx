import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Anomaly } from '@shared/types'
import { AnomalyCard } from './AnomalyCard'
import styles from './AnomalyCard.module.scss'

describe('AnomalyCard', () => {
  const mockActiveAnomaly: Anomaly = {
    id: 'anomaly-1',
    name: 'Kitsune',
    threatLevel: 'high',
    location: 'Shibuya District',
    status: 'active',
  }

  const mockCapturedAnomaly: Anomaly = {
    id: 'anomaly-2',
    name: 'Tanuki',
    threatLevel: 'low',
    location: 'Akihabara',
    status: 'captured',
  }

  describe('Rendering anomaly data', () => {
    it('should render anomaly name', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      expect(screen.getByText('Kitsune')).toBeInTheDocument()
    })

    it('should render anomaly location', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      expect(screen.getByText('Location:')).toBeInTheDocument()
      expect(screen.getByText('Shibuya District')).toBeInTheDocument()
    })

    it('should render formatted threat level', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should render formatted status', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render all threat levels correctly', () => {
      const levels: Array<{ level: Anomaly['threatLevel']; text: string }> = [
        { level: 'low', text: 'Low' },
        { level: 'medium', text: 'Medium' },
        { level: 'high', text: 'High' },
        { level: 'critical', text: 'Critical' },
      ]

      levels.forEach(({ level, text }) => {
        const anomaly = { ...mockActiveAnomaly, threatLevel: level }
        const { unmount } = render(<AnomalyCard anomaly={anomaly} />)
        expect(screen.getByText(text)).toBeInTheDocument()
        unmount()
      })
    })

    it('should render all statuses correctly', () => {
      const statuses: Array<{ status: Anomaly['status']; text: string }> = [
        { status: 'active', text: 'Active' },
        { status: 'captured', text: 'Captured' },
      ]

      statuses.forEach(({ status, text }) => {
        const anomaly = { ...mockActiveAnomaly, status }
        const { unmount } = render(<AnomalyCard anomaly={anomaly} />)
        // For "Captured" there are two elements (badge + button), so use getAllByText
        const elements = screen.getAllByText(text)
        expect(elements.length).toBeGreaterThan(0)
        unmount()
      })
    })
  })

  describe('Badge rendering', () => {
    it('should render threat level badge with correct variant', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const threatBadge = screen.getByText('High')
      expect(threatBadge.className).toContain('danger')
    })

    it('should render status badge for active anomaly', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const statusBadge = screen.getByText('Active')
      expect(statusBadge.className).toContain('success')
    })

    it('should render status badge for captured anomaly', () => {
      const { container } = render(
        <AnomalyCard anomaly={mockCapturedAnomaly} />
      )
      // Get all "Captured" texts, the first one should be in the badge
      const statusBadges = screen.getAllByText('Captured')
      // Find the one that's a badge (not the button)
      const badge = statusBadges.find((el) => el.tagName !== 'BUTTON')
      expect(badge).toBeDefined()
      expect(badge?.className).toContain('muted')
    })

    it('should render different badge variants for different threat levels', () => {
      const levels: Array<{
        level: Anomaly['threatLevel']
        variant: string
      }> = [
        { level: 'low', variant: 'success' },
        { level: 'medium', variant: 'warning' },
        { level: 'high', variant: 'danger' },
        { level: 'critical', variant: 'critical' },
      ]

      levels.forEach(({ level, variant }) => {
        const anomaly = { ...mockActiveAnomaly, threatLevel: level }
        const { container, unmount } = render(<AnomalyCard anomaly={anomaly} />)
        // Find elements with both 'badge' and variant class
        const variantBadge = container.querySelector(
          `[class*="badge"][class*="${variant}"]`
        )
        expect(variantBadge).toBeTruthy()
        unmount()
      })
    })
  })

  describe('Capture button for active anomalies', () => {
    it('should render "Capture" button for active anomaly', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const button = screen.getByRole('button', { name: /capture/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Capture')
    })

    it('should render enabled "Capture" button for active anomaly', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const button = screen.getByRole('button', { name: /capture/i })
      expect(button).not.toBeDisabled()
    })

    it('should call onCapture with anomaly id when clicked', () => {
      const onCapture = vi.fn()
      render(<AnomalyCard anomaly={mockActiveAnomaly} onCapture={onCapture} />)
      const button = screen.getByRole('button', { name: /capture/i })
      fireEvent.click(button)
      expect(onCapture).toHaveBeenCalledWith('anomaly-1')
      expect(onCapture).toHaveBeenCalledTimes(1)
    })

    it('should not call onCapture if handler is not provided', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const button = screen.getByRole('button', { name: /capture/i })
      expect(() => fireEvent.click(button)).not.toThrow()
    })

    it('should render button with primary variant for active anomaly', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const button = screen.getByRole('button', { name: /capture/i })
      expect(button.className).toContain('primary')
    })
  })

  describe('Capture button for captured anomalies', () => {
    it('should render "Captured" button for captured anomaly', () => {
      render(<AnomalyCard anomaly={mockCapturedAnomaly} />)
      const button = screen.getByRole('button', { name: /captured/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Captured')
    })

    it('should render disabled button for captured anomaly', () => {
      render(<AnomalyCard anomaly={mockCapturedAnomaly} />)
      const button = screen.getByRole('button', { name: /captured/i })
      expect(button).toBeDisabled()
    })

    it('should not call onCapture when captured button is clicked', () => {
      const onCapture = vi.fn()
      render(
        <AnomalyCard anomaly={mockCapturedAnomaly} onCapture={onCapture} />
      )
      const button = screen.getByRole('button', { name: /captured/i })
      fireEvent.click(button)
      expect(onCapture).not.toHaveBeenCalled()
    })

    it('should render button with danger variant for captured anomaly', () => {
      const { container } = render(
        <AnomalyCard anomaly={mockCapturedAnomaly} />
      )
      const button = screen.getByRole('button', { name: /captured/i })
      expect(button.className).toContain('danger')
    })
  })

  describe('Loading state (isCapturing)', () => {
    it('should show loading button when isCapturing is true', () => {
      const { container } = render(
        <AnomalyCard anomaly={mockActiveAnomaly} isCapturing={true} />
      )
      const button = screen.getByRole('button')
      // Check for loader element with CSS modules class
      const loader = container.querySelector('[class*="loader"]')
      expect(loader).toBeInTheDocument()
    })

    it('should disable button when isCapturing is true', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} isCapturing={true} />)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not call onCapture when button is clicked during capture', () => {
      const onCapture = vi.fn()
      render(
        <AnomalyCard
          anomaly={mockActiveAnomaly}
          onCapture={onCapture}
          isCapturing={true}
        />
      )
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onCapture).not.toHaveBeenCalled()
    })

    it('should render spinner when isCapturing is true', () => {
      const { container } = render(
        <AnomalyCard anomaly={mockActiveAnomaly} isCapturing={true} />
      )
      const spinner = container.querySelector(`.${styles.spinner}`)
      // Spinner is in Button component, look for it differently
      const spinnerElement = container.querySelector('[class*="spinner"]')
      expect(spinnerElement).toBeInTheDocument()
    })

    it('should not show loading state by default', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const loader = container.querySelector('.loader')
      expect(loader).not.toBeInTheDocument()
    })
  })

  describe('CSS classes by threat level', () => {
    it('should apply threat-low class for low threat', () => {
      const anomaly = { ...mockActiveAnomaly, threatLevel: 'low' as const }
      const { container } = render(<AnomalyCard anomaly={anomaly} />)
      const card = container.querySelector(`.${styles['threat-low']}`)
      expect(card).toBeInTheDocument()
    })

    it('should apply threat-medium class for medium threat', () => {
      const anomaly = { ...mockActiveAnomaly, threatLevel: 'medium' as const }
      const { container } = render(<AnomalyCard anomaly={anomaly} />)
      const card = container.querySelector(`.${styles['threat-medium']}`)
      expect(card).toBeInTheDocument()
    })

    it('should apply threat-high class for high threat', () => {
      const anomaly = { ...mockActiveAnomaly, threatLevel: 'high' as const }
      const { container } = render(<AnomalyCard anomaly={anomaly} />)
      const card = container.querySelector(`.${styles['threat-high']}`)
      expect(card).toBeInTheDocument()
    })

    it('should apply threat-critical class for critical threat', () => {
      const anomaly = {
        ...mockActiveAnomaly,
        threatLevel: 'critical' as const,
      }
      const { container } = render(<AnomalyCard anomaly={anomaly} />)
      const card = container.querySelector(`.${styles['threat-critical']}`)
      expect(card).toBeInTheDocument()
    })

    it('should always apply anomalyCard class', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const card = container.querySelector(`.${styles.anomalyCard}`)
      expect(card).toBeInTheDocument()
    })
  })

  describe('Component structure', () => {
    it('should render Card component', () => {
      const { container } = render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      // Check for card class from CSS modules
      const card = container.querySelector('[class*="card"]')
      expect(card).toBeInTheDocument()
    })

    it('should render CardHeader with name and threat badge', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const header = screen.getByText('Kitsune').closest('div')
      expect(header).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('should render CardContent with location and status info', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      expect(screen.getByText('Location:')).toBeInTheDocument()
      expect(screen.getByText('Shibuya District')).toBeInTheDocument()
      expect(screen.getByText('Status:')).toBeInTheDocument()
    })

    it('should render CardFooter with capture button', () => {
      render(<AnomalyCard anomaly={mockActiveAnomaly} />)
      const button = screen.getByRole('button')
      expect(button.closest('[class*="footer"]')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle anomaly with special characters in name', () => {
      const anomaly = { ...mockActiveAnomaly, name: 'Kitsune <&> 狐' }
      render(<AnomalyCard anomaly={anomaly} />)
      expect(screen.getByText('Kitsune <&> 狐')).toBeInTheDocument()
    })

    it('should handle long location names', () => {
      const anomaly = {
        ...mockActiveAnomaly,
        location: 'Very Long Location Name That Should Be Displayed Correctly',
      }
      render(<AnomalyCard anomaly={anomaly} />)
      expect(
        screen.getByText(
          'Very Long Location Name That Should Be Displayed Correctly'
        )
      ).toBeInTheDocument()
    })

    it('should handle multiple rapid clicks on capture button', () => {
      const onCapture = vi.fn()
      render(<AnomalyCard anomaly={mockActiveAnomaly} onCapture={onCapture} />)
      const button = screen.getByRole('button', { name: /capture/i })

      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(onCapture).toHaveBeenCalledTimes(3)
      expect(onCapture).toHaveBeenCalledWith('anomaly-1')
    })

    it('should not break when onCapture is undefined', () => {
      const { container } = render(
        <AnomalyCard anomaly={mockActiveAnomaly} onCapture={undefined} />
      )
      const button = screen.getByRole('button', { name: /capture/i })
      expect(() => fireEvent.click(button)).not.toThrow()
    })
  })
})
