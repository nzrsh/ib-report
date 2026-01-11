// eslint.config.mjs
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  // 1. Глобальные игноры
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.prisma/**',
      'coverage/**',
      '*.d.ts',
      'eslint.config.mjs',
    ],
  },

  // 2. Базовые рекомендованные правила
  eslint.configs.recommended,

  // 3. Все type-checked правила от typescript-eslint (но с послаблениями ниже)
  ...tseslint.configs.recommendedTypeChecked,

  // 4. Prettier в конце (чтобы перебивал всё оформительское)
  eslintPluginPrettierRecommended,

  // 5. Глобальные настройки языка
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true, // самый удобный режим в 2025
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 6. Тонкая настройка — «максимально полезно, минимально токсично»
  {
    rules: {
      // Полностью выключаем то, что в реальной жизни не нужно
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off', // ! разрешаем
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Самые важные правила — оставляем error, но можно warn, если совсем лень
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error', // очень спасает от упущенных ошибок
      '@typescript-eslint/no-misused-promises': 'error',

      // Остальные unsafe-правилы — warn вместо error (чтобы видеть, но не падало)
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      // Полезные мелочи
      'no-console': 'warn',
      'no-duplicate-imports': 'error',

      // Prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
