import { expect, test } from '@playwright/test'

test('camera tools, precise edits and a reloaded selection share one scene', async ({ page }) => {
  const current = await (await page.request.get('/api/scene')).json()
  const rotation = 0.12345678912345
  const id = crypto.randomUUID()
  const square = { id, sides: 4, transform: { x: 0.04, z: 0, rotation, scale: 1 } }
  const scene = { ...current.scene, polygons: [square] }
  const save = await page.request.post('/api/scene/commands', {
    data: {
      commandId: crypto.randomUUID(),
      baseRevision: current.revision,
      command: { type: 'open', scene },
    },
  })
  expect(save.ok()).toBe(true)
  const { revision } = await save.json()
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Reset view' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Square 1' })).toBeVisible()
  const canvas = page.locator('canvas')
  const box = (await canvas.boundingBox())!
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2
  const edits: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/scene/commands'))
      edits.push(request.url())
  })
  await page.getByRole('button', { name: 'Pan', exact: true }).click()
  const canvasCentre = () =>
    page.screenshot({ clip: { x: x - 32, y: y - 32, width: 64, height: 64 } })
  const beforePan = await canvasCentre()
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 40, y + 20, { steps: 3 })
  await page.mouse.up()
  await expect.poll(async () => (await canvasCentre()).equals(beforePan)).toBe(false)
  await expect(page.getByRole('button', { name: 'Square 1' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await page.getByRole('button', { name: 'Reset view' }).click()
  await page.getByRole('button', { name: 'Select', exact: true }).click()
  await page.mouse.move(x, y)
  await page.mouse.down()
  await expect(page.getByLabel('X (m)', { exact: true })).toHaveValue('0.04')
  await page.mouse.move(x + 1, y)
  await page.mouse.up()
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await page.getByLabel('Scale', { exact: true }).fill('0')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByLabel('Scale', { exact: true })).toHaveJSProperty(
    'validationMessage',
    'Enter a scale greater than zero.',
  )
  expect(edits).toHaveLength(0)
  await page.getByLabel('Scale', { exact: true }).fill('0.0000001')
  await page.getByLabel('X (m)', { exact: true }).fill('1.125')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (revision + 1))
  const result = await (await page.request.get('/api/scene')).json()
  expect(result.scene.polygons[0].transform).toEqual({ x: 1.125, z: 0, rotation, scale: 1e-7 })
  expect(edits).toHaveLength(1)

  // A later file can reuse an ID. An object removed on reload must lose its selection.
  for (const polygons of [[], [square]]) {
    const { revision: latest } = await (await page.request.get('/api/scene')).json()
    const write = await page.request.post('/api/scene/commands', {
      data: {
        commandId: crypto.randomUUID(),
        baseRevision: latest,
        command: { type: 'open', scene: { ...scene, polygons } },
      },
    })
    expect(write.ok()).toBe(true)
    await page.getByRole('button', { name: 'Reload', exact: true }).click()
    await expect(page.getByRole('status')).toHaveText('Local file · revision ' + (latest + 1))
  }
  await expect(page.getByRole('button', { name: 'Square 1' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('a late add response keeps the user’s newer selection', async ({ page }) => {
  const original = {
    id: crypto.randomUUID(),
    sides: 4,
    transform: { x: 0, z: 0, rotation: 0, scale: 1 },
  }
  const scene = { schemaVersion: 1, units: 'm', north: '-Z', polygons: [original] }
  await page.route('**/api/scene', (route) => route.fulfill({ json: { revision: 1, scene } }))
  let acknowledge!: () => void
  const ack = new Promise<void>((resolve) => {
    acknowledge = resolve
  })
  await page.route('**/api/scene/commands', async (route) => {
    const added = route.request().postDataJSON().command.polygon
    await ack
    await route.fulfill({ json: { revision: 2, scene: { ...scene, polygons: [original, added] } } })
  })
  await page.goto('/')
  try {
    await page.getByRole('button', { name: 'Add polygon' }).click()
    await expect(page.getByRole('button', { name: 'Triangle 2' })).toBeVisible()
    await page.getByRole('button', { name: 'Square 1' }).click()
  } finally {
    acknowledge()
  }
  await expect(page.getByRole('status')).toHaveText('Local file · revision 2')
  await expect(page.getByRole('button', { name: 'Square 1' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
