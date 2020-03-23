import { Map, MapboxEvent } from 'mapbox-gl'

function isTouchEvent(
  e: MapboxEvent<MouseEvent | TouchEvent | undefined>,
): e is MapboxEvent<TouchEvent> {
  return e.originalEvent ? 'touches' in e.originalEvent : false
}

function isTwoFingerTouch(e: MapboxEvent<TouchEvent>): boolean {
  return e.originalEvent.touches.length >= 2
}

let timeout: number | undefined

function hideScrollInfo(): void {
  const touchInfo = document.getElementById('touchInfo')
  if (touchInfo) {
    touchInfo.style.display = 'none'
  }

  window.clearTimeout(timeout)
}

function showScrollInfo(touch: boolean): void {
  const touchInfo = document.getElementById('touchInfo')
  if (touchInfo) {
    let text = 'Zum Bewegen der Karte mit zwei Fingern berühren.'

    if (!touch) {
      const macOS = navigator.platform.toLowerCase().indexOf('mac') >= 0
      const key = macOS ? '⌘' : 'Strg'
      text = `Zum Zoomen der Karte bei gedrückter ${key}-Taste scrollen.`
    }

    touchInfo.innerText = text

    touchInfo.style.display = 'flex'
  }
}

function showScrollInfoWithTimeout(touch = true): void {
  window.clearTimeout(timeout)

  showScrollInfo(touch)
  timeout = window.setTimeout(() => {
    hideScrollInfo()
  }, 3000)
}

export function disableOneFingerTouch(map: Map): Map {
  map.on('dragstart', event => {
    if (isTouchEvent(event) && !isTwoFingerTouch(event)) {
      showScrollInfoWithTimeout()
      map.dragPan.disable()
    }
  })

  // Drag events not emited after dragPan disabled, so I use touch event here
  map.on('touchstart', event => {
    if (isTouchEvent(event) && isTwoFingerTouch(event)) {
      hideScrollInfo()
      map.dragPan.enable()
    }
  })

  map.on('wheel', event => {
    const { ctrlKey, altKey, metaKey } = event.originalEvent

    if (ctrlKey || metaKey || altKey) {
      return
    }

    showScrollInfoWithTimeout(false)
    event.preventDefault()
  })

  return map
}
