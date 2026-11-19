import { expect, test } from '@playwright/test'

test('numeric editing remains available without WebGL and stale edits can be exported', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return type.startsWith('webgl') ? null : Reflect.apply(original, this, [type, ...args])
      },
    })
  })
  await page.goto('/')
  await expect(page.getByText('3D unavailable.', { exact: false })).toBeVisible()
  const read = async () => (await page.request.get('/api/scene')).json()
  const initial = await read()
  const add = page.getByRole('button', { name: 'Add polygon' })
  await add.click()
  await expect(
    page.getByText('Local file · revision ' + (initial.revision + 1), { exact: true }),
  ).toBeVisible()
  const saved = await read()
  const last = saved.scene.polygons.at(-1)
  const response = await page.request.post('/api/scene/commands', {
    data: {
      commandId: crypto.randomUUID(),
      baseRevision: saved.revision,
      command: { type: 'transform', id: last.id, transform: { ...last.transform, x: 9 } },
    },
  })
  expect(response.ok()).toBe(true)
  await page.getByLabel('X (m)', { exact: true }).fill('12')
  await page.getByRole('button', { name: 'Apply', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Scene changed')
  await expect(page.getByRole('button', { name: 'Export JSON' })).toBeEnabled()
  expect((await read()).scene.polygons.at(-1).transform.x).toBe(9)
})
