import { watchEffect, type App } from 'vue'
import { createI18n } from 'vue-i18n'
import { en, type EditorMessages } from './locales/en.ts'

export type Catalog = { direction: 'ltr' | 'rtl'; messages: EditorMessages }
const defaultLocale = 'en'
export const catalogs: Record<string, Catalog> = {
  [defaultLocale]: { direction: 'ltr', messages: en },
}

function resolveLocale(preferences: readonly string[], available: readonly string[]) {
  const tags = new Map(available.map((tag) => [tag.toLowerCase(), tag]))
  for (const preference of preferences) {
    let tag = preference.toLowerCase()
    while (tag) {
      const match = tags.get(tag)
      if (match) return match
      const separator = tag.lastIndexOf('-')
      if (separator < 0) break
      tag = tag.slice(0, separator)
    }
  }
  return defaultLocale
}

export function createEditorI18n(preferences: readonly string[], packs = catalogs) {
  return createI18n({
    legacy: false,
    globalInjection: false,
    locale: resolveLocale(preferences, Object.keys(packs)),
    fallbackLocale: defaultLocale,
    messages: Object.fromEntries(Object.entries(packs).map(([tag, pack]) => [tag, pack.messages])),
  })
}

export function installEditorI18n(app: App, packs = catalogs) {
  const i18n = createEditorI18n(navigator.languages, packs)
  app.use(i18n)
  app.onUnmount(
    watchEffect(() => {
      const tag = i18n.global.locale.value
      document.documentElement.lang = tag
      document.documentElement.dir = packs[tag].direction
      document.title = i18n.global.t('page.title')
    }),
  )
}

declare module 'vue-i18n' {
  interface DefineLocaleMessage extends EditorMessages {}
}
