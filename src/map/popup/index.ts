import { Map, MapMouseEvent, Point } from 'mapbox-gl'
import { Feature } from 'geojson'
import { createElementFromHTML, separator } from 'utils'
import { OgInfos } from 'dtos'
import './popup.scss'

let _ogInfos: OgInfos

let popup: Node | undefined

export function removePopup(): void {
  if (popup && document.body.contains(popup)) {
    document.body.removeChild(popup)
  }
}

async function ogInfos(): Promise<OgInfos> {
  if (!_ogInfos) {
    _ogInfos = (await import('json/oginfo.json')).default
  }

  return _ogInfos
}

async function createPopup(
  hoveredFeature: Feature,
  point: Point,
): Promise<Node | undefined> {
  const { x, y } = point
  if (!hoveredFeature.properties) {
    return
  }

  const { Name, hasOG, AGS, ogAgsIds } = hoveredFeature.properties

  let popupContent: string

  const infos = await ogInfos()

  if (hasOG && infos[AGS]) {
    const ogInfo = infos[AGS]
    popupContent = `
        <h4>${ogInfo.fullname}</h4>
        <p>${ogInfo.address.replace('\n', '<br/>')}</p>
        <p>Weitere Infos unter <a class="popup__link" href="${
          ogInfo.website.url
        }" target="_blank">${ogInfo.website.print}</a>.</p>      
      `
  } else {
    const agsIds = JSON.parse(ogAgsIds) as Array<string>
    const ogen = agsIds
      .map(ags => infos[ags])
      .map(
        info =>
          `<a class="popup__link" href="${info.website.url}" target="_blank">${info.shortname}</a>`,
      )
      .reduce((acc, curr, idx, arr) => acc + separator(idx, arr) + curr, '')
      .substr(2)

    popupContent = `
      <p>Hier gibt es leider noch keine DLRG-Ortsgruppe.</p>
      <p>Schauen Sie doch einmal bei den Ortsgruppen ${ogen} vorbei.</p>
      `
  }

  let vertical = `top: ${y}px`
  const documentHeight = document.documentElement.clientHeight
  if (y > documentHeight / 2) {
    vertical = `bottom: ${documentHeight - y}px`
  }

  let horizontal = `left: ${x}px`
  const documentWidth = document.documentElement.clientWidth
  if (x > documentWidth / 2) {
    horizontal = `right: ${documentWidth - x}px`
  }

  const popup = createElementFromHTML(`
      <div class="popup" style="${vertical}; ${horizontal}"> 
        <div id="popup__content" class="popup__content">
          <button id="popup__close-button" class="popup__close-button" type="button" aria-label="Close popup">×</button>
          <div class="popup__og-info">
            <h3>${Name}</h3>            
            ${popupContent}
          </div>
        </div>
      </div>
      `)

  popup.childNodes.forEach(value => {
    const val = value as Element
    if (val.className === 'popup__content') {
      value.childNodes.forEach(child => {
        const ch = child as Element
        if (ch.id === 'popup__close-button') {
          const button = ch as HTMLButtonElement
          button.onclick = removePopup
        }
      })
    }
  })

  return popup
}

async function handler(ev: MapMouseEvent, map: Map): Promise<Map> {
  removePopup()

  const features = map.queryRenderedFeatures(ev.point)

  const hoveredFeature =
    features &&
    features.find(
      feature =>
        feature.layer.id === 'bezirkskarte-fill-hasog' ||
        feature.layer.id === 'bezirkskarte-fill-noog',
    )

  if (hoveredFeature && hoveredFeature.properties) {
    popup = await createPopup(hoveredFeature, ev.point)

    if (popup) {
      document.body.appendChild(popup)
    }
  }

  return map
}

export default handler
