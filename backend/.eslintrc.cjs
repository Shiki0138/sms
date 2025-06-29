module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    // エラーを警告に緩和
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'warn',
    'no-var': 'warn',
    'no-console': 'off', // サーバーサイドではconsoleを許可
    
    // 許可するルール
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-namespace': 'off', // Express型拡張で必要
    '@typescript-eslint/no-var-requires': 'off', // Node.js require文を許可
    'no-useless-escape': 'off', // 正規表現でのエスケープを許可
    '@typescript-eslint/ban-types': 'off', // Function型などを許可
    'no-case-declarations': 'off', // case文でのlet/const宣言を許可
    'no-prototype-builtins': 'off', // hasOwnProperty使用を許可
  },
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'coverage/',
    '*.min.js',
    '*.d.ts',
    '.eslintrc.cjs'
  ]
}