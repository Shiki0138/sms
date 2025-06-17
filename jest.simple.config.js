module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/tests/**/*.simple.test.(ts|js)',
    '**/tests/**/*.basic.test.(ts|js)'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  // 複雑な設定を除外して基本機能のみ
  collectCoverageFrom: [
    'tests/**/*.ts'
  ]
};