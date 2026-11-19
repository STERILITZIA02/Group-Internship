<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Transform } from '@garden/scene'
import { fromInspector, toInspector } from '../editor/polygons'
import { editing } from '../editor/settings'

const props = defineProps<{ transform: Transform; locked: boolean }>()
const emit = defineEmits<{ apply: [transform: Transform]; remove: [] }>()
const { t } = useI18n()
const fields = ref(toInspector(props.transform))
const keys = ['x', 'z', 'degrees', 'scale'] as const
watch(
  () => props.transform,
  (t) => {
    fields.value = toInspector(t)
  },
)
</script>
<template>
  <section>
    <h2>{{ t('transform.heading') }}</h2>
    <form class="transform-form" @submit.prevent="emit('apply', fromInspector(fields))">
      <label v-for="key in keys" :key="key"
        >{{ t(`transform.${key}`) }}
        <input
          v-model.number="fields[key]"
          type="number"
          required
          step="any"
          :min="key === 'scale' ? editing.minimumInputScale : undefined"
        />
      </label>
      <button class="primary" :disabled="locked">{{ t('transform.apply') }}</button>
      <button type="button" :disabled="locked" @click="emit('remove')">
        {{ t('transform.remove') }}
      </button>
    </form>
  </section>
</template>
