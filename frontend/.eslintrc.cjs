module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // TypeScript での any 使用を許可
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    
    // 未使用の変数を警告
    'no-unused-vars': 'off',
    
    // console.log を許可
    'no-console': 'off',
    
    // 空の関数を許可
    'no-empty-function': 'off',
    
    // undefined変数の使用を警告
    'no-undef': 'off', // TypeScriptが処理
    
    // 重複定義を許可 (TypeScriptで管理)
    'no-redeclare': 'off',
    
    // case文での宣言を許可
    'no-case-declarations': 'off',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    'vite.config.ts',
    'src/@types/',
  ],
};