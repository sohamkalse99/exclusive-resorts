import { GET, POST } from '../route'
import { NextRequest } from 'next/server'

// Mock the database module
jest.mock('@/db', () => ({
  db: {
    prepare: jest.fn(),
    transaction: jest.fn(),
  },
}))

describe('/api/proposals', () => {
  let mockPrepare: jest.Mock
  let mockAll: jest.Mock
  let mockRun: jest.Mock
  let mockGet: jest.Mock
  let mockTransaction: jest.Mock

  beforeEach(() => {
    mockAll = jest.fn()
    mockRun = jest.fn()
    mockGet = jest.fn()
    mockPrepare = jest.fn().mockReturnValue({ 
      all: mockAll,
      run: mockRun,
      get: mockGet,
    })
    mockTransaction = jest.fn((fn) => fn())
    
    require('@/db').db.prepare = mockPrepare
    require('@/db').db.transaction = mockTransaction
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/proposals', () => {
    it('should return all proposals with details', async () => {
      const mockProposals = [
        {
          id: 1,
          reservation_id: 1,
          status: 'sent',
          notes: 'Test notes',
          created_at: '2025-03-01T12:00:00Z',
          sent_at: '2025-03-01T13:00:00Z',
          member_name: 'James Whitfield',
          member_email: 'james.whitfield@example.com',
          destination: 'Mexico',
          villa: 'Villa Punta Mita',
          arrival_date: '2025-03-15',
          departure_date: '2025-03-22',
        },
      ]

      mockAll.mockReturnValue(mockProposals)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0]).toMatchObject({
        id: 1,
        status: 'sent',
        notes: 'Test notes',
      })
    })

    it('should handle database errors', async () => {
      mockPrepare.mockImplementation(() => {
        throw new Error('Database error')
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch proposals' })
    })
  })

  describe('POST /api/proposals', () => {
    it('should create a new proposal with items', async () => {
      const mockProposalId = 1
      mockRun.mockReturnValue({ lastInsertRowid: mockProposalId })
      mockGet.mockReturnValue({
        id: mockProposalId,
        reservation_id: 1,
        status: 'draft',
        notes: 'Test notes',
        created_at: '2025-03-01T12:00:00Z',
        sent_at: null,
      })

      const requestBody = {
        reservationId: 1,
        items: [
          {
            category: 'Dining',
            title: 'Private Chef Dinner',
            description: 'Custom menu',
            scheduledAt: '2025-03-16T19:00:00Z',
            price: 850,
          },
        ],
        notes: 'Test notes',
      }

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toMatchObject({
        id: mockProposalId,
        status: 'draft',
        notes: 'Test notes',
      })
      expect(mockTransaction).toHaveBeenCalled()
    })

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify({ items: [] }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Missing required fields' })
    })

    it('should handle database transaction errors', async () => {
      mockTransaction.mockImplementation(() => {
        throw new Error('Transaction failed')
      })

      const request = new NextRequest('http://localhost:3000/api/proposals', {
        method: 'POST',
        body: JSON.stringify({
          reservationId: 1,
          items: [{ category: 'Dining', title: 'Test', scheduledAt: '2025-03-16', price: 100 }],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create proposal' })
    })
  })
})
