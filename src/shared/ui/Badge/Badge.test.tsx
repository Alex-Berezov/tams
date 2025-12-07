import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'
import styles from './Badge.module.scss'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Badge>Test Badge</Badge>)
      expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('should render with default variant', () => {
      const { container } = render(<Badge>Default</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.badge)
      expect(badge.className).toContain(styles.default)
    })

    it('should render with success variant', () => {
      const { container } = render(<Badge variant='success'>Success</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.success)
    })

    it('should render with warning variant', () => {
      const { container } = render(<Badge variant='warning'>Warning</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.warning)
    })

    it('should render with danger variant', () => {
      const { container } = render(<Badge variant='danger'>Danger</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.danger)
    })

    it('should render with critical variant', () => {
      const { container } = render(<Badge variant='critical'>Critical</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.critical)
    })

    it('should render with muted variant', () => {
      const { container } = render(<Badge variant='muted'>Muted</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.muted)
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<Badge className='custom-class'>Test</Badge>)
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.badge)
      expect(badge.className).toContain('custom-class')
    })

    it('should combine variant and custom className', () => {
      const { container } = render(
        <Badge variant='success' className='my-badge'>
          Test
        </Badge>
      )
      const badge = container.firstChild as HTMLElement
      expect(badge.className).toContain(styles.badge)
      expect(badge.className).toContain(styles.success)
      expect(badge.className).toContain('my-badge')
    })
  })

  describe('Content', () => {
    it('should render text content', () => {
      render(<Badge>Simple Text</Badge>)
      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('should render numeric content', () => {
      render(<Badge>{42}</Badge>)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should render with nested elements', () => {
      render(
        <Badge>
          <span data-testid='nested'>Nested Content</span>
        </Badge>
      )
      expect(screen.getByTestId('nested')).toBeInTheDocument()
      expect(screen.getByText('Nested Content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render as a span element', () => {
      const { container } = render(<Badge>Test</Badge>)
      const badge = container.firstChild
      expect(badge?.nodeName).toBe('SPAN')
    })

    it('should be accessible in the document', () => {
      render(<Badge>Accessible Badge</Badge>)
      const badge = screen.getByText('Accessible Badge')
      expect(badge).toBeVisible()
    })
  })
})
