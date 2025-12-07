import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, ButtonVariant } from './Button'
import styles from './Button.module.scss'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children', () => {
      render(<Button>Click me</Button>)
      expect(
        screen.getByRole('button', { name: 'Click me' })
      ).toBeInTheDocument()
    })

    it('should render with primary variant by default', () => {
      const { container } = render(<Button>Primary</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain(styles.button)
      expect(button.className).toContain(styles.primary)
    })

    it('should render with primary variant explicitly', () => {
      const { container } = render(
        <Button variant={ButtonVariant.PRIMARY}>Primary</Button>
      )
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain(styles.primary)
    })

    it('should render with danger variant', () => {
      const { container } = render(
        <Button variant={ButtonVariant.DANGER}>Danger</Button>
      )
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain(styles.danger)
    })
  })

  describe('Loading State', () => {
    it('should show spinner when loading', () => {
      const { container } = render(<Button isLoading>Submit</Button>)
      const button = container.firstChild as HTMLElement
      const spinner = button.querySelector(`.${styles.spinner}`)
      expect(spinner).toBeInTheDocument()
    })

    it('should hide children when loading', () => {
      render(<Button isLoading>Submit</Button>)
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })

    it('should be disabled when loading', () => {
      render(<Button isLoading>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should show children when not loading', () => {
      render(<Button isLoading={false}>Submit</Button>)
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should not be disabled by default', () => {
      render(<Button>Enabled</Button>)
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should be disabled when both disabled and loading', () => {
      render(
        <Button disabled isLoading>
          Button
        </Button>
      )
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Click Handler', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(
        <Button onClick={handleClick} isLoading>
          Click me
        </Button>
      )

      const button = screen.getByRole('button')
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<Button className='custom-btn'>Test</Button>)
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain(styles.button)
      expect(button.className).toContain('custom-btn')
    })

    it('should combine variant and custom className', () => {
      const { container } = render(
        <Button variant={ButtonVariant.DANGER} className='my-button'>
          Test
        </Button>
      )
      const button = container.firstChild as HTMLElement
      expect(button.className).toContain(styles.button)
      expect(button.className).toContain(styles.danger)
      expect(button.className).toContain('my-button')
    })
  })

  describe('HTML Button Attributes', () => {
    it('should pass through button type', () => {
      render(<Button type='submit'>Submit</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should pass through aria attributes', () => {
      render(<Button aria-label='Custom label'>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
    })

    it('should pass through data attributes', () => {
      render(<Button data-testid='my-button'>Button</Button>)
      const button = screen.getByTestId('my-button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Button>Accessible Button</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be keyboard accessible when enabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Press Enter</Button>)

      const button = screen.getByRole('button')
      button.focus()
      await user.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalled()
    })
  })
})
