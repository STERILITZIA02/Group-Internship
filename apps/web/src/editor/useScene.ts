import { ref, shallowRef, computed } from 'vue'
import { applyCommand, emptyScene, sceneSchema, snapshotSchema } from '@garden/scene'
import type { Command, Scene, Snapshot } from '@garden/scene'

export function useScene() {
  const state = shallowRef<Snapshot>({ revision: 0, scene: emptyScene() })
  const draft = shallowRef<Scene | null>(null)
  const scene = computed(() => draft.value ?? state.value.scene)
  const busy = ref(false),
    ready = ref(false),
    error = ref('')
  async function load() {
    if (busy.value) return
    busy.value = true
    try {
      const response = await fetch('/api/scene', { cache: 'no-store' })
      if (!response.ok) throw new Error('Could not open the local scene')
      state.value = snapshotSchema.parse(await response.json())
      draft.value = null
      ready.value = true
      error.value = ''
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      busy.value = false
    }
  }
  async function edit(command: Command) {
    if (busy.value || !ready.value || draft.value) return false
    busy.value = true
    try {
      draft.value = applyCommand(state.value.scene, command)
      const response = await fetch('/api/scene/commands', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          commandId: crypto.randomUUID(),
          baseRevision: state.value.revision,
          command,
        }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message ?? 'Save failed')
      state.value = snapshotSchema.parse({ revision: body.revision, scene: body.scene })
      draft.value = null
      error.value = ''
      return true
    } catch (e) {
      error.value = (e as Error).message
      return false
    } finally {
      busy.value = false
    }
  }
  async function open(file: File) {
    try {
      return await edit({ type: 'open', scene: sceneSchema.parse(JSON.parse(await file.text())) })
    } catch {
      error.value = 'Could not open this file. Choose a version 1 scene JSON.'
      return false
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(scene.value, null, 2) + '\n'], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'scene.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return { state, scene, draft, busy, ready, error, load, edit, open, download }
}
