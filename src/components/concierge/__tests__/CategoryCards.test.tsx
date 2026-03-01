import { render, screen, fireEvent } from '@testing-library/react'
import CategoryCards from '../CategoryCards'
import { CATEGORIES } from '@/lib/constants'

describe('CategoryCards', () => {
  const mockOnSelect = jest.fn()

  afterEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders all categories', () => {
    render(
      <CategoryCards
        selectedCategory={null}
        onSelect={mockOnSelect}
      />
    )

    CATEGORIES.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  it('displays category icons', () => {
    render(
      <CategoryCards
        selectedCategory={null}
        onSelect={mockOnSelect}
      />
    )

    CATEGORIES.forEach(category => {
      expect(screen.getByText(category.icon)).toBeInTheDocument()
    })
  })

  it('calls onSelect when category is clicked', () => {
    render(
      <CategoryCards
        selectedCategory={null}
        onSelect={mockOnSelect}
      />
    )

    const diningCard = screen.getByText('Dining').closest('div')
    fireEvent.click(diningCard!)

    expect(mockOnSelect).toHaveBeenCalledWith('Dining')
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

  it('shows selected category with different styling', () => {
    render(
      <CategoryCards
        selectedCategory="Activities"
        onSelect={mockOnSelect}
      />
    )

    const activitiesCard = screen.getByText('Activities').closest('.cursor-pointer')
    expect(activitiesCard).toHaveClass('ring-2', 'ring-slate-900')
  })

  it('deselects category when clicked again', () => {
    render(
      <CategoryCards
        selectedCategory="Wellness"
        onSelect={mockOnSelect}
      />
    )

    const wellnessCard = screen.getByText('Wellness').closest('.cursor-pointer')
    fireEvent.click(wellnessCard!)

    expect(mockOnSelect).toHaveBeenCalledWith(null)
  })

  it('allows selecting different categories', () => {
    const { rerender } = render(
      <CategoryCards
        selectedCategory="Transport"
        onSelect={mockOnSelect}
      />
    )

    const excursionsCard = screen.getByText('Excursions').closest('.cursor-pointer')
    fireEvent.click(excursionsCard!)

    expect(mockOnSelect).toHaveBeenCalledWith('Excursions')

    rerender(
      <CategoryCards
        selectedCategory="Excursions"
        onSelect={mockOnSelect}
      />
    )

    const excursionsCardUpdated = screen.getByText('Excursions').closest('.cursor-pointer')
    expect(excursionsCardUpdated).toHaveClass('ring-2', 'ring-slate-900')
  })
})
