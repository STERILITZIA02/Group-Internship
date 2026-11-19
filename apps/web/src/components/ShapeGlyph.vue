<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ sides: number }>()
const clip = computed(() => {
  const step = (2 * Math.PI) / props.sides
  const start = -Math.PI / 2 + (props.sides % 2 === 0 ? step / 2 : 0)
  const points = Array.from({ length: props.sides }, (_, i) => {
    const angle = start + i * step
    return 50 + 50 * Math.cos(angle) + '% ' + (50 + 50 * Math.sin(angle)) + '%'
  })
  return 'polygon(' + points.join(',') + ')'
})
</script>
<template>
  <span class="shape-glyph" aria-hidden="true" :style="{ clipPath: clip }"></span>
</template>
