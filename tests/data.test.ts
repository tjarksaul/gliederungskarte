import { describe, it, expect } from 'vitest'
import karte from '../src/json/karte.json'
import oginfo from '../src/json/oginfo.json'
import { mapPosition, mapFit } from '../src/config/map'
import { ring, pointInRing, inBounds } from './helpers'

const features = (karte as any).features as any[]
const byName = (n: string) => features.find(f => f.properties.Name === n)

// [lng, lat]
const CITIES: { [k: string]: number[] } = {
  'Osterholz-Scharmbeck': [8.7937, 53.2252],
  Cuxhaven: [8.6944, 53.8603],
  Bremerhaven: [8.5809, 53.5396],
  Lamstedt: [9.0990, 53.6290],
}

describe('Elbe-Weser-Dreieck coverage', () => {
  it.each(['Osterholz-Scharmbeck', 'Cuxhaven', 'Lamstedt'])('has a feature for %s', name => {
    expect(byName(name)).toBeDefined()
  })

  it.each(Object.keys(CITIES))('%s lies within the initial map bounds', name => {
    expect(inBounds(CITIES[name], mapFit as number[][])).toBe(true)
  })

  it.each(['Osterholz-Scharmbeck', 'Cuxhaven', 'Lamstedt'])('%s polygon contains the town centre', name => {
    expect(pointInRing(CITIES[name], ring(byName(name)))).toBe(true)
  })

  it('map centre lies within the fit bounds', () => {
    expect(inBounds([mapPosition.long, mapPosition.lat], mapFit as number[][])).toBe(true)
  })

  it('initial view is not zoomed out too far', () => {
    expect(mapPosition.zoom).toBeGreaterThanOrEqual(8)
    const [[w, n], [e, s]] = mapFit as number[][]
    expect(Math.abs(e - w)).toBeLessThan(2)
    expect(Math.abs(n - s)).toBeLessThan(2)
  })
})

describe('karte.json data integrity', () => {
  it('every feature has a boolean hasOG and an AGS', () => {
    for (const f of features) {
      expect(typeof f.properties.hasOG, f.properties.Name).toBe('boolean')
      expect(f.properties.AGS, f.properties.Name).toBeTruthy()
    }
  })

  it('has both red (hasOG) and yellow (no OG) regions', () => {
    expect(features.some(f => f.properties.hasOG)).toBe(true)
    expect(features.some(f => !f.properties.hasOG)).toBe(true)
  })

  it('uses only polygon geometries (border layer filters on Polygon)', () => {
    for (const f of features) expect(['Polygon', 'MultiPolygon']).toContain(f.geometry.type)
  })

  it('every hasOG feature references existing OG info', () => {
    for (const f of features.filter(f => f.properties.hasOG)) {
      const ids: string[] = f.properties.ogAgsIds || [f.properties.AGS]
      for (const id of ids) {
        expect((oginfo as any)[id], `${f.properties.Name}: ${id}`).toBeDefined()
      }
    }
  })
})
