// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { separator, createElementFromHTML } from 'utils'

describe('separator', () => {
  it('uses "oder" before the last item and commas otherwise', () => {
    const arr = ['a', 'b', 'c']
    expect(separator(0, arr)).toBe(', ')
    expect(separator(1, arr)).toBe(', ')
    expect(separator(2, arr)).toBe(' oder ')
  })
})

describe('createElementFromHTML', () => {
  it('returns the first element and ignores surrounding whitespace', () => {
    const el = createElementFromHTML('\n  <p class="x">Hi</p>  ') as HTMLElement
    expect(el.tagName).toBe('P')
    expect(el.className).toBe('x')
  })
})
