// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'
import handler, { removePopup } from 'map/popup'
import oginfo from 'json/oginfo.json'

type Props = Record<string, unknown>

function fakeMap(props: Props | null, layerId = 'bezirkskarte-fill-hasog') {
  return {
    queryRenderedFeatures: () =>
      props ? [{ layer: { id: layerId }, properties: props }] : [],
  } as any
}

const click = (map: any, x = 10, y = 10) => handler({ point: { x, y } } as any, map)
const popupEl = () => document.querySelector('.popup') as HTMLElement | null

beforeEach(() => {
  removePopup()
  document.body.innerHTML = ''
})

describe('popup', () => {
  it('shows OG contact info for a region with an OG', async () => {
    const ags = '03 3 52 011'
    await click(fakeMap({ Name: 'Cuxhaven', hasOG: true, AGS: ags, ogAgsIds: null }))
    const el = popupEl()!
    expect(el.querySelector('h3')!.textContent).toBe('Cuxhaven')
    expect(el.querySelector('h4')!.textContent).toBe((oginfo as any)[ags].fullname)
    const link = el.querySelector('a.popup__link') as HTMLAnchorElement
    expect(link.href).toContain('cuxhaven.dlrg.de')
  })

  it('lists nearby OGs for a region without one', async () => {
    const ids = ['03 3 52 5411', '03 3 52 5404']
    await click(fakeMap({ Name: 'Hemmoor', hasOG: false, AGS: 'x', ogAgsIds: JSON.stringify(ids) }, 'bezirkskarte-fill-noog'))
    const el = popupEl()!
    expect(el.textContent).toContain('noch keine DLRG-Ortsgruppe')
    const links = Array.from(el.querySelectorAll('a.popup__link')).map(a => a.textContent)
    expect(links).toEqual(ids.map(i => (oginfo as any)[i].shortname))
    expect(el.textContent).toContain(`${links[0]} oder ${links[1]}`)
  })

  it('joins three OGs with commas and a final "oder"', async () => {
    const ids = ['03 3 52 050', '03 3 52 060', '03 3 56 5401']
    await click(fakeMap({ Name: 'Beverstedt', hasOG: false, AGS: 'x', ogAgsIds: JSON.stringify(ids) }, 'bezirkskarte-fill-noog'))
    const n = ids.map(i => (oginfo as any)[i].shortname)
    expect(popupEl()!.textContent).toContain(`${n[0]}, ${n[1]} oder ${n[2]}`)
  })

  it('opens nothing when no region is under the cursor', async () => {
    await click(fakeMap(null))
    expect(popupEl()).toBeNull()
  })

  it('replaces the previous popup on a new click', async () => {
    const map = fakeMap({ Name: 'Cuxhaven', hasOG: true, AGS: '03 3 52 011', ogAgsIds: null })
    await click(map)
    await click(map)
    expect(document.querySelectorAll('.popup')).toHaveLength(1)
  })

  it('closes via the close button and via removePopup', async () => {
    const map = fakeMap({ Name: 'Cuxhaven', hasOG: true, AGS: '03 3 52 011', ogAgsIds: null })
    await click(map)
    ;(document.getElementById('popup__close-button') as HTMLButtonElement).click()
    expect(popupEl()).toBeNull()

    await click(map)
    removePopup()
    expect(popupEl()).toBeNull()
  })

  it('anchors the popup to the nearest viewport corner', async () => {
    const map = fakeMap({ Name: 'Cuxhaven', hasOG: true, AGS: '03 3 52 011', ogAgsIds: null })
    const w = 1000
    const h = 800
    Object.defineProperty(document.documentElement, 'clientWidth', { value: w, configurable: true })
    Object.defineProperty(document.documentElement, 'clientHeight', { value: h, configurable: true })
    await click(map, 1, 1)
    expect(popupEl()!.getAttribute('style')).toMatch(/top: 1px.*left: 1px/)
    removePopup()
    await click(map, w - 1, h - 1)
    expect(popupEl()!.getAttribute('style')).toMatch(/bottom: 1px.*right: 1px/)
  })
})
