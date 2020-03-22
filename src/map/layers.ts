import { AnySourceData, Map } from 'mapbox-gl'
import bezirkskarte from 'json/karte.json'
import { FeatureCollection, Polygon } from 'geojson'

const kartenSource: AnySourceData = {
  type: 'geojson',
  data: bezirkskarte as FeatureCollection<Polygon>,
}

function loadLayers(map: Map): Map {
  map.addSource('bezirkskarte', kartenSource)

  map.addLayer({
    id: 'bezirkskarte-fill-hasog',
    type: 'fill',
    source: 'bezirkskarte',
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.4,
    },
    filter: ['get', 'hasOG'],
  })

  map.addLayer({
    id: 'bezirkskarte-fill-noog',
    type: 'fill',
    source: 'bezirkskarte',
    paint: {
      'fill-color': '#ffff00',
      'fill-opacity': 0.4,
    },
    filter: ['!', ['get', 'hasOG']],
  })

  map.addLayer({
    id: 'bezirkskarte-border',
    type: 'line',
    source: 'bezirkskarte',
    paint: {
      'line-color': '#ffffff',
      'line-opacity': 1.0,
      'line-width': 5,
    },
    filter: ['==', '$type', 'Polygon'],
  })

  return map
}

export default loadLayers