import { cn } from '../utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500')
    expect(result).toBe('px-4 py-2 bg-blue-500')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isDisabled = false
    
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class'
    )
    
    expect(result).toBe('base-class active-class')
  })

  it('merges tailwind classes with conflict resolution', () => {
    const result = cn('px-2 py-1', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles arrays of classes', () => {
    const result = cn(['text-sm', 'font-bold'], 'text-blue-500')
    expect(result).toBe('text-sm font-bold text-blue-500')
  })

  it('handles objects with conditional classes', () => {
    const result = cn({
      'bg-red-500': true,
      'bg-blue-500': false,
      'text-white': true,
    })
    expect(result).toBe('bg-red-500 text-white')
  })

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end')
    expect(result).toBe('base end')
  })

  it('handles empty strings', () => {
    const result = cn('', 'valid-class', '')
    expect(result).toBe('valid-class')
  })

  it('handles complex tailwind class merging', () => {
    const result = cn(
      'text-red-500 hover:text-blue-500',
      'text-green-500'
    )
    expect(result).toBe('hover:text-blue-500 text-green-500')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn(
      'border rounded-lg',
      'bg-white shadow-sm',
      'p-4'
    )
    expect(result).toBe('border rounded-lg bg-white shadow-sm p-4')
  })

  it('handles responsive classes correctly', () => {
    const result = cn(
      'text-sm md:text-base',
      'lg:text-lg'
    )
    expect(result).toBe('text-sm md:text-base lg:text-lg')
  })
})
