import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'server-local.js', 'test-backend.js']),

  // ── Browser / React source ────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  // ── Node.js server / API files ────────────────────────────────────────────
  {
    files: ['api/**/*.js', 'server/**/*.js', 'server-local.js', 'test-backend.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // ── Vitest test files ─────────────────────────────────────────────────────
  {
    files: ['src/test/**/*.{js,jsx}', 'vitest.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
