import { expect, test, type Page } from '@playwright/test'

async function paletteOnCanvas(page: Page) {
  const png = (await page.locator('canvas').screenshot()).toString('base64')
  return page.evaluate(async (data) => {
    const image = new Image()
    image.src = 'data:image/png;base64,' + data
    await image.decode()
    const scratch = document.createElement('canvas')
    scratch.width = image.width
    scratch.height = image.height
    const ctx = scratch.getContext('2d')!
    ctx.drawImage(image, 0, 0)
    const { width, height, data: pixels } = ctx.getImageData(0, 0, image.width, image.height)
    const centre = 4 * (Math.floor(height / 2) * width + Math.floor(width / 2))
    let hasGround = false,
      hasGrid = false
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 200 && pixels[i + 1] > 190 && pixels[i + 2] < 95) hasGround = true
      if (pixels[i + 1] > pixels[i] + 20 && pixels[i + 1] > pixels[i + 2] + 15) hasGrid = true
      if (hasGround && hasGrid) break
    }
    return { hasGround, hasGrid, blueSelection: pixels[centre + 2] > pixels[centre] + 60 }
  }, png)
}

test.use({ locale: 'fr-CA' })
test('a root theme recolours the DOM and live WebGL view without changing the scene', async ({
  page,
}) => {
  const polygon = {
    id: crypto.randomUUID(),
    sides: 7,
    transform: { x: 0, z: 0, rotation: 0, scale: 1 },
  }
  let writes = 0
  await page.route('**/api/scene', (r) =>
    r.fulfill({
      json: {
        revision: 7,
        scene: { schemaVersion: 1, units: 'm', north: '-Z', polygons: [polygon] },
      },
    }),
  )
  await page.route('**/api/scene/commands', (r) => {
    writes++
    return r.abort()
  })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByRole('button', { name: '7-gon 1' }).click()
  await page.addStyleTag({
    content:
      ':root[data-theme="test"] { --surface:#faf0d0; --viewport-ground:#ffee10; --viewport-grid:#006040; --viewport-selected:#002be5; }',
  })
  await page.evaluate(() => (document.documentElement.dataset.theme = 'test'))
  await expect(page.getByRole('button', { name: 'Open file' })).toHaveCSS(
    'background-color',
    'rgb(250, 240, 208)',
  )
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#faf0d0')
  await expect
    .poll(() => paletteOnCanvas(page))
    .toEqual({ hasGround: true, hasGrid: true, blueSelection: true })
  await expect(page.getByRole('button', { name: '7-gon 1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('status')).toHaveText('Local file · revision 7')
  expect(writes).toBe(0)
})
