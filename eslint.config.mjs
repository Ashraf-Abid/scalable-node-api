// ESLint "flat config" — see https://typescript-eslint.io/getting-started
//
// This file is .mjs (not .js) so Node loads it as ESM regardless of the
// project's own CommonJS module setting (see tsconfig.json / package.json).
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Must stay last: turns off any ESLint stylistic rules that would
  // conflict with Prettier, so the two tools never fight over formatting.
  prettierConfig,
);
