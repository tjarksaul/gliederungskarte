import { Map, MapMouseEvent } from 'mapbox-gl'
import { createElementFromHTML } from 'utils'
import './tooltip.scss'

let tooltip: Node

function handler(ev: MapMouseEvent, map: Map): Map {
  if (tooltip && document.body.contains(tooltip)) {
    document.body.removeChild(tooltip)
  }

  const features = map.queryRenderedFeatures(ev.point)

  const hoveredFeature =
    features &&
    features.find(
      feature =>
        feature.layer.id === 'bezirkskarte-fill-hasog' ||
        feature.layer.id === 'bezirkskarte-fill-noog',
    )

  if (hoveredFeature && hoveredFeature.properties) {
    const { Name } = hoveredFeature.properties
    const { x, y } = ev.point

    const documentHeight = document.documentElement.clientHeight
    const top = Math.min(y, documentHeight - 46)

    tooltip = createElementFromHTML(`<div class="tooltip" style="left: ${x}px; top: ${top}px">${Name}</div>`)

    document.body.appendChild(tooltip)
  }

  return map
}

export function tooltipMouseLeave(map: Map): Map {
  if (tooltip && document.body.contains(tooltip)) {
    document.body.removeChild(tooltip)
  }

  return map
}

export default handler
