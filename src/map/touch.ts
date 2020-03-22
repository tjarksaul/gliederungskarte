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

function setTouchInfoVisible(visible: boolean): void {
  const state = visible ? 'flex' : 'none'
  const touchInfo = document.getElementById('touchInfo')
  if (touchInfo) {
    touchInfo.style.display = state
  }

  window.clearTimeout(timeout)
}

function showTouchInfoWithTimeout(): void {
  window.clearTimeout(timeout)

  setTouchInfoVisible(true)
  window.setTimeout(() => {
    setTouchInfoVisible(false)
  }, 3000)
}

export function disableOneFingerTouch(map: Map): Map {
  map.on('dragstart', event => {
    if (isTouchEvent(event) && !isTwoFingerTouch(event)) {
      showTouchInfoWithTimeout()
      map.dragPan.disable()
    }
  })

  // Drag events not emited after dragPan disabled, so I use touch event here
  map.on('touchstart', event => {
    if (isTouchEvent(event) && isTwoFingerTouch(event)) {
      setTouchInfoVisible(false)
      map.dragPan.enable()
    }
  })

  return map
}
