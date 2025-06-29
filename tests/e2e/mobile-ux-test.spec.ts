import { test, expect, Page } from '@playwright/test';

interface UIIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  element?: string;
  recommendation: string;
}

const uiIssues: UIIssue[] = [];

// 主要なモバイルデバイスのビューポート
const mobileDevices = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 14 Pro': { width: 393, height: 852 },
  'Pixel 5': { width: 393, height: 851 },
  'Galaxy S21': { width: 360, height: 800 }
};

test.describe('スマホユーザー向けUX/UIチェック', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // iPhone 12サイズをデフォルトに設定
    await page.setViewportSize(mobileDevices['iPhone 12']);
    await page.goto('http://localhost:4003');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('モバイル表示崩れチェック', async () => {
    console.log('=== モバイル表示崩れチェック開始 ===');
    
    // 横スクロールのチェック
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    if (documentWidth > viewportWidth) {
      uiIssues.push({
        category: '表示崩れ',
        severity: 'critical',
        description: '横スクロールが発生しています',
        recommendation: 'コンテンツ幅を100vw以内に収める'
      });
      console.log('❌ 横スクロール発生: ' + (documentWidth - viewportWidth) + 'px オーバー');
    } else {
      console.log('✅ 横スクロールなし');
    }
    
    // テキストの読みやすさチェック
    const textElements = await page.locator('p, span, div').all();
    let smallTextCount = 0;
    
    for (let i = 0; i < Math.min(textElements.length, 10); i++) {
      const fontSize = await textElements[i].evaluate(el => 
        parseInt(window.getComputedStyle(el).fontSize)
      );
      
      if (fontSize < 14) {
        smallTextCount++;
      }
    }
    
    if (smallTextCount > 0) {
      uiIssues.push({
        category: '可読性',
        severity: 'high',
        description: `${smallTextCount}個の要素で文字が小さすぎます（14px未満）`,
        recommendation: 'モバイルでは最小フォントサイズを14px以上に設定'
      });
    }
    
    // 要素の重なりチェック
    const overlappingElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let overlaps = 0;
      
      for (let i = 0; i < elements.length - 1; i++) {
        const rect1 = elements[i].getBoundingClientRect();
        const rect2 = elements[i + 1].getBoundingClientRect();
        
        if (rect1.right > rect2.left && 
            rect1.left < rect2.right && 
            rect1.bottom > rect2.top && 
            rect1.top < rect2.bottom) {
          overlaps++;
        }
      }
      return overlaps;
    });
    
    if (overlappingElements > 0) {
      uiIssues.push({
        category: '表示崩れ',
        severity: 'high',
        description: '要素の重なりが検出されました',
        recommendation: 'z-indexやpositionの見直し'
      });
    }
  });

  test('タッチターゲットサイズチェック', async () => {
    console.log('\n=== タッチターゲットサイズチェック ===');
    
    // ボタンとクリック可能要素のサイズチェック
    const clickableElements = await page.locator('button, a, input, [role="button"], [onclick]').all();
    let smallTargets = 0;
    
    for (const element of clickableElements) {
      const box = await element.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        smallTargets++;
        const text = await element.textContent() || 'Unknown';
        console.log(`⚠️ タッチターゲットが小さい: "${text}" (${box.width}x${box.height}px)`);
      }
    }
    
    if (smallTargets > 0) {
      uiIssues.push({
        category: 'タッチ操作',
        severity: 'critical',
        description: `${smallTargets}個のタッチターゲットが推奨サイズ（44x44px）未満です`,
        recommendation: 'タッチターゲットは最小44x44pxに設定'
      });
    }
    
    // タッチターゲット間の間隔チェック
    const targetSpacing = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, a, input');
      let closeTargets = 0;
      
      for (let i = 0; i < buttons.length - 1; i++) {
        const rect1 = buttons[i].getBoundingClientRect();
        const rect2 = buttons[i + 1].getBoundingClientRect();
        
        const distance = Math.min(
          Math.abs(rect1.right - rect2.left),
          Math.abs(rect1.bottom - rect2.top)
        );
        
        if (distance < 8) closeTargets++;
      }
      return closeTargets;
    });
    
    if (targetSpacing > 0) {
      uiIssues.push({
        category: 'タッチ操作',
        severity: 'high',
        description: 'タッチターゲット間の間隔が狭すぎます',
        recommendation: 'タッチターゲット間は最低8pxの間隔を確保'
      });
    }
  });

  test('フォーム要素のモバイル最適化チェック', async () => {
    console.log('\n=== フォーム要素チェック ===');
    
    // 入力フィールドのチェック
    const inputs = await page.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const inputType = await input.getAttribute('type');
      const inputMode = await input.getAttribute('inputmode');
      const autocomplete = await input.getAttribute('autocomplete');
      
      // 適切な入力タイプのチェック
      if (!inputType || inputType === 'text') {
        const placeholder = await input.getAttribute('placeholder') || '';
        
        if (placeholder.includes('メール') || placeholder.includes('email')) {
          uiIssues.push({
            category: 'フォーム',
            severity: 'medium',
            description: 'メールフィールドに適切なtype属性が設定されていません',
            element: placeholder,
            recommendation: 'type="email"を設定'
          });
        }
        
        if (placeholder.includes('電話') || placeholder.includes('tel')) {
          uiIssues.push({
            category: 'フォーム',
            severity: 'medium',
            description: '電話番号フィールドに適切なtype属性が設定されていません',
            element: placeholder,
            recommendation: 'type="tel"を設定'
          });
        }
      }
      
      // フォームフィールドの高さチェック
      const height = await input.evaluate(el => el.offsetHeight);
      if (height < 44) {
        uiIssues.push({
          category: 'フォーム',
          severity: 'high',
          description: `入力フィールドの高さが低すぎます（${height}px）`,
          recommendation: '最小高さ44pxを確保'
        });
      }
    }
  });

  test('ナビゲーションとスクロールチェック', async () => {
    console.log('\n=== ナビゲーション・スクロールチェック ===');
    
    // スクロール時のナビゲーション固定チェック
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    const fixedElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const fixed = [];
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          fixed.push({
            tag: el.tagName,
            class: el.className
          });
        }
      });
      
      return fixed;
    });
    
    if (fixedElements.length === 0) {
      uiIssues.push({
        category: 'ナビゲーション',
        severity: 'medium',
        description: '固定ナビゲーションが設定されていません',
        recommendation: 'モバイルでは固定ヘッダー/フッターナビゲーションを推奨'
      });
    }
    
    // スクロールのスムーズさチェック
    const hasSmootScroll = await page.evaluate(() => {
      const html = document.documentElement;
      const style = window.getComputedStyle(html);
      return style.scrollBehavior === 'smooth';
    });
    
    if (!hasSmootScroll) {
      uiIssues.push({
        category: 'UX',
        severity: 'low',
        description: 'スムーズスクロールが設定されていません',
        recommendation: 'scroll-behavior: smoothを設定'
      });
    }
  });

  test('パフォーマンスとレスポンシブチェック', async () => {
    console.log('\n=== パフォーマンスチェック ===');
    
    // 画像の最適化チェック
    const images = await page.locator('img').all();
    for (const img of images) {
      const src = await img.getAttribute('src');
      const loading = await img.getAttribute('loading');
      
      if (!loading || loading !== 'lazy') {
        uiIssues.push({
          category: 'パフォーマンス',
          severity: 'medium',
          description: '画像の遅延読み込みが設定されていません',
          element: src || 'Unknown image',
          recommendation: 'loading="lazy"を設定'
        });
      }
    }
    
    // ビューポートメタタグのチェック
    const viewportMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="viewport"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    if (!viewportMeta || !viewportMeta.includes('width=device-width')) {
      uiIssues.push({
        category: 'レスポンシブ',
        severity: 'critical',
        description: '適切なviewportメタタグが設定されていません',
        recommendation: '<meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    }
  });

  test('色コントラストとアクセシビリティ', async () => {
    console.log('\n=== アクセシビリティチェック ===');
    
    // タップハイライトの確認
    const tapHighlight = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return style.webkitTapHighlightColor;
    });
    
    if (!tapHighlight || tapHighlight === 'rgba(0, 0, 0, 0)') {
      uiIssues.push({
        category: 'UX',
        severity: 'low',
        description: 'タップハイライトが無効化されています',
        recommendation: 'タップフィードバックのための適切なハイライト色を設定'
      });
    }
  });

  test.afterAll(async () => {
    console.log('\n=== モバイルUI問題点サマリー ===');
    console.log(`検出された問題: ${uiIssues.length}件\n`);
    
    // 重要度別に分類
    const critical = uiIssues.filter(i => i.severity === 'critical');
    const high = uiIssues.filter(i => i.severity === 'high');
    const medium = uiIssues.filter(i => i.severity === 'medium');
    const low = uiIssues.filter(i => i.severity === 'low');
    
    if (critical.length > 0) {
      console.log('🔴 重大な問題:');
      critical.forEach(issue => {
        console.log(`  - [${issue.category}] ${issue.description}`);
        console.log(`    → 推奨: ${issue.recommendation}`);
      });
    }
    
    if (high.length > 0) {
      console.log('\n🟠 重要な問題:');
      high.forEach(issue => {
        console.log(`  - [${issue.category}] ${issue.description}`);
        console.log(`    → 推奨: ${issue.recommendation}`);
      });
    }
    
    if (medium.length > 0) {
      console.log('\n🟡 中程度の問題:');
      medium.forEach(issue => {
        console.log(`  - [${issue.category}] ${issue.description}`);
        console.log(`    → 推奨: ${issue.recommendation}`);
      });
    }
    
    if (low.length > 0) {
      console.log('\n🟢 軽微な問題:');
      low.forEach(issue => {
        console.log(`  - [${issue.category}] ${issue.description}`);
        console.log(`    → 推奨: ${issue.recommendation}`);
      });
    }
    
    // スクリーンショットを保存
    await page.screenshot({ 
      path: 'test-results/mobile-ui-issues.png', 
      fullPage: true 
    });
  });
});