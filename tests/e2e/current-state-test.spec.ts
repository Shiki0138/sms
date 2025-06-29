import { test, expect, Page } from '@playwright/test';

interface TestResults {
  page: string;
  passed: number;
  failed: number;
  errors: string[];
}

const results: TestResults[] = [];

test.describe('現在の状態での全ページ機能テスト', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // アプリケーションの初期化を待つ
  });

  // 現在表示されているページの機能テスト
  test('現在表示されているページの基本機能', async () => {
    const pageResult: TestResults = { page: '現在のページ', passed: 0, failed: 0, errors: [] };
    
    try {
      // ページが正常に読み込まれていることを確認
      await testElementExists(page, 'body', 'ページ本体', pageResult);
      await testElementExists(page, '#root', 'React Root', pageResult);
      
      // 基本的なUI要素の確認
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input').count();
      const forms = await page.locator('form').count();
      
      console.log(`ボタン数: ${buttons}`);
      console.log(`入力フィールド数: ${inputs}`);
      console.log(`フォーム数: ${forms}`);
      
      if (buttons > 0) pageResult.passed++;
      if (inputs > 0) pageResult.passed++;
      if (forms > 0) pageResult.passed++;
      
    } catch (error) {
      pageResult.errors.push(`基本機能テストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // ナビゲーション要素のテスト
  test('ナビゲーション要素の確認', async () => {
    const pageResult: TestResults = { page: 'ナビゲーション', passed: 0, failed: 0, errors: [] };
    
    try {
      // 一般的なナビゲーション要素の確認
      const navSelectors = [
        'nav',
        '[role="navigation"]',
        '.navbar',
        '.nav-menu',
        '.sidebar',
        'header',
        '.menu',
        '[data-testid*="nav"]',
        '[class*="nav"]'
      ];
      
      let foundNavElements = 0;
      for (const selector of navSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✓ ナビゲーション要素発見: ${selector} (${count}個)`);
          pageResult.passed++;
          foundNavElements++;
        }
      }
      
      if (foundNavElements === 0) {
        pageResult.errors.push('ナビゲーション要素が見つかりませんでした');
        pageResult.failed++;
      }
      
    } catch (error) {
      pageResult.errors.push(`ナビゲーションテストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // インタラクティブ要素のテスト
  test('インタラクティブ要素の動作確認', async () => {
    const pageResult: TestResults = { page: 'インタラクティブ要素', passed: 0, failed: 0, errors: [] };
    
    try {
      // クリック可能な要素の確認
      const clickableElements = await page.locator('button, a, [role="button"], [onclick]').all();
      
      for (let i = 0; i < Math.min(clickableElements.length, 5); i++) { // 最初の5個をテスト
        const element = clickableElements[i];
        try {
          await expect(element).toBeVisible();
          await expect(element).toBeEnabled();
          console.log(`✓ クリック可能要素 ${i + 1}: 正常`);
          pageResult.passed++;
        } catch (error) {
          console.log(`✗ クリック可能要素 ${i + 1}: エラー`);
          pageResult.failed++;
        }
      }
      
      // 入力フィールドの確認
      const inputElements = await page.locator('input, textarea, select').all();
      
      for (let i = 0; i < Math.min(inputElements.length, 3); i++) { // 最初の3個をテスト
        const element = inputElements[i];
        try {
          await expect(element).toBeVisible();
          console.log(`✓ 入力要素 ${i + 1}: 正常`);
          pageResult.passed++;
        } catch (error) {
          console.log(`✗ 入力要素 ${i + 1}: エラー`);
          pageResult.failed++;
        }
      }
      
    } catch (error) {
      pageResult.errors.push(`インタラクティブ要素テストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // 表示コンテンツの確認
  test('表示コンテンツの確認', async () => {
    const pageResult: TestResults = { page: '表示コンテンツ', passed: 0, failed: 0, errors: [] };
    
    try {
      // テキストコンテンツの確認
      const textContent = await page.textContent('body');
      if (textContent && textContent.length > 50) {
        console.log('✓ 十分なテキストコンテンツが表示されています');
        pageResult.passed++;
      } else {
        pageResult.errors.push('テキストコンテンツが不足しています');
        pageResult.failed++;
      }
      
      // 画像の確認
      const images = await page.locator('img').count();
      if (images > 0) {
        console.log(`✓ 画像が ${images} 個表示されています`);
        pageResult.passed++;
      }
      
      // 見出しの確認
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      if (headings > 0) {
        console.log(`✓ 見出しが ${headings} 個表示されています`);
        pageResult.passed++;
      }
      
    } catch (error) {
      pageResult.errors.push(`表示コンテンツテストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // レスポンシブ対応の確認
  test('レスポンシブ対応の確認', async () => {
    const pageResult: TestResults = { page: 'レスポンシブ対応', passed: 0, failed: 0, errors: [] };
    
    try {
      // デスクトップサイズ
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);
      const desktopContent = await page.textContent('body');
      if (desktopContent && desktopContent.length > 0) {
        console.log('✓ デスクトップサイズで正常表示');
        pageResult.passed++;
      }
      
      // タブレットサイズ
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      const tabletContent = await page.textContent('body');
      if (tabletContent && tabletContent.length > 0) {
        console.log('✓ タブレットサイズで正常表示');
        pageResult.passed++;
      }
      
      // モバイルサイズ
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      const mobileContent = await page.textContent('body');
      if (mobileContent && mobileContent.length > 0) {
        console.log('✓ モバイルサイズで正常表示');
        pageResult.passed++;
      }
      
    } catch (error) {
      pageResult.errors.push(`レスポンシブテストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // アクセシビリティ基本チェック
  test('アクセシビリティ基本チェック', async () => {
    const pageResult: TestResults = { page: 'アクセシビリティ', passed: 0, failed: 0, errors: [] };
    
    try {
      // タイトルの確認
      const title = await page.title();
      if (title && title.length > 0) {
        console.log(`✓ ページタイトル: ${title}`);
        pageResult.passed++;
      }
      
      // 言語属性の確認
      const htmlLang = await page.getAttribute('html', 'lang');
      if (htmlLang) {
        console.log(`✓ 言語属性: ${htmlLang}`);
        pageResult.passed++;
      }
      
      // aria-label属性を持つ要素の確認
      const ariaLabeled = await page.locator('[aria-label]').count();
      if (ariaLabeled > 0) {
        console.log(`✓ aria-label属性付き要素: ${ariaLabeled}個`);
        pageResult.passed++;
      }
      
    } catch (error) {
      pageResult.errors.push(`アクセシビリティテストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // パフォーマンス確認
  test('パフォーマンス確認', async () => {
    const pageResult: TestResults = { page: 'パフォーマンス', passed: 0, failed: 0, errors: [] };
    
    try {
      const startTime = Date.now();
      
      await page.goto('http://localhost:4003');
      await page.waitForLoadState('domcontentloaded');
      const domLoadTime = Date.now() - startTime;
      
      await page.waitForLoadState('networkidle');
      const totalLoadTime = Date.now() - startTime;
      
      console.log(`DOM読み込み時間: ${domLoadTime}ms`);
      console.log(`総読み込み時間: ${totalLoadTime}ms`);
      
      if (domLoadTime < 2000) {
        pageResult.passed++;
        console.log('✓ DOM読み込み速度は良好');
      }
      
      if (totalLoadTime < 5000) {
        pageResult.passed++;
        console.log('✓ 総読み込み速度は良好');
      }
      
    } catch (error) {
      pageResult.errors.push(`パフォーマンステストエラー: ${error}`);
      pageResult.failed++;
    }
    
    results.push(pageResult);
  });

  // テスト結果レポート生成
  test.afterAll(async () => {
    console.log('\n=== 修正後の全ページ機能テスト結果 ===');
    let totalPassed = 0;
    let totalFailed = 0;
    
    results.forEach(result => {
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      console.log(`\n[${result.page}]`);
      console.log(`  成功: ${result.passed}, 失敗: ${result.failed}`);
      
      if (result.errors.length > 0) {
        console.log('  エラー詳細:');
        result.errors.forEach(error => {
          console.log(`    - ${error}`);
        });
      }
    });
    
    console.log(`\n=== 総合結果 ===`);
    console.log(`成功: ${totalPassed}, 失敗: ${totalFailed}`);
    const successRate = totalPassed + totalFailed > 0 ? ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1) : '0';
    console.log(`成功率: ${successRate}%`);
  });
});

// ヘルパー関数
async function testElementExists(page: Page, selector: string, elementName: string, result: TestResults) {
  try {
    await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
    result.passed++;
    console.log(`✓ ${elementName} - 表示確認`);
  } catch (error) {
    result.failed++;
    result.errors.push(`${elementName} - 表示されません`);
    console.log(`✗ ${elementName} - 表示されません`);
  }
}