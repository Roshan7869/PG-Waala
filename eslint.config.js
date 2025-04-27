import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tsEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      sourceType: 'module',
    },
    plugins: {
      'react-hooks': reactHooks,
      '@typescript-eslint': tsEslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsEslint.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]; 