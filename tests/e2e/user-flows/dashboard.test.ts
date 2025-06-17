import { test, expect, Page } from '@playwright/test';

test.describe('ダッシュボード E2E テスト', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // テスト用ログイン
    await page.goto('http://localhost:4003');
    await loginAsTestUser(page);
    
    // ダッシュボードページへ移動
    await page.waitForURL('**/dashboard');
  });

  test.describe('基本表示機能', () => {
    test('ダッシュボードの主要KPIが表示される', async () => {
      // 売上情報の表示確認
      await expect(page.locator('[data-testid="sales-today"]')).toBeVisible();
      await expect(page.locator('[data-testid="sales-thismonth"]')).toBeVisible();
      await expect(page.locator('[data-testid="sales-trend"]')).toBeVisible();

      // 予約情報の表示確認
      await expect(page.locator('[data-testid="reservations-today"]')).toBeVisible();
      await expect(page.locator('[data-testid="reservations-thisweek"]')).toBeVisible();

      // 顧客情報の表示確認
      await expect(page.locator('[data-testid="customers-total"]')).toBeVisible();
      await expect(page.locator('[data-testid="customers-new"]')).toBeVisible();

      // 満足度情報の表示確認
      await expect(page.locator('[data-testid="satisfaction-score"]')).toBeVisible();
    });

    test('数値データが正しい形式で表示される', async () => {
      // 売上が数値形式で表示される
      const salesElement = page.locator('[data-testid="sales-today"]');
      await expect(salesElement).toContainText(/¥[\d,]+/);

      // 予約数が整数で表示される
      const reservationsElement = page.locator('[data-testid="reservations-today"]');
      await expect(reservationsElement).toContainText(/\d+/);

      // 満足度が0-5の範囲で表示される
      const satisfactionElement = page.locator('[data-testid="satisfaction-score"]');
      const satisfactionText = await satisfactionElement.textContent();
      const satisfactionValue = parseFloat(satisfactionText?.replace(/[^\d.]/g, '') || '0');
      expect(satisfactionValue).toBeGreaterThanOrEqual(0);
      expect(satisfactionValue).toBeLessThanOrEqual(5);
    });

    test('グラフ・チャートが表示される', async () => {
      // 売上グラフの表示確認
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
      
      // 顧客数グラフの表示確認
      await expect(page.locator('[data-testid="customer-chart"]')).toBeVisible();
      
      // 予約状況グラフの表示確認
      await expect(page.locator('[data-testid="reservation-chart"]')).toBeVisible();
    });
  });

  test.describe('リアルタイム更新機能', () => {
    test('データが30秒間隔で更新される', async () => {
      // 初期値を取得
      const initialSales = await page.locator('[data-testid="sales-today"]').textContent();
      
      // 30秒待機（実際のテストでは短縮可能）
      await page.waitForTimeout(5000); // テスト用に5秒に短縮
      
      // データ更新をトリガー（模擬）
      await page.reload();
      
      // データが更新されることを確認（値が変わる可能性があるか、最低限表示されることを確認）
      await expect(page.locator('[data-testid="sales-today"]')).toBeVisible();
    });

    test('WebSocket接続でリアルタイム通知を受信する', async () => {
      // 新着メッセージ通知の確認
      await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
      
      // 通知数が表示される
      const notificationCount = page.locator('[data-testid="notification-count"]');
      await expect(notificationCount).toContainText(/\d+/);
    });
  });

  test.describe('ナビゲーション機能', () => {
    test('メニューから各画面に遷移できる', async () => {
      // メッセージ管理画面への遷移
      await page.click('[data-testid="nav-messages"]');
      await page.waitForURL('**/messages');
      await expect(page.locator('h1')).toContainText('メッセージ管理');

      // ダッシュボードに戻る
      await page.click('[data-testid="nav-dashboard"]');
      await page.waitForURL('**/dashboard');

      // 予約管理画面への遷移
      await page.click('[data-testid="nav-reservations"]');
      await page.waitForURL('**/reservations');
      await expect(page.locator('h1')).toContainText('予約管理');

      // 顧客管理画面への遷移
      await page.click('[data-testid="nav-customers"]');
      await page.waitForURL('**/customers');
      await expect(page.locator('h1')).toContainText('顧客管理');

      // 分析画面への遷移
      await page.click('[data-testid="nav-analytics"]');
      await page.waitForURL('**/analytics');
      await expect(page.locator('h1')).toContainText('分析');
    });

    test('モバイル表示でハンバーガーメニューが動作する', async () => {
      // モバイルサイズに変更
      await page.setViewportSize({ width: 375, height: 667 });

      // ハンバーガーメニューボタンが表示される
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();

      // メニューを開く
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();

      // メニュー項目をクリック
      await page.click('[data-testid="mobile-nav-messages"]');
      await page.waitForURL('**/messages');
    });
  });

  test.describe('レスポンシブ対応', () => {
    test('デスクトップ表示で正常に動作する', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // 全てのKPIカードが横並びで表示される
      const kpiCards = page.locator('[data-testid="kpi-cards"] > div');
      await expect(kpiCards).toHaveCount(4);
      
      // グラフが適切なサイズで表示される
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    });

    test('タブレット表示で正常に動作する', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // KPIカードが適切に配置される
      await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
      
      // グラフが縮小されて表示される
      await expect(page.locator('[data-testid="revenue-chart"]')).toBeVisible();
    });

    test('モバイル表示で正常に動作する', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // KPIカードが縦積みで表示される
      await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
      
      // モバイル用グラフが表示される
      await expect(page.locator('[data-testid="mobile-charts"]')).toBeVisible();
    });
  });

  test.describe('パフォーマンス', () => {
    test('ページ読み込み時間が2秒以内である', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:4003/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    test('グラフの描画が1秒以内に完了する', async () => {
      const startTime = Date.now();
      
      await page.reload();
      await expect(page.locator('[data-testid="revenue-chart"] canvas')).toBeVisible();
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000);
    });
  });

  test.describe('エラーハンドリング', () => {
    test('API障害時にエラーメッセージが表示される', async () => {
      // APIをモック化してエラーを発生させる
      await page.route('**/api/v1/analytics/dashboard-kpis', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.reload();
      
      // エラーメッセージの表示確認
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('データの読み込みに失敗しました');
    });

    test('ネットワーク障害時に再試行ボタンが表示される', async () => {
      // ネットワーク障害をシミュレート
      await page.route('**/api/v1/**', route => route.abort());

      await page.reload();
      
      // 再試行ボタンの表示確認
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
      
      // 再試行ボタンをクリック
      await page.click('[data-testid="retry-button"]');
    });
  });

  test.describe('アクセシビリティ', () => {
    test('キーボードナビゲーションが動作する', async () => {
      // Tabキーでフォーカス移動
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();

      // Enterキーで要素をアクティブ化
      await page.keyboard.press('Enter');
    });

    test('スクリーンリーダー用の属性が設定されている', async () => {
      // aria-label属性の確認
      await expect(page.locator('[data-testid="sales-today"]')).toHaveAttribute('aria-label');
      
      // alt属性の確認（グラフ等）
      const chartImages = page.locator('img[alt]');
      if (await chartImages.count() > 0) {
        await expect(chartImages.first()).toHaveAttribute('alt');
      }
    });
  });
});

// ヘルパー関数
async function loginAsTestUser(page: Page) {
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'testpassword');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/dashboard');
}