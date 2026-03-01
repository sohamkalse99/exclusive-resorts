import React from 'react'
import { render } from '@testing-library/react'

// Mock data for tests
export const mockReservation = {
  id: 1,
  memberId: 1,
  memberName: 'James Whitfield',
  memberEmail: 'james.whitfield@example.com',
  destination: 'Mexico',
  villa: 'Villa Punta Mita',
  arrivalDate: '2025-03-15',
  departureDate: '2025-03-22',
}

export const mockProposal = {
  id: 1,
  reservationId: 1,
  reservation: mockReservation,
  status: 'draft' as const,
  notes: 'Test notes',
  createdAt: '2025-03-01T12:00:00Z',
  sentAt: null,
  items: [
    {
      id: 1,
      proposalId: 1,
      category: 'Dining',
      title: 'Private Chef Dinner',
      description: 'Experience a custom 7-course tasting menu',
      scheduledAt: '2025-03-16T19:00:00Z',
      price: 850,
    },
  ],
}

export const mockLineItem = {
  category: 'Dining',
  title: 'Private Chef Dinner',
  description: 'Experience a custom 7-course tasting menu',
  scheduledAt: '2025-03-16T19:00:00Z',
  price: 850,
}

// Custom render function
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui)
}

// Re-export everything
export * from '@testing-library/react'
