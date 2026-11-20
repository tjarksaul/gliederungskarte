import { test, expect, Page } from '@playwright/test'

const CITIES = {
  'Osterholz-Scharmbeck': [8.7937, 53.2252],
  Cuxhaven: [8.6944, 53.8603],
  Bremerhaven: [8.5809, 53.5396],
  Lamstedt: [9.099, 53.629],
}

const viewports = [
  { name: 'phone', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
]

async function loadMap(page: Page) {
  await page.goto('/')
  await page.waitForFunction(() => {
    const m = (window as any).__map
    return m && m.loaded() && m.getLayer('bezirkskarte-border')
  })
}

test('renders a map canvas with all overlay layers', async ({ page }) => {
  await loadMap(page)
  await expect(page.locator('canvas.mapboxgl-canvas')).toBeVisible()
  const layers = await page.evaluate(() => {
    const m = (window as any).__map
    return ['bezirkskarte-fill-hasog', 'bezirkskarte-fill-noog'].map(id => !!m.getLayer(id))
  })
  expect(layers).toEqual([true, true])
})

test('draws red overlays with an OG and yellow without', async ({ page }) => {
  await loadMap(page)
  const query = (lngLat: number[], layer: string) =>
    page.evaluate(
      ([ll, id]) => {
        const m = (window as any).__map
        return m.queryRenderedFeatures(m.project(ll), { layers: [id] }).length
      },
      [lngLat, layer] as [number[], string],
    )

  // Cuxhaven has an OG, Hemmoor does not
  expect(await query([8.6944, 53.8603], 'bezirkskarte-fill-hasog')).toBeGreaterThan(0)
  expect(await query([8.6944, 53.8603], 'bezirkskarte-fill-noog')).toBe(0)
  expect(await query([9.1167, 53.7], 'bezirkskarte-fill-noog')).toBeGreaterThan(0)
  expect(await query([9.1167, 53.7], 'bezirkskarte-fill-hasog')).toBe(0)
})

for (const vp of viewports) {
  test(`shows Elbe-Weser-Dreieck at a sensible zoom on ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await loadMap(page)
    const { zoom, visible } = await page.evaluate(cities => {
      const m = (window as any).__map
      const b = m.getBounds()
      return {
        zoom: m.getZoom(),
        visible: Object.entries(cities).map(([n, ll]) => [n, b.contains(ll)]),
      }
    }, CITIES)

    expect(zoom).toBeGreaterThanOrEqual(7)
    expect(zoom).toBeLessThanOrEqual(12)
    for (const [name, inView] of visible) expect(inView, `${name} visible`).toBe(true)
  })
}

async function pointOf(page: Page, lngLat: number[]) {
  return page.evaluate(ll => {
    const m = (window as any).__map
    const p = m.project(ll)
    const r = m.getCanvas().getBoundingClientRect()
    return { x: r.left + p.x, y: r.top + p.y }
  }, lngLat)
}

const CUXHAVEN = [8.6944, 53.8603]
const HEMMOOR = [9.1167, 53.7]

test('clicking a region with an OG opens a popup with contact info; Escape closes it', async ({ page }) => {
  await loadMap(page)
  const { x, y } = await pointOf(page, CUXHAVEN)
  await page.mouse.click(x, y)
  const popup = page.locator('.popup')
  await expect(popup).toBeVisible()
  await expect(popup.locator('h3')).toHaveText('Cuxhaven')
  await expect(popup.locator('a.popup__link')).toHaveAttribute('href', /cuxhaven\.dlrg\.de/)
  await page.keyboard.press('Escape')
  await expect(popup).toHaveCount(0)
})

test('clicking a region without an OG lists nearby OGs; close button works', async ({ page }) => {
  await loadMap(page)
  const { x, y } = await pointOf(page, HEMMOOR)
  await page.mouse.click(x, y)
  const popup = page.locator('.popup')
  await expect(popup).toContainText('noch keine DLRG-Ortsgruppe')
  await expect(popup.locator('a.popup__link').first()).toBeVisible()
  await page.locator('#popup__close-button').click()
  await expect(popup).toHaveCount(0)
})

test('hovering shows a tooltip with the region name and moving off the region hides it', async ({ page }) => {
  await loadMap(page)
  const { x, y } = await pointOf(page, CUXHAVEN)
  await page.mouse.move(x - 3, y - 3)
  await page.mouse.move(x, y)
  await expect(page.locator('.tooltip')).toHaveText('Cuxhaven')
  const sea = await pointOf(page, [8.5, 53.85])
  await page.mouse.move(sea.x, sea.y)
  await expect(page.locator('.tooltip')).toHaveCount(0)
})

test('a plain mouse wheel does not zoom and shows a hint', async ({ page }) => {
  await loadMap(page)
  const before = await page.evaluate(() => (window as any).__map.getZoom())
  const { x, y } = await pointOf(page, CUXHAVEN)
  await page.mouse.move(x, y)
  await page.mouse.wheel(0, -400)
  await expect(page.locator('#interactionInfo')).toBeVisible()
  await page.waitForTimeout(500)
  expect(await page.evaluate(() => (window as any).__map.getZoom())).toBeCloseTo(before, 3)
})

test('loads without console errors or failed requests', async ({ page }) => {
  const problems: string[] = []
  // mapbox-gl 1.x registers an unload listener, which newer Chromium warns about
  const ignored = /Permissions policy violation: unload/
  page.on('console', m => m.type() === 'error' && !ignored.test(m.text()) && problems.push(m.text()))
  page.on('pageerror', e => problems.push(e.message))
  page.on('response', r => r.status() === 401 && problems.push(`401 ${r.url()}`))
  await loadMap(page)
  expect(problems).toEqual([])
})

test.describe('touch device', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('tapping a region opens the popup', async ({ page }) => {
    await loadMap(page)
    const { x, y } = await pointOf(page, CUXHAVEN)
    await page.touchscreen.tap(x, y)
    await expect(page.locator('.popup h3')).toHaveText('Cuxhaven')
  })
})
