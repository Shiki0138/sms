import { test, expect, Page } from '@playwright/test';

test.describe('基本ページ機能チェック', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // テスト環境でのページアクセス
    await page.goto('http://localhost:4003');
    
    // コンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console Error:', msg.text());
      }
    });
    
    // ネットワークエラーをキャッチ
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`Network Error: ${response.status()} - ${response.url()}`);
      }
    });
  });

  test('フロントエンドの基本表示確認', async () => {
    // ページが読み込まれることを確認
    await page.waitForLoadState('networkidle');
    
    // ページタイトルが設定されていることを確認
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log('ページタイトル:', title);
    
    // 基本的なDOM要素の存在確認
    const body = await page.locator('body').isVisible();
    expect(body).toBe(true);
    
    // Reactアプリケーションが正しく読み込まれているか確認
    const reactRoot = await page.locator('#root').isVisible();
    if (reactRoot) {
      console.log('✓ React アプリケーションが正常に読み込まれています');
    }
    
    // メインコンテンツエリアの確認
    await page.waitForTimeout(3000); // アプリの初期化を待つ
    
    // ログインフォームまたはダッシュボードの存在確認
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasMainContent = await page.locator('main').count() > 0;
    const hasAppContainer = await page.locator('[class*="app"], [class*="container"]').count() > 0;
    
    if (hasLoginForm) {
      console.log('✓ ログインフォームが表示されています');
    } else if (hasMainContent || hasAppContainer) {
      console.log('✓ メインアプリケーションが表示されています');
    } else {
      console.log('⚠ フォームまたはメインコンテンツが見つかりません');
    }
    
    // スクリーンショットを撮影（デバッグ用）
    await page.screenshot({ path: 'test-results/basic-page-check.png', fullPage: true });
  });

  test('ナビゲーション要素の確認', async () => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 一般的なナビゲーション要素を探す
    const navigationElements = [
      'nav',
      '[role="navigation"]',
      '.navbar',
      '.nav',
      '.menu',
      '.sidebar',
      'header'
    ];
    
    let foundNavigation = false;
    for (const selector of navigationElements) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✓ ナビゲーション要素が見つかりました: ${selector} (${count}個)`);
        foundNavigation = true;
      }
    }
    
    if (!foundNavigation) {
      console.log('⚠ ナビゲーション要素が見つかりませんでした');
    }
  });

  test('フォーム要素の確認', async () => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // フォーム要素の確認
    const formCount = await page.locator('form').count();
    const inputCount = await page.locator('input').count();
    const buttonCount = await page.locator('button').count();
    
    console.log(`フォーム数: ${formCount}`);
    console.log(`入力フィールド数: ${inputCount}`);
    console.log(`ボタン数: ${buttonCount}`);
    
    if (formCount > 0 || inputCount > 0 || buttonCount > 0) {
      console.log('✓ インタラクティブ要素が存在します');
    }
    
    // 主要なボタンやリンクの確認
    const clickableElements = await page.locator('button, a, [role="button"]').count();
    console.log(`クリック可能な要素数: ${clickableElements}`);
  });

  test('レスポンシブ対応の基本確認', async () => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('✓ デスクトップサイズでのレンダリング完了');
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✓ タブレットサイズでのレンダリング完了');
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    console.log('✓ モバイルサイズでのレンダリング完了');
    
    // モバイルサイズでのスクリーンショット
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
  });

  test('コンソールエラーの収集', async () => {
    const consoleErrors: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // エラーの発生を待つ
    
    console.log('=== コンソールエラー ===');
    if (consoleErrors.length === 0) {
      console.log('✓ コンソールエラーはありません');
    } else {
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('=== ネットワークエラー ===');
    if (networkErrors.length === 0) {
      console.log('✓ ネットワークエラーはありません');
    } else {
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  });

  test('パフォーマンス基本チェック', async () => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`ページ読み込み時間: ${loadTime}ms`);
    
    if (loadTime < 5000) {
      console.log('✓ ページ読み込み時間は許容範囲内です');
    } else {
      console.log('⚠ ページ読み込み時間が長いです');
    }
  });
});