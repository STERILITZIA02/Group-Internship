import { defineConfig } from 'eslint/config'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default defineConfig([
  { ignores: ['**/dist/**', '**/.vite/**'] },
  ...vue.configs['flat/essential'],
  { files: ['**/*.ts'], languageOptions: { parser: tsParser } },
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tsParser } },
    rules: {
      'vue/no-bare-strings-in-template': ['error', { allowlist: [] }],
      'vue/no-useless-mustaches': 'error',
    },
  },
  {
    files: ['packages/scene/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['vue', 'vue/*', 'vue-i18n', 'three', 'three/*', 'node:*', 'fastify'],
              message: 'Keep scene documents and commands platform independent.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/src/**/*.{vue,ts}'],
    ignores: ['apps/web/src/viewport/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['three', 'three/*'],
              message: 'Use the viewport boundary for Three.js operations.',
            },
          ],
        },
      ],
    },
  },
])
