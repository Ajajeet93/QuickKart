import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),

  // ── Vite config files — need Node.js globals ─────────────────────────────
  {
    files: ['vite.config.js', 'vite.config.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // ── React source files ────────────────────────────────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Unused vars — warn only, ignore underscore-prefixed and uppercase
      'no-unused-vars': ['warn', {
        varsIgnorePattern: '^[A-Z_]|^_',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],

      // These react-hooks rules are too strict for valid patterns in this codebase
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity':              'off',
      'react-hooks/exhaustive-deps':     'warn',
    },
  },
])
