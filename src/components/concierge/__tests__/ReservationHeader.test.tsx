import { render, screen } from '@testing-library/react'
import ReservationHeader from '../ReservationHeader'
import { mockReservation } from '@/lib/test-utils'

describe('ReservationHeader', () => {
  it('renders reservation details correctly', () => {
    render(<ReservationHeader reservation={mockReservation} />)

    expect(screen.getByText('James Whitfield')).toBeInTheDocument()
    expect(screen.getByText('Mexico')).toBeInTheDocument()
    expect(screen.getByText('Villa Punta Mita')).toBeInTheDocument()
    expect(screen.getByText(/Mar 15/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 22/)).toBeInTheDocument()
  })

  it('displays all icons correctly', () => {
    render(<ReservationHeader reservation={mockReservation} />)

    // Check for presence of icon containers
    const container = screen.getByTestId('reservation-header')
    expect(container).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    render(<ReservationHeader reservation={mockReservation} />)

    // Should show formatted dates
    expect(screen.getByText(/Mar 15, 2025/)).toBeInTheDocument()
    expect(screen.getByText(/Mar 22, 2025/)).toBeInTheDocument()
  })

  it('handles different reservation data', () => {
    const customReservation = {
      ...mockReservation,
      memberName: 'Sarah Chen',
      destination: 'Italy',
      villa: 'Villa Tuscany',
      arrivalDate: '2025-04-10',
      departureDate: '2025-04-17',
    }

    render(<ReservationHeader reservation={customReservation} />)

    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Italy')).toBeInTheDocument()
    expect(screen.getByText('Villa Tuscany')).toBeInTheDocument()
    expect(screen.getByText(/Apr 10/)).toBeInTheDocument()
  })
})
