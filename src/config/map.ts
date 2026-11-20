import { LngLatBoundsLike } from 'mapbox-gl'

export const mapboxApiKey = process.env.MAPBOX_API_KEY

export const mapPosition = {
  long: 8.84065531694182,
  lat: 53.510129440437254,
  zoom: 8.922,
}

export const mapFit: LngLatBoundsLike = [
  [8.4792403, 53.892616],
  [9.2971483, 53.124474],
]

export const mapFitPadding = 20
export const mapMinZoom = 7
