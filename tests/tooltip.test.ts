// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import handler, { tooltipMouseLeave } from 'map/tooltip'

const fakeMap = (name?: string) =>
  ({
    queryRenderedFeatures: () =>
      name ? [{ layer: { id: 'bezirkskarte-fill-noog' }, properties: { Name: name } }] : [],
  } as any)

const move = (map: any, x = 5, y = 5) => handler({ point: { x, y } } as any, map)
const tip = () => document.querySelectorAll('.tooltip')

beforeEach(() => {
  tooltipMouseLeave(null as any)
  document.body.innerHTML = ''
})

describe('tooltip', () => {
  it('shows the region name', () => {
    move(fakeMap('Lamstedt'))
    expect(tip()).toHaveLength(1)
    expect(tip()[0].textContent).toBe('Lamstedt')
  })

  it('keeps a single tooltip while moving and removes it when leaving a region', () => {
    move(fakeMap('A'))
    move(fakeMap('B'))
    expect(tip()).toHaveLength(1)
    expect(tip()[0].textContent).toBe('B')
    move(fakeMap())
    expect(tip()).toHaveLength(0)
  })

  it('is removed on mouse leave', () => {
    move(fakeMap('A'))
    tooltipMouseLeave(null as any)
    expect(tip()).toHaveLength(0)
  })
})
