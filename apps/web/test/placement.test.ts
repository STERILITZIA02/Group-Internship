import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createPolygon } from '../src/editor/polygons.ts'

test('new polygons reuse a vacant placement after removal', () => {
  const first = createPolygon(3, [])
  const second = createPolygon(4, [first])
  const third = createPolygon(5, [first, second])
  const added = createPolygon(6, [first, third])
  assert.deepEqual(added.transform, second.transform)
  assert.notEqual(added.id, second.id)
})
