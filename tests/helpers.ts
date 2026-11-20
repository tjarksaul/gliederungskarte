import { Feature, Polygon, MultiPolygon, Position } from 'geojson'

export function ring(f: Feature<Polygon | MultiPolygon>): Position[] {
  const g = f.geometry
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
  return polys.map(p => p[0]).reduce((a, b) => a.concat(b), [])
}

export function pointInRing(pt: Position, r: Position[]): boolean {
  let inside = false
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i]
    const [xj, yj] = r[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

export function inBounds(pt: Position, b: number[][]): boolean {
  const [[x1, y1], [x2, y2]] = b
  return (
    pt[0] >= Math.min(x1, x2) && pt[0] <= Math.max(x1, x2) &&
    pt[1] >= Math.min(y1, y2) && pt[1] <= Math.max(y1, y2)
  )
}
