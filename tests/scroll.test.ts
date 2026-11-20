// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { disableUnmodifiedZoomScroll } from 'map/scroll'

function setup() {
  document.body.innerHTML = '<div id="interactionInfo" style="display: none"></div>'
  const handlers: Record<string, (e: any) => void> = {}
  const map = {
    on: (name: string, fn: (e: any) => void) => (handlers[name] = fn),
    dragPan: { enable: vi.fn(), disable: vi.fn() },
  } as any
  disableUnmodifiedZoomScroll(map)
  return { map, handlers, info: document.getElementById('interactionInfo')! }
}

const wheel = (mods: object) => ({ originalEvent: { ctrlKey: false, altKey: false, metaKey: false, ...mods }, preventDefault: vi.fn() })

describe('disableUnmodifiedZoomScroll', () => {
  beforeEach(() => vi.useFakeTimers())

  it('blocks a plain wheel and shows a hint that disappears after 3s', () => {
    const { handlers, info } = setup()
    const ev = wheel({})
    handlers.wheel(ev)
    expect(ev.preventDefault).toHaveBeenCalled()
    expect(info.style.display).toBe('flex')
    expect(info.innerText).toMatch(/Zoomen.*(Strg|⌘)/)
    vi.advanceTimersByTime(3000)
    expect(info.style.display).toBe('none')
  })

  it.each(['ctrlKey', 'metaKey', 'altKey'])('lets %s+wheel zoom', key => {
    const { handlers, info } = setup()
    const ev = wheel({ [key]: true })
    handlers.wheel(ev)
    expect(ev.preventDefault).not.toHaveBeenCalled()
    expect(info.style.display).toBe('none')
  })

  it('disables one-finger drag and re-enables on two-finger touch', () => {
    const { map, handlers, info } = setup()
    handlers.dragstart({ originalEvent: { touches: [{}] } })
    expect(map.dragPan.disable).toHaveBeenCalled()
    expect(info.style.display).toBe('flex')
    handlers.touchstart({ originalEvent: { touches: [{}, {}] } })
    expect(map.dragPan.enable).toHaveBeenCalled()
    expect(info.style.display).toBe('none')
  })

  it('ignores mouse drags', () => {
    const { map, handlers } = setup()
    handlers.dragstart({ originalEvent: {} })
    expect(map.dragPan.disable).not.toHaveBeenCalled()
  })
})
