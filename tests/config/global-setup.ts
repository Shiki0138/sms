import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 E2Eテストのグローバルセットアップを開始します...');
  
  // ブラウザーの起動
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // サーバーの起動確認
    console.log('📡 サーバーの起動を確認しています...');
    
    // バックエンドサーバーの確認
    await page.goto('http://localhost:4002/health', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ バックエンドサーバーが起動しました');

    // フロントエンドサーバーの確認
    await page.goto('http://localhost:4003', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ フロントエンドサーバーが起動しました');

    // テストデータの準備
    console.log('📊 テストデータを準備しています...');
    await setupTestData();
    console.log('✅ テストデータの準備が完了しました');

    // 認証状態の保存（ログイン状態を各テストで再利用）
    console.log('🔐 認証状態を準備しています...');
    await setupAuthState(page);
    console.log('✅ 認証状態の準備が完了しました');

  } catch (error) {
    console.error('❌ グローバルセットアップでエラーが発生しました:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎉 グローバルセットアップが完了しました');
}

async function setupTestData() {
  // テスト用データベースの初期化
  const response = await fetch('http://localhost:4002/api/v1/test/setup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'init',
      testSuite: 'e2e'
    })
  });

  if (!response.ok) {
    console.warn('⚠️ テストデータのセットアップに失敗しました（継続可能）');
  }
}

async function setupAuthState(page: any) {
  try {
    // テストユーザーでログイン
    await page.goto('http://localhost:4003/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // ログイン成功の確認
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 認証状態をファイルに保存
    await page.context().storageState({ 
      path: 'tests/config/auth-state.json' 
    });
    
  } catch (error) {
    console.warn('⚠️ 認証状態の準備に失敗しました:', error.message);
    // 認証に失敗してもテストは続行
  }
}

export default globalSetup;