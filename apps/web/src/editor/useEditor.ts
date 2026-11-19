import { computed, shallowRef, watch } from 'vue'
import type { Transform } from '@garden/scene'
import { createPolygon } from './polygons'
import { useScene } from './useScene'
import { sameTransform } from './transforms'
import type { ObjectActions } from './viewport'

export type Selection = Readonly<{ id: string | null }>

export function useEditor() {
  const document = useScene()
  const selection = shallowRef<Selection>({ id: null })
  const objects = computed(() => new Map(document.scene.value.polygons.map((p) => [p.id, p])))
  const selected = computed(() =>
    selection.value.id === null ? undefined : objects.value.get(selection.value.id),
  )
  function select(id: string | null) {
    selection.value = { id: id !== null && objects.value.has(id) ? id : null }
  }
  watch(
    objects,
    (items) => {
      if (selection.value.id !== null && !items.has(selection.value.id)) select(null)
    },
    { flush: 'sync' },
  )

  function move(id: string, transform: Transform) {
    const current = objects.value.get(id)?.transform
    if (current && sameTransform(current, transform)) return
    return document.edit({ type: 'transform', id, transform })
  }
  const actions: ObjectActions = {
    select,
    move,
    movableTransform: (id) =>
      document.locked.value ? undefined : objects.value.get(id)?.transform,
  }
  async function add(sides: number) {
    const intent = selection.value
    const polygon = createPolygon(sides, document.scene.value.polygons)
    if ((await document.edit({ type: 'add', polygon })) && intent === selection.value)
      select(polygon.id)
  }
  async function open(file: File) {
    const intent = selection.value
    if ((await document.open(file)) && intent === selection.value) select(null)
  }
  function remove(id: string) {
    return document.edit({ type: 'remove', id })
  }
  return { document, selection, selected, actions, add, remove, open }
}
