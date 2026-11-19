import { onScopeDispose, shallowRef } from 'vue'
import type { ViewportPalette } from '../viewport/settings'

export function useTheme() {
  const root = document.documentElement
  const scheme = matchMedia('(prefers-color-scheme: dark)')
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  function read() {
    const style = getComputedStyle(root)
    const token = (name: string) => style.getPropertyValue(name).trim()
    if (themeColor) themeColor.content = token('--surface')
    return {
      ground: token('--viewport-ground'),
      grid: token('--viewport-grid'),
      object: token('--viewport-object'),
      selected: token('--viewport-selected'),
    } satisfies ViewportPalette
  }
  const palette = shallowRef(read())
  const sync = () => {
    palette.value = read()
  }
  const observer = new MutationObserver(sync)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
  scheme.addEventListener('change', sync)
  import.meta.hot?.on('vite:afterUpdate', sync)
  onScopeDispose(() => {
    observer.disconnect()
    scheme.removeEventListener('change', sync)
    import.meta.hot?.off('vite:afterUpdate', sync)
  })
  return palette
}
