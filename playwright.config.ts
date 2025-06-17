import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // テストディレクトリ
  testDir: './tests/e2e',
  
  // 並列実行設定
  fullyParallel: true,
  
  // CI環境でのワーカー数
  workers: process.env.CI ? 1 : undefined,
  
  // テスト失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,
  
  // レポーター設定
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  
  // 基本設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:4003',
    
    // タイムアウト設定
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // スクリーンショット設定
    screenshot: 'only-on-failure',
    
    // ビデオ録画設定
    video: 'retain-on-failure',
    
    // トレース設定
    trace: 'on-first-retry',
    
    // ロケール設定
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo'
  },

  // プロジェクト設定（複数ブラウザでのテスト）
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 日本語フォント設定
        extraHTTPHeaders: {
          'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
        }
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // モバイルテスト
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // タブレットテスト
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    }
  ],

  // ウェブサーバー設定（テスト実行前にサーバーを起動）
  webServer: [
    {
      command: 'cd backend && npm start',
      port: 4002,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd frontend && npm run dev',
      port: 4003,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    }
  ],

  // グローバルセットアップ・ティアダウン
  globalSetup: require.resolve('./tests/config/global-setup.ts'),
  globalTeardown: require.resolve('./tests/config/global-teardown.ts'),

  // 期待する設定
  expect: {
    // スクリーンショット比較の閾値
    threshold: 0.2,
    
    // アニメーション設定
    toHaveScreenshot: { 
      animations: 'disabled',
      mode: 'strict'
    },
    
    // 要素の表示待機時間
    toMatchAriaSnapshot: { timeout: 10000 }
  },

  // テストの並列実行制限
  maxFailures: process.env.CI ? 10 : undefined,
  
  // 出力ディレクトリ
  outputDir: 'test-results/',
  
  // テストデータディレクトリ
  testIgnore: [
    '**/test-data/**',
    '**/fixtures/**'
  ],

  // メタデータ
  metadata: {
    platform: process.platform,
    nodeVersion: process.version,
    testSuite: '美容室統合管理システム E2E テスト'
  }
});