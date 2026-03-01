import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddItemForm from '../AddItemForm'

describe('AddItemForm', () => {
  const mockOnAdd = jest.fn()
  const mockOnCancel = jest.fn()
  const defaultProps = {
    category: 'Dining',
    arrivalDate: '2025-03-15',
    departureDate: '2025-03-22',
    onAdd: mockOnAdd,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<AddItemForm {...defaultProps} />)

    expect(screen.getByText('Add Dining Item')).toBeInTheDocument()
    expect(screen.getByLabelText('Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Date & Time *')).toBeInTheDocument()
    expect(screen.getByLabelText('Estimated Price ($) *')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<AddItemForm {...defaultProps} />)

    const addButton = screen.getByText('Add Item')
    fireEvent.click(addButton)

    // Should not call onAdd if fields are empty
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<AddItemForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Title *'), 'Private Chef Dinner')
    await user.type(screen.getByLabelText('Description'), 'Custom 7-course menu')
    await user.type(screen.getByLabelText('Date & Time *'), '2025-03-16T19:00')
    await user.type(screen.getByLabelText('Estimated Price ($) *'), '850')

    const addButton = screen.getByText('Add Item')
    fireEvent.click(addButton)

    expect(mockOnAdd).toHaveBeenCalledWith({
      category: 'Dining',
      title: 'Private Chef Dinner',
      description: 'Custom 7-course menu',
      scheduledAt: '2025-03-16T19:00',
      price: 850,
    })
  })

  it('restricts date selection to trip dates', () => {
    render(<AddItemForm {...defaultProps} />)

    const dateInput = screen.getByLabelText('Date & Time *') as HTMLInputElement
    expect(dateInput.min).toBe('2025-03-15T00:00')
    expect(dateInput.max).toBe('2025-03-22T23:59')
  })

  it('cancels form when cancel button is clicked', () => {
    render(<AddItemForm {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('handles optional description field', async () => {
    const user = userEvent.setup()
    render(<AddItemForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Title *'), 'Beach Day')
    await user.type(screen.getByLabelText('Date & Time *'), '2025-03-17T10:00')
    await user.type(screen.getByLabelText('Estimated Price ($) *'), '200')

    // Don't fill description
    const addButton = screen.getByText('Add Item')
    fireEvent.click(addButton)

    expect(mockOnAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Beach Day',
        description: '',
      })
    )
  })

  it('shows category-specific placeholder text', () => {
    const { rerender } = render(<AddItemForm {...defaultProps} />)

    let titleInput = screen.getByLabelText('Title *') as HTMLInputElement
    expect(titleInput.placeholder).toContain('Chef Dinner')

    rerender(<AddItemForm {...defaultProps} category="Activities" />)
    titleInput = screen.getByLabelText('Title *') as HTMLInputElement
    expect(titleInput.placeholder).toBe('e.g., Private Chef Dinner')
  })

  it('handles zero price correctly', async () => {
    const user = userEvent.setup()
    render(<AddItemForm {...defaultProps} />)

    await user.type(screen.getByLabelText('Title *'), 'Complimentary Welcome')
    await user.type(screen.getByLabelText('Date & Time *'), '2025-03-15T17:00')
    await user.type(screen.getByLabelText('Estimated Price ($) *'), '0')

    const addButton = screen.getByText('Add Item')
    fireEvent.click(addButton)

    expect(mockOnAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        price: 0,
      })
    )
  })
})
