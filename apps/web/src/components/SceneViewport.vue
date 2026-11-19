<script setup lang="ts">
import { useTemplateRef, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { MousePointer2, Hand, Minus, Plus, Scan } from '@lucide/vue'
import { useViewport, type CanvasProps } from '../editor/useViewport'
import type { CanvasToolId } from '../editor/tools'
const toolIcons = { select: MousePointer2, pan: Hand } satisfies Record<CanvasToolId, Component>
const props = defineProps<CanvasProps>()
const { t } = useI18n()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { tool, status, zoomIn, zoomOut, reset } = useViewport(canvas, props)
</script>
<template>
  <section class="stage" :data-tool="tool" :aria-label="t('viewport.label')">
    <canvas ref="canvas" :aria-label="t('viewport.canvas')"></canvas>
    <p v-if="status !== 'ready'" class="gpu" role="status">{{ t(`viewport.${status}`) }}</p>
    <template v-else>
      <div class="tool-strip edit-tools" role="group" :aria-label="t('viewport.tools')">
        <button
          v-for="(icon, id) in toolIcons"
          :key="id"
          :aria-pressed="tool === id"
          :title="t(`viewport.${id}`)"
          :aria-label="t(`viewport.${id}`)"
          @click="tool = id"
        >
          <component :is="icon" aria-hidden="true" />
        </button>
      </div>
      <div class="tool-strip view-tools" role="group" :aria-label="t('viewport.camera')">
        <button :title="t('viewport.zoomOut')" :aria-label="t('viewport.zoomOut')" @click="zoomOut">
          <Minus aria-hidden="true" />
        </button>
        <button :title="t('viewport.zoomIn')" :aria-label="t('viewport.zoomIn')" @click="zoomIn">
          <Plus aria-hidden="true" />
        </button>
        <button class="reset-view" @click="reset">
          <Scan aria-hidden="true" />{{ t('viewport.reset') }}
        </button>
      </div>
    </template>
  </section>
</template>
