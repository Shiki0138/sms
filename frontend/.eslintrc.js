module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'coverage'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // エラーを警告に緩和して継続的な開発を可能にする
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'react-refresh/only-export-components': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'no-console': 'off',
    
    // 許可するルール
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
}