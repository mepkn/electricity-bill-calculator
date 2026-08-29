import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // src/components/ui and src/hooks/use-mobile.ts are vendored shadcn/ui code.
  // They ship with react-refresh and set-state-in-effect violations that are
  // upstream's to fix, and rewriting them would be undone by the next
  // `shadcn add`. Lint covers the code we actually own.
  globalIgnores(['dist', 'src/components/ui/**', 'src/hooks/use-mobile.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
