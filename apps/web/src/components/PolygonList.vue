<script setup lang="ts">
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { Layers, Plus, Shapes } from '@lucide/vue'
import type { Polygon } from '@garden/scene'
import { polygonPresets } from '../editor/polygons'
import ShapeGlyph from './ShapeGlyph.vue'
defineProps<{ polygons: Polygon[]; selected: string | null; locked: boolean }>()
const emit = defineEmits<{ select: [id: string]; add: [sides: number] }>()
const sides = ref<number>(polygonPresets[0].sides)
const presetGroup = useId()
const { t, n } = useI18n()
function label(p: Polygon, index: number) {
  const preset = polygonPresets.find((option) => option.sides === p.sides)
  const shape = preset ? t(`objects.${preset.name}`) : t('objects.generic', { sides: n(p.sides) })
  return t('objects.item', { shape, index: n(index + 1) })
}
</script>
<template>
  <section class="dock-section">
    <h2><Shapes aria-hidden="true" />{{ t('workspace.shapes') }}</h2>
    <fieldset class="preset-grid">
      <legend class="sr-only">{{ t('objects.shape') }}</legend>
      <label v-for="preset in polygonPresets" :key="preset.sides" class="preset">
        <input v-model="sides" type="radio" :name="presetGroup" :value="preset.sides" />
        <ShapeGlyph :sides="preset.sides" /><span>{{ t(`objects.${preset.name}`) }}</span>
      </label>
    </fieldset>
    <button class="primary add-shape" :disabled="locked" @click="emit('add', sides)">
      <Plus aria-hidden="true" />{{ t('objects.add') }}
    </button>
  </section>
  <section class="dock-section">
    <h2>
      <Layers aria-hidden="true" />{{ t('objects.heading') }}
      <small>{{ n(polygons.length) }}</small>
    </h2>
    <ul class="objects">
      <li v-for="(polygon, index) in polygons" :key="polygon.id">
        <button :aria-pressed="selected === polygon.id" @click="emit('select', polygon.id)">
          <ShapeGlyph :sides="polygon.sides" />{{ label(polygon, index) }}
        </button>
      </li>
    </ul>
  </section>
</template>
