module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/backend/src', '<rootDir>/frontend/src'],
  testMatch: [
    '**/tests/**/*.test.(ts|js)',
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    'frontend/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/test/**/*',
    '!**/tests/**/*',
    '!backend/src/server.ts',
    '!frontend/src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/backend/src/$1',
    '^@frontend/(.*)$': '<rootDir>/frontend/src/$1'
  },
  testEnvironmentOptions: {
    globals: {
      'ts-jest': {
        useESM: true,
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    }
  }
};