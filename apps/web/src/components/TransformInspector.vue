<script setup lang="ts">
import { ref, watch, watchPostEffect, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { SlidersHorizontal } from '@lucide/vue'
import { transformSchema, type Transform } from '@garden/scene'
import { toInspector, fromInspector } from '../editor/transforms'
const props = defineProps<{ transform: Transform; locked: boolean }>()
const emit = defineEmits<{ apply: [transform: Transform]; remove: [] }>()
const { t } = useI18n()
const fields = ref(toInspector(props.transform))
const keys = ['x', 'z', 'degrees', 'scale'] as const
watch(
  () => toInspector(props.transform),
  (next, previous) => {
    for (const key of keys) if (next[key] !== previous[key]) fields.value[key] = next[key]
  },
)
const form = useTemplateRef<HTMLFormElement>('form')
watchPostEffect(() => {
  const scale = form.value?.elements.namedItem('scale') as HTMLInputElement | null
  if (scale)
    scale.setCustomValidity(
      transformSchema.shape.scale.safeParse(fields.value.scale).success
        ? ''
        : t('transform.positiveScale'),
    )
})
</script>
<template>
  <section class="dock-section">
    <h2><SlidersHorizontal aria-hidden="true" />{{ t('transform.heading') }}</h2>
    <form
      ref="form"
      class="transform-form"
      @submit.prevent="emit('apply', fromInspector(fields, props.transform))"
    >
      <label v-for="key in keys" :key="key"
        >{{ t(`transform.${key}`) }}
        <input v-model.number="fields[key]" :name="key" type="number" required step="any" />
      </label>
      <button class="primary" :disabled="locked">{{ t('transform.apply') }}</button>
      <button type="button" :disabled="locked" @click="emit('remove')">
        {{ t('transform.remove') }}
      </button>
    </form>
  </section>
</template>
