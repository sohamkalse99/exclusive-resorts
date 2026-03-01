import { GET } from '../route'
import Database from 'better-sqlite3'

// Mock the database module
jest.mock('better-sqlite3')
jest.mock('@/db', () => ({
  db: {
    prepare: jest.fn(),
  },
}))

describe('GET /api/reservations', () => {
  let mockDb: any
  let mockPrepare: jest.Mock
  let mockAll: jest.Mock

  beforeEach(() => {
    mockAll = jest.fn()
    mockPrepare = jest.fn().mockReturnValue({ all: mockAll })
    
    mockDb = {
      prepare: mockPrepare,
    }
    
    // Update the mock
    require('@/db').db.prepare = mockPrepare
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return reservations with member details', async () => {
    const mockReservations = [
      {
        id: 1,
        member_id: 1,
        member_name: 'James Whitfield',
        member_email: 'james.whitfield@example.com',
        destination: 'Mexico',
        villa: 'Villa Punta Mita',
        arrival_date: '2025-03-15',
        departure_date: '2025-03-22',
      },
      {
        id: 2,
        member_id: 2,
        member_name: 'Sarah Chen',
        member_email: 'sarah.chen@example.com',
        destination: 'Italy',
        villa: 'Villa Tuscany',
        arrival_date: '2025-04-10',
        departure_date: '2025-04-17',
      },
    ]

    mockAll.mockReturnValue(mockReservations)

    const response = await GET()
    const data = await response.json()

    expect(mockPrepare).toHaveBeenCalledWith(expect.stringContaining('SELECT'))
    expect(mockAll).toHaveBeenCalled()
    expect(response.status).toBe(200)
    expect(data).toEqual([
      {
        id: 1,
        memberId: 1,
        memberName: 'James Whitfield',
        memberEmail: 'james.whitfield@example.com',
        destination: 'Mexico',
        villa: 'Villa Punta Mita',
        arrivalDate: '2025-03-15',
        departureDate: '2025-03-22',
      },
      {
        id: 2,
        memberId: 2,
        memberName: 'Sarah Chen',
        memberEmail: 'sarah.chen@example.com',
        destination: 'Italy',
        villa: 'Villa Tuscany',
        arrivalDate: '2025-04-10',
        departureDate: '2025-04-17',
      },
    ])
  })

  it('should return empty array when no reservations exist', async () => {
    mockAll.mockReturnValue([])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should handle database errors', async () => {
    mockPrepare.mockImplementation(() => {
      throw new Error('Database connection failed')
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch reservations' })
  })
})
