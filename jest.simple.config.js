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
  ],
  // メモリ最適化設定
  maxWorkers: 1,
  maxConcurrency: 1,
  workerIdleMemoryLimit: '512MB',
  // キャッシュを無効化してメモリ使用量を削減
  cache: false,
  // ts-jestの設定を最適化
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        esModuleInterop: true
      }
    }
  }
};