<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Polygon, Transform } from '@garden/scene'
import { useScene } from './editor/useScene'
import type { createViewport } from './viewport/viewport'

const { state, scene, draft, busy, ready, error, load, edit, open, download } = useScene()
const selected = ref<string | null>(null)
const polygon = computed(() => scene.value.polygons.find((p) => p.id === selected.value))
const locked = computed(() => busy.value || !ready.value || Boolean(draft.value))
const canvas = ref<HTMLCanvasElement>(),
  picker = ref<HTMLInputElement>()
const viewport = shallowRef<ReturnType<typeof createViewport>>()
const gpu = ref('Loading viewport…')
const sides = ref(3)
const fields = ref({ x: 0, z: 0, degrees: 0, scale: 1 })
const numeric = ['x', 'z', 'degrees', 'scale'] as const
const labels = { x: 'X (m)', z: 'Z (m)', degrees: 'Rotation (°)', scale: 'Scale' }
const rad = Math.PI / 180
watch(polygon, (p) => {
  if (p)
    fields.value = {
      x: p.transform.x,
      z: p.transform.z,
      degrees: +(p.transform.rotation / rad).toFixed(6),
      scale: p.transform.scale,
    }
})
watch([scene, selected, viewport], () => viewport.value?.update(scene.value, selected.value))
let disposed = false
onMounted(async () => {
  void load()
  try {
    const { createViewport } = await import('./viewport/viewport')
    if (disposed || !canvas.value) return
    viewport.value = createViewport(canvas.value, {
      select: (id) => {
        selected.value = id
      },
      move: (id, transform) => {
        void edit({ type: 'transform', id, transform })
      },
      editable: () => !locked.value,
    })
    gpu.value = ''
  } catch {
    gpu.value = '3D unavailable. Use the object list and numeric controls.'
  }
})
onBeforeUnmount(() => {
  disposed = true
  viewport.value?.dispose()
})
function name(p: Polygon) {
  return (
    ({ 3: 'Triangle', 4: 'Square', 5: 'Pentagon', 6: 'Hexagon' } as Record<number, string>)[
      p.sides
    ] ?? p.sides + '-gon'
  )
}
async function add() {
  const id = crypto.randomUUID()
  const n = scene.value.polygons.length
  if (
    await edit({
      type: 'add',
      polygon: {
        id,
        sides: sides.value,
        transform: {
          x: (n % 4) * 2.25,
          z: Math.floor(n / 4) * 2.25,
          rotation: 0,
          scale: 1,
        },
      },
    })
  )
    selected.value = id
}
function apply() {
  if (!polygon.value) return
  const f = fields.value
  const transform: Transform = { x: f.x, z: f.z, rotation: f.degrees * rad, scale: f.scale }
  void edit({ type: 'transform', id: polygon.value.id, transform })
}
async function remove() {
  if (polygon.value && (await edit({ type: 'remove', id: polygon.value.id }))) selected.value = null
}
async function importFile() {
  const file = picker.value?.files?.[0]
  if (!file) return
  picker.value!.value = ''
  if (scene.value.polygons.length && !window.confirm('Replace the current scene with this file?'))
    return
  if (await open(file)) selected.value = null
}
</script>

<template>
  <header>
    <h1><span class="mark" aria-hidden="true">△</span> Scene editor</h1>
    <nav aria-label="Scene files">
      <button :disabled="locked" @click="picker?.click()">Open file</button>
      <input ref="picker" type="file" accept=".json,application/json" hidden @change="importFile" />
      <button :disabled="!ready" @click="download">Export JSON</button>
    </nav>
  </header>
  <main>
    <section class="stage" aria-label="Scene viewport">
      <canvas ref="canvas" aria-label="3D polygon editor"></canvas>
      <p v-if="gpu" class="gpu" role="status">{{ gpu }}</p>
      <div v-else class="view-tools" aria-label="Camera controls">
        <button title="Zoom out" aria-label="Zoom out" @click="viewport?.zoom(1.2)">−</button>
        <button title="Zoom in" aria-label="Zoom in" @click="viewport?.zoom(1 / 1.2)">+</button>
        <button @click="viewport?.home()">Reset view</button>
      </div>
    </section>
    <aside>
      <section>
        <h2>
          Objects <small>{{ scene.polygons.length }}</small>
        </h2>
        <div class="add-row">
          <select v-model="sides" aria-label="Polygon shape">
            <option
              v-for="(label, i) in ['Triangle', 'Square', 'Pentagon', 'Hexagon']"
              :key="label"
              :value="i + 3"
            >
              {{ label }}
            </option>
          </select>
          <button class="accent" :disabled="locked" @click="add">Add polygon</button>
        </div>
        <ul>
          <li v-for="(p, i) in scene.polygons" :key="p.id">
            <button :aria-pressed="selected === p.id" @click="selected = p.id">
              {{ name(p) }} {{ i + 1 }}
            </button>
          </li>
        </ul>
      </section>
      <section v-if="polygon">
        <h2>Transform</h2>
        <form @submit.prevent="apply">
          <label v-for="key in numeric" :key="key"
            >{{ labels[key] }}
            <input
              v-model.number="fields[key]"
              type="number"
              required
              step="any"
              :min="key === 'scale' ? 0.000001 : undefined"
            />
          </label>
          <button class="accent" :disabled="locked">Apply</button>
          <button type="button" :disabled="locked" @click="remove">Remove</button>
        </form>
      </section>
      <div class="sync">
        <span role="status">{{
          busy
            ? 'Working…'
            : draft
              ? 'Unsaved changes'
              : ready
                ? 'Local file · revision ' + state.revision
                : 'Local file offline'
        }}</span>
        <button :disabled="busy" @click="load">Reload</button>
      </div>
      <p v-if="error" class="error" role="alert">
        {{ error }} <span v-if="draft">Export a copy to keep your edit before reloading.</span>
      </p>
    </aside>
  </main>
</template>
