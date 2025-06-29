import { test, expect, Page } from '@playwright/test';

test.describe('フロントエンド単体テスト', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test('フロントエンドサーバーのレスポンス確認', async () => {
    // フロントエンドサーバーに直接アクセス
    const response = await page.goto('http://localhost:4003');
    
    // HTTPステータスコードの確認
    expect(response?.status()).toBe(200);
    console.log('✓ フロントエンドサーバーが正常にレスポンスしています');
    
    // HTMLが返されることを確認
    const content = await page.content();
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<html');
    console.log('✓ 正常なHTMLドキュメントが返されています');
  });

  test('React アプリケーションの読み込み確認', async () => {
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    
    // React Rootの存在確認
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();
    console.log('✓ React Rootが見つかりました');
    
    // アプリケーションが空でないことを確認
    const rootContent = await reactRoot.innerHTML();
    expect(rootContent.length).toBeGreaterThan(0);
    console.log('✓ React アプリケーションがレンダリングされています');
  });

  test('基本的なUI要素の存在確認', async () => {
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // アプリの初期化を待つ
    
    // 基本的なHTML要素の確認
    const elementsToCheck = [
      { selector: 'button', name: 'ボタン' },
      { selector: 'input', name: '入力フィールド' },
      { selector: 'div', name: 'divエレメント' },
      { selector: 'form', name: 'フォーム' },
      { selector: 'a', name: 'リンク' }
    ];
    
    for (const element of elementsToCheck) {
      const count = await page.locator(element.selector).count();
      if (count > 0) {
        console.log(`✓ ${element.name}: ${count}個`);
      } else {
        console.log(`⚠ ${element.name}: 見つかりませんでした`);
      }
    }
  });

  test('JavaScript エラーの監視', async () => {
    const jsErrors: string[] = [];
    const networkErrors: string[] = [];
    
    // JavaScriptコンソールエラーをキャッチ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    // ネットワークエラーをキャッチ
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // エラーの発生を待つ
    
    console.log('=== JavaScript エラー ===');
    if (jsErrors.length === 0) {
      console.log('✓ JavaScript エラーはありません');
    } else {
      jsErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('=== ネットワークエラー ===');
    if (networkErrors.length === 0) {
      console.log('✓ ネットワークエラーはありません（バックエンド接続を除く）');
    } else {
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
  });

  test('ページのスクリーンショット撮影', async () => {
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // デスクトップビューのスクリーンショット
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({ 
      path: 'test-results/frontend-desktop.png', 
      fullPage: true 
    });
    console.log('✓ デスクトップビューのスクリーンショットを保存しました');
    
    // モバイルビューのスクリーンショット
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: 'test-results/frontend-mobile.png', 
      fullPage: true 
    });
    console.log('✓ モバイルビューのスクリーンショットを保存しました');
  });

  test('ページ読み込みパフォーマンス', async () => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('domcontentloaded');
    
    const domLoadTime = Date.now() - startTime;
    console.log(`DOM読み込み時間: ${domLoadTime}ms`);
    
    await page.waitForLoadState('networkidle');
    const totalLoadTime = Date.now() - startTime;
    console.log(`総読み込み時間: ${totalLoadTime}ms`);
    
    if (totalLoadTime < 5000) {
      console.log('✓ ページ読み込み速度は良好です');
    } else {
      console.log('⚠ ページ読み込みが遅いです');
    }
  });
});