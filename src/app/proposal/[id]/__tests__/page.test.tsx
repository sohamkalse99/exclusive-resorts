import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProposalPage from '../page'

// Mock next/navigation
const mockParams = { id: '1' }
jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
}))

// Mock next/dynamic for PDF component
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div>PDF Component</div>
  DynamicComponent.displayName = 'LoadableComponent'
  DynamicComponent.preload = jest.fn()
  return DynamicComponent
})

// Mock fetch
global.fetch = jest.fn()

describe('ProposalPage', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('shows loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    const { container } = render(<ProposalPage />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows error state when proposal not found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Proposal Not Found')).toBeInTheDocument()
    })
  })

  it('displays proposal details correctly', async () => {
    const mockProposal = {
      id: 1,
      status: 'sent',
      notes: 'Enjoy your stay!',
      reservation: {
        memberName: 'James Whitfield',
        destination: 'Mexico',
        villa: 'Villa Punta Mita',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [
        {
          id: 1,
          category: 'Dining',
          title: 'Private Chef Dinner',
          description: 'Custom 7-course menu',
          scheduledAt: '2025-03-16T19:00:00Z',
          price: 850,
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProposal,
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Your Curated Itinerary')).toBeInTheDocument()
    })

    expect(screen.getByText('Mexico')).toBeInTheDocument()
    expect(screen.getByText('Villa Punta Mita')).toBeInTheDocument()
    expect(screen.getByText('Private Chef Dinner')).toBeInTheDocument()
  })

  it('shows approve button for sent proposals', async () => {
    const mockProposal = {
      id: 1,
      status: 'sent',
      reservation: {
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProposal,
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Approve Itinerary')).toBeInTheDocument()
    })
  })

  it('handles approve action with optimistic update', async () => {
    const mockProposal = {
      id: 1,
      status: 'sent',
      reservation: { 
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [],
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProposal,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockProposal, status: 'approved' }),
      })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Approve Itinerary')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Approve Itinerary'))

    // Should show Pay button after approval
    await waitFor(() => {
      expect(screen.getByText('Pay & Lock In')).toBeInTheDocument()
    })
  })

  it('shows pay button for approved proposals', async () => {
    const mockProposal = {
      id: 1,
      status: 'approved',
      reservation: { 
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProposal,
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Pay & Lock In')).toBeInTheDocument()
    })
  })

  it('shows confirmation for paid proposals', async () => {
    const mockProposal = {
      id: 1,
      status: 'paid',
      reservation: { 
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProposal,
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Itinerary Locked In')).toBeInTheDocument()
    })
  })

  it('groups items by date correctly', async () => {
    const mockProposal = {
      id: 1,
      status: 'sent',
      reservation: { 
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [
        {
          id: 1,
          category: 'Dining',
          title: 'Morning Activity',
          scheduledAt: '2025-03-16T09:00:00Z',
          price: 100,
        },
        {
          id: 2,
          category: 'Dining',
          title: 'Evening Dinner',
          scheduledAt: '2025-03-16T19:00:00Z',
          price: 200,
        },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProposal,
    })

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Morning Activity')).toBeInTheDocument()
      expect(screen.getByText('Evening Dinner')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const mockProposal = {
      id: 1,
      status: 'sent',
      reservation: { 
        memberName: 'James',
        destination: 'Mexico',
        villa: 'Villa Test',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      items: [],
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProposal,
      })
      .mockRejectedValueOnce(new Error('Network error'))

    render(<ProposalPage />)

    await waitFor(() => {
      expect(screen.getByText('Approve Itinerary')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Approve Itinerary'))

    // Should show error or stay in same state
    await waitFor(() => {
      expect(screen.getByText('Approve Itinerary')).toBeInTheDocument()
    })
  })
})
