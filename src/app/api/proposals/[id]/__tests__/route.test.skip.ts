/**
 * @jest-environment node
 */
import { GET, PATCH } from '../route'

// Mock database
const mockSelect = jest.fn()
const mockFrom = jest.fn()
const mockWhere = jest.fn()
const mockLeftJoin = jest.fn()
const mockTransaction = jest.fn()

jest.mock('@/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: mockFrom,
    })),
    transaction: mockTransaction,
  },
}))

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((a, b) => ({ type: 'eq', a, b })),
}))

// Global Response polyfill for Node environment
if (!global.Response) {
  global.Response = class Response {
    constructor(public body: any, public init: any = {}) {}
    
    async json() {
      return JSON.parse(this.body)
    }
    
    get status() {
      return this.init.status || 200
    }
  } as any
}

describe('/api/proposals/[id]', () => {
  let mockPrepare: jest.Mock
  let mockGet: jest.Mock
  let mockAll: jest.Mock
  let mockRun: jest.Mock

  beforeEach(() => {
    mockGet = jest.fn()
    mockAll = jest.fn()
    mockRun = jest.fn()
    mockPrepare = jest.fn().mockReturnValue({ 
      get: mockGet,
      all: mockAll,
      run: mockRun,
    })
    
    require('@/db').db.prepare = mockPrepare
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/proposals/[id]', () => {
    it('should return proposal with items', async () => {
      const mockProposal = {
        id: 1,
        reservation_id: 1,
        status: 'sent',
        notes: 'Test notes',
        created_at: '2025-03-01T12:00:00Z',
        sent_at: '2025-03-01T13:00:00Z',
        member_id: 1,
        member_name: 'James Whitfield',
        member_email: 'james.whitfield@example.com',
        destination: 'Mexico',
        villa: 'Villa Punta Mita',
        arrival_date: '2025-03-15',
        departure_date: '2025-03-22',
      }

      const mockItems = [
        {
          id: 1,
          proposal_id: 1,
          category: 'Dining',
          title: 'Private Chef Dinner',
          description: 'Custom menu',
          scheduled_at: '2025-03-16T19:00:00Z',
          price: 850,
        },
      ]

      mockGet.mockReturnValue(mockProposal)
      mockAll.mockReturnValue(mockItems)

      const request = new NextRequest('http://localhost:3000/api/proposals/1')
      const response = await GET(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 1,
        status: 'sent',
        items: expect.arrayContaining([
          expect.objectContaining({
            category: 'Dining',
            title: 'Private Chef Dinner',
          }),
        ]),
      })
    })

    it('should return 404 for non-existent proposal', async () => {
      mockGet.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/proposals/999')
      const response = await GET(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Proposal not found' })
    })
  })

  describe('PATCH /api/proposals/[id]', () => {
    it('should update proposal status', async () => {
      const mockProposal = { id: 1, status: 'draft' }
      mockGet.mockReturnValue(mockProposal)
      mockRun.mockReturnValue({ changes: 1 })

      const request = new NextRequest('http://localhost:3000/api/proposals/1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      })

      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        id: 1,
        status: 'approved',
      })
      expect(mockRun).toHaveBeenCalled()
    })

    it('should update proposal items for draft status', async () => {
      const mockProposal = { id: 1, status: 'draft' }
      mockGet.mockReturnValue(mockProposal)
      mockRun.mockReturnValue({ changes: 1 })

      const requestBody = {
        items: [
          {
            category: 'Dining',
            title: 'Updated Dinner',
            scheduledAt: '2025-03-16T19:00:00Z',
            price: 950,
          },
        ],
        notes: 'Updated notes',
      }

      const request = new NextRequest('http://localhost:3000/api/proposals/1', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      })

      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrepare).toHaveBeenCalledWith('DELETE FROM proposal_items WHERE proposal_id = ?')
    })

    it('should return 404 for non-existent proposal', async () => {
      mockGet.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/proposals/999', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved' }),
      })

      const response = await PATCH(request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Proposal not found' })
    })

    it('should prevent updating sent proposals', async () => {
      const mockProposal = { id: 1, status: 'sent' }
      mockGet.mockReturnValue(mockProposal)

      const request = new NextRequest('http://localhost:3000/api/proposals/1', {
        method: 'PATCH',
        body: JSON.stringify({ items: [] }),
      })

      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Cannot update items for sent proposals' })
    })
  })
})
