import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { Toast, ToastType } from './Toast'
import { ToastProvider, useToast } from './ToastProvider'
import styles from './Toast.module.scss'

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render with message', () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.INFO}
          message='Test message'
          onClose={onClose}
        />
      )
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('should render success toast with checkmark icon', () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.SUCCESS}
          message='Success'
          onClose={onClose}
        />
      )
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('should render error toast with X icon', () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.ERROR}
          message='Error'
          onClose={onClose}
        />
      )
      expect(screen.getByText('✕')).toBeInTheDocument()
    })

    it('should render info toast with info icon', () => {
      const onClose = vi.fn()
      render(
        <Toast id='1' type={ToastType.INFO} message='Info' onClose={onClose} />
      )
      expect(screen.getByText('ℹ')).toBeInTheDocument()
    })

    it('should apply correct CSS class for type', () => {
      const onClose = vi.fn()
      const { container } = render(
        <Toast
          id='1'
          type={ToastType.SUCCESS}
          message='Test'
          onClose={onClose}
        />
      )
      const toast = container.firstChild as HTMLElement
      expect(toast.className).toContain(styles.toast)
      expect(toast.className).toContain(styles.success)
    })
  })

  describe('Auto-dismiss', () => {
    it('should auto-dismiss after default duration (4000ms)', async () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.INFO}
          message='Auto dismiss'
          onClose={onClose}
        />
      )

      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(4000)
      })

      expect(onClose).toHaveBeenCalledWith('1')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should auto-dismiss after custom duration', async () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.INFO}
          message='Custom duration'
          duration={2000}
          onClose={onClose}
        />
      )

      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1999)
      })
      expect(onClose).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onClose).toHaveBeenCalledWith('1')
    })

    it('should clear timeout on unmount', () => {
      const onClose = vi.fn()
      const { unmount } = render(
        <Toast id='1' type={ToastType.INFO} message='Test' onClose={onClose} />
      )

      unmount()

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Manual close', () => {
    it('should call onClose when close button clicked', () => {
      const onClose = vi.fn()
      render(
        <Toast
          id='1'
          type={ToastType.INFO}
          message='Closable'
          onClose={onClose}
        />
      )

      const closeButton = screen.getByRole('button', {
        name: 'Close notification',
      })
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledWith('1')
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should render close button with × symbol', () => {
      const onClose = vi.fn()
      render(
        <Toast id='1' type={ToastType.INFO} message='Test' onClose={onClose} />
      )

      const closeButton = screen.getByRole('button', {
        name: 'Close notification',
      })
      expect(closeButton).toHaveTextContent('×')
    })
  })
})

describe('ToastProvider and useToast', () => {
  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Child Content</div>
        </ToastProvider>
      )
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('should provide toast context', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast(ToastType.SUCCESS, 'Test')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('useToast hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      const TestComponent = () => {
        useToast()
        return <div>Test</div>
      }

      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => render(<TestComponent />)).toThrow(
        'useToast must be used within a ToastProvider'
      )

      spy.mockRestore()
    })

    it('should show toast with correct message and type', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button
            onClick={() => showToast(ToastType.SUCCESS, 'Success message')}
          >
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByRole('button'))

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('should show multiple toasts simultaneously', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <>
            <button
              onClick={() => showToast(ToastType.SUCCESS, 'First toast')}
              data-testid='btn1'
            >
              Button 1
            </button>
            <button
              onClick={() => showToast(ToastType.ERROR, 'Second toast')}
              data-testid='btn2'
            >
              Button 2
            </button>
          </>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByTestId('btn1'))
      fireEvent.click(screen.getByTestId('btn2'))

      expect(screen.getByText('First toast')).toBeInTheDocument()
      expect(screen.getByText('Second toast')).toBeInTheDocument()
    })

    it('should remove toast when closed manually', () => {
      const TestComponent = () => {
        const { showToast } = useToast()
        return (
          <button onClick={() => showToast(ToastType.INFO, 'Removable toast')}>
            Show Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }))
      expect(screen.getByText('Removable toast')).toBeInTheDocument()

      const closeButton = screen.getByRole('button', {
        name: 'Close notification',
      })
      fireEvent.click(closeButton)

      expect(screen.queryByText('Removable toast')).not.toBeInTheDocument()
    })
  })
})
