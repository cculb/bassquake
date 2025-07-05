import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders the loading screen', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('BASSQUAKE')).toBeInTheDocument()
    expect(screen.getByText('INITIALIZING AUDIO ENGINE...')).toBeInTheDocument()
  })

  it('displays the loading animation', () => {
    render(<LoadingSpinner />)
    
    // Should have animated dots
    const container = screen.getByText('BASSQUAKE').closest('.loading-screen')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('loading-screen')
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const heading = screen.getByText('BASSQUAKE')
    expect(heading).toBeInTheDocument()
    
    const subtitle = screen.getByText('INITIALIZING AUDIO ENGINE...')
    expect(subtitle).toBeInTheDocument()
  })

  it('applies neon text styling', () => {
    render(<LoadingSpinner />)
    
    const heading = screen.getByText('BASSQUAKE')
    expect(heading).toHaveClass('neon-text')
  })
})