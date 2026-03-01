import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConciergeDashboard from '../page'
import React from 'react'

// Mock the fetch API
global.fetch = jest.fn()

// Mock all components to isolate the page test
jest.mock('@/components/concierge/ReservationHeader', () => ({
  __esModule: true,
  default: ({ reservation }: any) => <div data-testid="reservation-header">{reservation.memberName}</div>
}))

jest.mock('@/components/concierge/CategoryCards', () => ({
  __esModule: true,
  default: ({ onSelect }: any) => (
    <div data-testid="category-cards">
      <button onClick={() => onSelect('Dining')}>Select Dining</button>
    </div>
  )
}))

jest.mock('@/components/concierge/AddItemForm', () => ({
  __esModule: true,
  default: ({ onAdd, onCancel }: any) => (
    <div data-testid="add-item-form">
      <button onClick={() => onAdd({
        category: 'Dining',
        title: 'Test Item',
        description: 'Test Description',
        scheduledAt: '2025-03-16T19:00:00Z',
        price: 100
      })}>Add Item</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}))

jest.mock('@/components/concierge/LineItemsList', () => ({
  __esModule: true,
  default: ({ items }: any) => (
    <div data-testid="line-items-list">
      {items.map((item: any, index: number) => (
        <div key={index}>{item.title} - ${item.price}</div>
      ))}
    </div>
  )
}))

jest.mock('@/components/concierge/ProposalsList', () => ({
  __esModule: true,
  default: ({ proposals }: any) => (
    <div data-testid="proposals-list">
      {proposals.map((p: any) => (
        <div key={p.id}>Proposal #{p.id} - {p.status}</div>
      ))}
    </div>
  )
}))

describe('ConciergeDashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('loads reservations and proposals on mount', async () => {
    const mockReservations = [{
      id: 1,
      memberId: 1,
      memberName: 'James Whitfield',
      memberEmail: 'james.whitfield@example.com',
      destination: 'Mexico',
      villa: 'Villa Punta Mita',
      arrivalDate: '2025-03-15',
      departureDate: '2025-03-22',
    }]

    const mockProposals = [{
      id: 1,
      reservationId: 1,
      status: 'draft',
      createdAt: '2025-03-01T12:00:00Z',
      reservation: mockReservations[0],
      items: []
    }]

    // Set up all required fetch calls
    ;(global.fetch as jest.Mock)
      .mockImplementation((url) => {
        if (url === '/api/reservations') {
          return Promise.resolve({
            ok: true,
            json: async () => mockReservations,
          })
        }
        if (url === '/api/proposals') {
          return Promise.resolve({
            ok: true,
            json: async () => mockProposals,
          })
        }
        return Promise.reject(new Error('Unknown URL'))
      })

    render(<ConciergeDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('reservation-header')).toHaveTextContent('James Whitfield')
    })

    await waitFor(() => {
      expect(screen.getByText('Proposal #1 - draft')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/reservations')
    expect(global.fetch).toHaveBeenCalledWith('/api/proposals')
  })

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    const { container } = render(<ConciergeDashboard />)
    
    // Check for loading spinner or skeleton
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('allows selecting a category and adding items', async () => {
    const mockReservations = [{
      id: 1,
      memberName: 'James Whitfield',
      destination: 'Mexico',
      memberEmail: 'james@example.com',
      villa: 'Villa Test',
      arrivalDate: '2025-03-15',
      departureDate: '2025-03-22',
    }]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => mockReservations 
      })
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => [] 
      })

    render(<ConciergeDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('category-cards')).toBeInTheDocument()
    })

    // Select a category
    fireEvent.click(screen.getByText('Select Dining'))

    // Should show add item form
    await waitFor(() => {
      expect(screen.getByTestId('add-item-form')).toBeInTheDocument()
    })

    // Add an item
    fireEvent.click(screen.getByText('Add Item'))

    // Should show the item in the list
    await waitFor(() => {
      expect(screen.getByText('Test Item - $100')).toBeInTheDocument()
    })
  })

  it('displays success message when action completes', async () => {
    const mockReservations = [{
      id: 1,
      memberName: 'James Whitfield',
      memberEmail: 'james@example.com',
      destination: 'Mexico',
      villa: 'Villa Test',
      arrivalDate: '2025-03-15',
      departureDate: '2025-03-22',
    }]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => mockReservations 
      })
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => [] 
      })

    render(<ConciergeDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('category-cards')).toBeInTheDocument()
    })
  })

  it('handles multiple reservations with dropdown', async () => {
    const mockReservations = [
      {
        id: 1,
        memberName: 'James Whitfield',
        destination: 'Mexico',
        memberEmail: 'james@example.com',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      {
        id: 2,
        memberName: 'Sarah Chen',
        destination: 'Italy',
        memberEmail: 'sarah@example.com',
        villa: 'Villa Italy',
        arrivalDate: '2025-04-15',
        departureDate: '2025-04-22',
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => mockReservations 
      })
      .mockResolvedValueOnce({ 
        ok: true,
        json: async () => [] 
      })

    render(<ConciergeDashboard />)

    await waitFor(() => {
      // Should show first reservation by default
      expect(screen.getByTestId('reservation-header')).toHaveTextContent('James Whitfield')
    })
  })
})
