import bezMap, { removePopup } from 'map'
import { LngLatBoundsLike } from 'mapbox-gl'

const mapPosition = {
  long: 8.84065531694182,
  lat: 53.510129440437254,
  zoom: 8.922,
}

const mapFit: LngLatBoundsLike = [
  [8.4792403, 53.892616],
  [9.2971483, 53.124474],
]

const container = document.querySelector('#root') as HTMLDivElement

const map = bezMap(container, mapPosition, mapFit)

document.body.onkeydown = ev => {
  if (ev.key === 'Escape') {
    removePopup()
  }
}
