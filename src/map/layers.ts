import { AnySourceData, Map } from 'mapbox-gl'
import { FeatureCollection, Polygon } from 'geojson'

let _kartenSource: AnySourceData

async function kartenSource(): Promise<AnySourceData> {
  if (!_kartenSource) {
    const source = (await import('json/karte.json')).default
    _kartenSource = {
      type: 'geojson',
      data: source as FeatureCollection<Polygon>
    }
  }

  return _kartenSource
}

async function loadLayers(map: Map): Promise<Map> {
  const source = await kartenSource()

  map.addSource('bezirkskarte', source)

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