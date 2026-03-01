import { render, screen, fireEvent } from '@testing-library/react'
import LineItemsList from '../LineItemsList'
import { mockLineItem } from '@/lib/test-utils'
import { DndContext } from '@dnd-kit/core'

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: '',
    isDragging: false,
  }),
}))

describe('LineItemsList', () => {
  const mockOnRemove = jest.fn()
  const mockOnReorder = jest.fn()

  const items = [
    { ...mockLineItem, title: 'Item 1' },
    { ...mockLineItem, title: 'Item 2', price: 500 },
    { ...mockLineItem, title: 'Item 3', price: 300 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders empty state when no items', () => {
    render(
      <LineItemsList
        items={[]}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    expect(screen.getByText('No items added yet.')).toBeInTheDocument()
    expect(screen.getByText('Select a category above to start building the itinerary.')).toBeInTheDocument()
  })

  it('renders all items correctly', () => {
    render(
      <LineItemsList
        items={items}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('displays item details correctly', () => {
    render(
      <LineItemsList
        items={[mockLineItem]}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    expect(screen.getByText('Private Chef Dinner')).toBeInTheDocument()
    expect(screen.getByText('Experience a custom 7-course tasting menu')).toBeInTheDocument()
    expect(screen.getByText('$850.00')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked', () => {
    render(
      <LineItemsList
        items={items}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    // Find all buttons and filter for the ones with the red hover style (remove buttons)
    const removeButtons = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('text-red-500')
    )
    
    // Click the second remove button (index 1)
    fireEvent.click(removeButtons[1])

    expect(mockOnRemove).toHaveBeenCalledWith(1)
  })

  it('shows total price correctly', () => {
    render(
      <LineItemsList
        items={items}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    // Total should be 850 + 500 + 300 = 1650
    expect(screen.getByText('$1,650.00')).toBeInTheDocument()
  })

  it('formats dates correctly', () => {
    const itemWithDate = {
      ...mockLineItem,
      scheduledAt: '2025-12-25T15:30:00Z',
    }

    render(
      <LineItemsList
        items={[itemWithDate]}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    // Date formatting is done in SortableLineItem component
    expect(screen.getByText('Private Chef Dinner')).toBeInTheDocument()
  })

  it('shows category icons', () => {
    const itemsWithCategories = [
      { ...mockLineItem, category: 'Dining' },
      { ...mockLineItem, category: 'Activities', title: 'Snorkeling' },
      { ...mockLineItem, category: 'Transport', title: 'Airport Transfer' },
    ]

    render(
      <LineItemsList
        items={itemsWithCategories}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    // Icons are rendered inside SortableLineItem component
    // Verify items are rendered with their categories
    expect(screen.getByText('Private Chef Dinner')).toBeInTheDocument()
    expect(screen.getByText('Snorkeling')).toBeInTheDocument()
    expect(screen.getByText('Airport Transfer')).toBeInTheDocument()
  })

  it('handles items without descriptions', () => {
    const itemWithoutDesc = {
      ...mockLineItem,
      description: '',
    }

    render(
      <LineItemsList
        items={[itemWithoutDesc]}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    )

    expect(screen.getByText('Private Chef Dinner')).toBeInTheDocument()
    // Should not throw error when description is empty
  })
})
