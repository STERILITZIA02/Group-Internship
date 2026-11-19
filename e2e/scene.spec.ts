import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('blank scene, WebGL drag, numeric edit and file round trip', async ({ page }) => {
  const current = await (await page.request.get('/api/scene')).json()
  const reset = await page.request.post('/api/scene/commands', {
    data: {
      commandId: crypto.randomUUID(),
      baseRevision: current.revision,
      command: { type: 'open', scene: { ...current.scene, polygons: [] } },
    },
  })
  expect(reset.ok()).toBe(true)
  const { revision } = await reset.json()
  await page.goto('/')
  await expect(page.getByText('Local file · revision ' + revision, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
  await page.getByRole('button', { name: 'Add polygon' }).click()
  const canvas = page.locator('canvas')
  const bounds = (await canvas.boundingBox())!
  const x = bounds.x + bounds.width / 2,
    y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 60, y, { steps: 6 })
  await page.mouse.up()
  await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (revision + 2))
  await page.getByLabel('X (m)', { exact: true }).fill('2.5')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (revision + 3))
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const file = (await (await downloaded).path())!
  const exported = JSON.parse(await readFile(file, 'utf8'))
  expect(exported.polygons[0].transform.x).toBe(2.5)
  await page.getByRole('button', { name: 'Remove', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (revision + 4))
  await page
    .locator('input[type=file]')
    .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') })
  await expect(page.getByRole('alert')).toContainText('Could not open')
  await page.locator('input[type=file]').setInputFiles(file)
  await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (revision + 5))
  await page.reload()
  await page.getByRole('button', { name: 'Triangle 1' }).click()
  await expect(page.getByLabel('X (m)', { exact: true })).toHaveValue('2.5')
  expect((await (await page.request.get('/api/scene')).json()).scene).toEqual(exported)
})
test('touch: adding a second finger cancels an object drag', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    hasTouch: true,
    baseURL,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  try {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
    const snap = await (await page.request.get('/api/scene')).json()
    const polygon = {
      id: crypto.randomUUID(),
      sides: 4,
      transform: { x: 0, z: 0, rotation: 0, scale: 1 },
    }
    await page.request.post('/api/scene/commands', {
      data: {
        baseRevision: snap.revision,
        commandId: crypto.randomUUID(),
        command: { type: 'open', scene: { ...snap.scene, polygons: [polygon] } },
      },
    })
    await page.getByRole('button', { name: 'Reload', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Square 1' })).toBeVisible()
    const b = (await page.locator('canvas').boundingBox())!
    const x = b.x + b.width / 2,
      y = b.y + b.height / 2
    const cdp = await context.newCDPSession(page)
    const touch = (
      type: 'touchStart' | 'touchMove' | 'touchEnd',
      touchPoints: { x: number; y: number; id: number }[],
    ) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
    await touch('touchStart', [{ x, y, id: 1 }])
    await touch('touchMove', [{ x: x + 24, y, id: 1 }])
    await touch('touchStart', [
      { x: x + 24, y, id: 1 },
      { x: x + 50, y: y + 30, id: 2 },
    ])
    await touch('touchEnd', [])
    await expect(page.getByRole('button', { name: 'Square 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    const saved = await (await page.request.get('/api/scene')).json()
    expect(saved.revision).toBe(snap.revision + 1)
    expect(saved.scene.polygons).toEqual([polygon])
  } finally {
    await context.close()
  }
})
