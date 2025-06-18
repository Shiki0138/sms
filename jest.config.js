module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/backend/src'],
  testMatch: [
    '**/tests/**/*.test.(ts|js)',
    '**/__tests__/**/*.test.(ts|js)',
    '**/?(*.)+(spec|test).(ts|js)'
  ],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        strict: true
      }
    }]
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/test/**/*',
    '!**/tests/**/*',
    '!backend/src/server.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/backend/src/$1'
  }
};