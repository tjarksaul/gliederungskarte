import bezMap, { removePopup } from 'map'
import { mapPosition, mapFit } from 'config'

const container = document.querySelector('#root') as HTMLDivElement

const map = bezMap(container, mapPosition, mapFit)

// exposed for end-to-end tests
;(window as unknown as { __map: typeof map }).__map = map

document.body.onkeydown = ev => {
  if (ev.key === 'Escape') {
    removePopup()
  }
}
