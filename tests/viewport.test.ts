import { describe, it, expect } from 'vitest'
import { mapFit, mapFitPadding, mapMinZoom } from '../src/config/map'

const TILE = 512 // mapbox-gl world size at zoom 0

const mercX = (lng: number) => (lng + 180) / 360
const mercY = (lat: number) => {
  const s = Math.sin((lat * Math.PI) / 180)
  return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)
}

// Zoom at which mapFit (plus padding) fills the viewport, as fitBounds computes it
function fitZoom(width: number, height: number): number {
  const [[w, n], [e, s]] = mapFit as number[][]
  const dx = Math.abs(mercX(e) - mercX(w))
  const dy = Math.abs(mercY(s) - mercY(n))
  const zx = Math.log2((width - 2 * mapFitPadding) / (TILE * dx))
  const zy = Math.log2((height - 2 * mapFitPadding) / (TILE * dy))
  return Math.min(zx, zy)
}

const viewports: [string, number, number][] = [
  ['small phone', 320, 568],
  ['phone', 375, 667],
  ['tablet', 768, 1024],
  ['laptop', 1366, 768],
  ['desktop', 1920, 1080],
  ['ultrawide', 3440, 1440],
]

describe('fitted zoom across devices', () => {
  it.each(viewports)('%s (%ix%i) is neither too far out nor absurdly close', (_n, w, h) => {
    const z = fitZoom(w, h)
    expect(z).toBeGreaterThanOrEqual(mapMinZoom)
    expect(z).toBeLessThanOrEqual(12)
  })

  it('has padding so the region does not touch the edges', () => {
    expect(mapFitPadding).toBeGreaterThan(0)
  })
})
