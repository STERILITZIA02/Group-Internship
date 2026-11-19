import { computed, ref, shallowRef } from 'vue'
import { applyCommand, emptyScene, type Command, type Scene, type Snapshot } from '@garden/scene'
import { SceneError, type SceneErrorCode } from '@garden/scene/protocol'
import { sceneClient } from '../io/sceneClient'
import { readSceneFile } from '../io/sceneFile'

export type EditorErrorCode = SceneErrorCode | 'load_failed' | 'save_failed' | 'invalid_file'

export function useScene() {
  const saved = shallowRef<Snapshot>({ revision: 0, scene: emptyScene() })
  const draft = shallowRef<Scene | null>(null)
  const scene = computed(() => draft.value ?? saved.value.scene)
  const busy = ref(false)
  const ready = ref(false)
  const error = ref<EditorErrorCode | null>(null)
  const locked = computed(() => busy.value || !ready.value || draft.value !== null)
  async function load() {
    if (busy.value) return
    busy.value = true
    try {
      saved.value = await sceneClient.read()
      draft.value = null
      ready.value = true
      error.value = null
    } catch (err) {
      error.value = err instanceof SceneError ? err.code : 'load_failed'
    } finally {
      busy.value = false
    }
  }
  async function submit(prepare: () => Command | Promise<Command | null>) {
    if (locked.value) return false
    busy.value = true
    try {
      const command = await prepare()
      if (!command) return false
      draft.value = applyCommand(saved.value.scene, command)
      saved.value = await sceneClient.edit({
        commandId: crypto.randomUUID(),
        baseRevision: saved.value.revision,
        command,
      })
      draft.value = null
      error.value = null
      return true
    } catch (err) {
      error.value = err instanceof SceneError ? err.code : 'save_failed'
      return false
    } finally {
      busy.value = false
    }
  }
  function edit(command: Command) {
    return submit(() => command)
  }
  function open(file: File) {
    return submit(async () => {
      try {
        return { type: 'open', scene: await readSceneFile(file) }
      } catch {
        error.value = 'invalid_file'
        return null
      }
    })
  }
  return { saved, scene, draft, busy, ready, locked, error, load, edit, open }
}
