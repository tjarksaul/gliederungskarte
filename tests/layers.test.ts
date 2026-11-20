import { describe, it, expect, vi } from 'vitest'
import loadLayers from '../src/map/layers'

function fakeMap() {
  return { addSource: vi.fn(), addLayer: vi.fn() } as any
}

describe('loadLayers', () => {
  it('adds the geojson source with all features', async () => {
    const map = fakeMap()
    await loadLayers(map)
    const [id, source] = map.addSource.mock.calls[0]
    expect(id).toBe('bezirkskarte')
    expect(source.type).toBe('geojson')
    expect(source.data.features.length).toBeGreaterThan(0)
  })

  it('renders red overlay where an OG exists and yellow where none', async () => {
    const map = fakeMap()
    await loadLayers(map)
    const layers = map.addLayer.mock.calls.map((c: any[]) => c[0])
    const red = layers.find((l: any) => l.id === 'bezirkskarte-fill-hasog')
    const yellow = layers.find((l: any) => l.id === 'bezirkskarte-fill-noog')

    expect(red.type).toBe('fill')
    expect(red.paint['fill-color']).toBe('#ff0000')
    expect(red.filter).toEqual(['get', 'hasOG'])
    expect(yellow.type).toBe('fill')
    expect(yellow.paint['fill-color']).toBe('#ffff00')
    expect(yellow.filter).toEqual(['!', ['get', 'hasOG']])
    expect(red.paint['fill-opacity']).toBeGreaterThan(0)
    expect(yellow.paint['fill-opacity']).toBeGreaterThan(0)
  })

  it('draws fills before the border so borders stay visible', async () => {
    const map = fakeMap()
    await loadLayers(map)
    const ids = map.addLayer.mock.calls.map((c: any[]) => c[0].id)
    expect(ids.indexOf('bezirkskarte-border')).toBeGreaterThan(ids.indexOf('bezirkskarte-fill-noog'))
    expect(ids.indexOf('bezirkskarte-border')).toBeGreaterThan(ids.indexOf('bezirkskarte-fill-hasog'))
  })
})
