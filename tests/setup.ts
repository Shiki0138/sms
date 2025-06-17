import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// グローバルテストセットアップ
beforeAll(async () => {
  // テスト環境の初期化
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.DATABASE_URL = 'file:./test.db';
  
  console.log('🧪 テスト環境を初期化しています...');
});

afterAll(async () => {
  // テスト環境のクリーンアップ
  console.log('🧹 テスト環境をクリーンアップしています...');
});

// グローバルモック設定
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn()
  }
}));

// プロセス終了ハンドラーのモック
const originalProcess = process;
jest.mock('process', () => ({
  ...originalProcess,
  on: jest.fn(),
  exit: jest.fn()
}));

// タイムゾーン設定
process.env.TZ = 'Asia/Tokyo';

// テストタイムアウト設定
jest.setTimeout(30000);

// 未処理のPromise拒否をキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

export default {};