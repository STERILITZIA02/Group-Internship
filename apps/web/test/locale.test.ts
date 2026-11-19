import assert from 'node:assert/strict'
import { test } from 'node:test'
import { catalogs, createEditorI18n, type Catalog } from '../src/i18n/index.ts'
import { en } from '../src/i18n/locales/en.ts'

test('a registered catalog controls word order and numbers; unsupported preferences fall back', () => {
  const packs = {
    ...catalogs,
    de: {
      direction: 'ltr',
      messages: {
        ...en,
        objects: { ...en.objects, item: '{index}. {shape}', pentagon: 'Fünfeck' },
        sync: { ...en.sync, saved: 'Gespeichert · Stand {revision}' },
      },
    },
  } satisfies Record<string, Catalog>
  const i18n = createEditorI18n(['fr-CA', 'de-AT'], packs)
  const locale = i18n.global
  assert.equal(locale.locale.value, 'de')
  assert.equal(
    locale.t('objects.item', { shape: locale.t('objects.pentagon'), index: locale.n(3) }),
    '3. Fünfeck',
  )
  assert.equal(locale.t('sync.saved', { revision: locale.n(12345) }), 'Gespeichert · Stand 12.345')
  i18n.dispose()
  const fallback = createEditorI18n(['ja-JP'])
  assert.equal(fallback.global.locale.value, 'en')
  assert.equal(fallback.global.t('files.open'), 'Open file')
  fallback.dispose()
})
