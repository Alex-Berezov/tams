import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent, CardFooter } from './Card'
import styles from './Card.module.scss'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render with children', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('should apply card class', () => {
      const { container } = render(<Card>Test</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain(styles.card)
    })

    it('should apply custom className', () => {
      const { container } = render(<Card className='custom-card'>Test</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain(styles.card)
      expect(card.className).toContain('custom-card')
    })

    it('should render as a div element', () => {
      const { container } = render(<Card>Test</Card>)
      const card = container.firstChild
      expect(card?.nodeName).toBe('DIV')
    })

    it('should render nested elements', () => {
      render(
        <Card>
          <div data-testid='nested'>Nested Content</div>
        </Card>
      )
      expect(screen.getByTestId('nested')).toBeInTheDocument()
    })
  })

  describe('CardHeader', () => {
    it('should render with children', () => {
      render(<CardHeader>Header Content</CardHeader>)
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })

    it('should apply header class', () => {
      const { container } = render(<CardHeader>Test</CardHeader>)
      const header = container.firstChild as HTMLElement
      expect(header.className).toContain(styles.header)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <CardHeader className='custom-header'>Test</CardHeader>
      )
      const header = container.firstChild as HTMLElement
      expect(header.className).toContain(styles.header)
      expect(header.className).toContain('custom-header')
    })

    it('should render as a div element', () => {
      const { container } = render(<CardHeader>Test</CardHeader>)
      const header = container.firstChild
      expect(header?.nodeName).toBe('DIV')
    })
  })

  describe('CardContent', () => {
    it('should render with children', () => {
      render(<CardContent>Content Text</CardContent>)
      expect(screen.getByText('Content Text')).toBeInTheDocument()
    })

    it('should apply content class', () => {
      const { container } = render(<CardContent>Test</CardContent>)
      const content = container.firstChild as HTMLElement
      expect(content.className).toContain(styles.content)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <CardContent className='custom-content'>Test</CardContent>
      )
      const content = container.firstChild as HTMLElement
      expect(content.className).toContain(styles.content)
      expect(content.className).toContain('custom-content')
    })

    it('should render as a div element', () => {
      const { container } = render(<CardContent>Test</CardContent>)
      const content = container.firstChild
      expect(content?.nodeName).toBe('DIV')
    })
  })

  describe('CardFooter', () => {
    it('should render with children', () => {
      render(<CardFooter>Footer Content</CardFooter>)
      expect(screen.getByText('Footer Content')).toBeInTheDocument()
    })

    it('should apply footer class', () => {
      const { container } = render(<CardFooter>Test</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain(styles.footer)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <CardFooter className='custom-footer'>Test</CardFooter>
      )
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain(styles.footer)
      expect(footer.className).toContain('custom-footer')
    })

    it('should render as a div element', () => {
      const { container } = render(<CardFooter>Test</CardFooter>)
      const footer = container.firstChild
      expect(footer?.nodeName).toBe('DIV')
    })
  })

  describe('Composition', () => {
    it('should render complete card with all sections', () => {
      render(
        <Card>
          <CardHeader>Card Title</CardHeader>
          <CardContent>Card Body</CardContent>
          <CardFooter>Card Actions</CardFooter>
        </Card>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Body')).toBeInTheDocument()
      expect(screen.getByText('Card Actions')).toBeInTheDocument()
    })

    it('should work with only header and content', () => {
      render(
        <Card>
          <CardHeader>Title Only</CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
      )

      expect(screen.getByText('Title Only')).toBeInTheDocument()
      expect(screen.getByText('Content Only')).toBeInTheDocument()
    })

    it('should work with only content', () => {
      render(
        <Card>
          <CardContent>Simple Card</CardContent>
        </Card>
      )

      expect(screen.getByText('Simple Card')).toBeInTheDocument()
    })

    it('should support complex nested content', () => {
      render(
        <Card>
          <CardHeader>
            <h2>Complex Header</h2>
            <span>Subtitle</span>
          </CardHeader>
          <CardContent>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </CardContent>
          <CardFooter>
            <button>Action 1</button>
            <button>Action 2</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Complex Header')).toBeInTheDocument()
      expect(screen.getByText('Subtitle')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Action 1' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Action 2' })
      ).toBeInTheDocument()
    })

    it('should maintain proper structure', () => {
      const { container } = render(
        <Card className='test-card'>
          <CardHeader className='test-header'>Header</CardHeader>
          <CardContent className='test-content'>Content</CardContent>
          <CardFooter className='test-footer'>Footer</CardFooter>
        </Card>
      )

      const card = container.querySelector('.test-card') as HTMLElement
      const header = container.querySelector('.test-header') as HTMLElement
      const content = container.querySelector('.test-content') as HTMLElement
      const footer = container.querySelector('.test-footer') as HTMLElement

      expect(card).toBeInTheDocument()
      expect(header).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(footer).toBeInTheDocument()

      // Check that sections are children of card
      expect(card).toContainElement(header)
      expect(card).toContainElement(content)
      expect(card).toContainElement(footer)
    })
  })
})
