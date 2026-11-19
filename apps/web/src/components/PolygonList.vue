<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Polygon } from '@garden/scene'
import { polygonPresets } from '../editor/polygons'

defineProps<{ polygons: Polygon[]; selected: string | null; locked: boolean }>()
const emit = defineEmits<{ select: [id: string]; add: [sides: number] }>()
const sides = ref<number>(polygonPresets[0].sides)
const { t, n } = useI18n()
function label(p: Polygon, index: number) {
  const preset = polygonPresets.find((option) => option.sides === p.sides)
  const shape = preset ? t(`objects.${preset.name}`) : t('objects.generic', { sides: n(p.sides) })
  return t('objects.item', { shape, index: n(index + 1) })
}
</script>
<template>
  <section>
    <h2>
      {{ t('objects.heading') }} <small>{{ n(polygons.length) }}</small>
    </h2>
    <div class="add-row">
      <select v-model="sides" :aria-label="t('objects.shape')">
        <option v-for="preset in polygonPresets" :key="preset.sides" :value="preset.sides">
          {{ t(`objects.${preset.name}`) }}
        </option>
      </select>
      <button class="primary" :disabled="locked" @click="emit('add', sides)">
        {{ t('objects.add') }}
      </button>
    </div>
    <ul class="objects">
      <li v-for="(polygon, i) in polygons" :key="polygon.id">
        <button :aria-pressed="selected === polygon.id" @click="emit('select', polygon.id)">
          {{ label(polygon, i) }}
        </button>
      </li>
    </ul>
  </section>
</template>
