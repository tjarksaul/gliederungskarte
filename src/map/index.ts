import { LngLatBoundsLike, Map } from 'mapbox-gl'
import { mapboxApiKey } from 'config'
import loadLayers from './layers'
import popup from 'map/popup'
import tooltip, { tooltipMouseLeave } from 'map/tooltip'
import { disableUnmodifiedZoomScroll } from 'map/scroll'
import './map.scss'

interface MapPosition {
  long: number
  lat: number
  zoom: number
}

function map(
  container: HTMLElement,
  position: MapPosition,
  mapFit?: LngLatBoundsLike,
): Map {
  const map = new Map({
    accessToken: mapboxApiKey,
    container,
    style: 'mapbox://styles/mapbox/light-v10',
    center: [position.long, position.lat],
    zoom: position.zoom,
  })

  if (mapFit) {
    map.fitBounds(mapFit)
  }

  map.on('load', () => {
    loadLayers(map)
  })

  map.on('click', ev => popup(ev, map))

  map.on('mousemove', ev => tooltip(ev, map))

  map.on('mouseout', () => tooltipMouseLeave(map))
  map.on('mouseleave', () => tooltipMouseLeave(map))

  disableUnmodifiedZoomScroll(map)

  return map
}

export { removePopup } from 'map/popup'

export default map
