import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 E2Eテストのグローバルクリーンアップを開始します...');

  try {
    // テストデータのクリーンアップ
    console.log('🗑️ テストデータをクリーンアップしています...');
    await cleanupTestData();
    console.log('✅ テストデータのクリーンアップが完了しました');

    // 一時ファイルの削除
    console.log('📁 一時ファイルを削除しています...');
    await cleanupTempFiles();
    console.log('✅ 一時ファイルの削除が完了しました');

    // テストレポートの生成
    console.log('📊 テストレポートを生成しています...');
    await generateTestReport();
    console.log('✅ テストレポートの生成が完了しました');

  } catch (error) {
    console.error('❌ グローバルクリーンアップでエラーが発生しました:', error);
    // エラーが発生してもプロセスは継続
  }

  console.log('🎯 グローバルクリーンアップが完了しました');
}

async function cleanupTestData() {
  try {
    const response = await fetch('http://localhost:4002/api/v1/test/cleanup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'cleanup',
        testSuite: 'e2e'
      })
    });

    if (!response.ok) {
      console.warn('⚠️ テストデータのクリーンアップ API呼び出しに失敗しました');
    }
  } catch (error) {
    console.warn('⚠️ テストデータのクリーンアップでエラーが発生しました:', error.message);
  }
}

async function cleanupTempFiles() {
  const tempFiles = [
    'tests/config/auth-state.json',
    'tests/temp',
    'test-results/temp'
  ];

  for (const filePath of tempFiles) {
    try {
      const fullPath = path.resolve(filePath);
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        console.log(`🗑️ 削除: ${filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️ ファイル削除に失敗: ${filePath}`, error.message);
    }
  }
}

async function generateTestReport() {
  try {
    const testResultsDir = 'test-results';
    const reportSummary = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: !!process.env.CI
      },
      testSuite: '美容室統合管理システム E2E テスト',
      summary: await collectTestSummary()
    };

    // レポート概要をJSONファイルとして保存
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(testResultsDir, 'test-summary.json'),
      JSON.stringify(reportSummary, null, 2)
    );

    console.log('📋 テスト概要レポートを保存しました: test-results/test-summary.json');

  } catch (error) {
    console.warn('⚠️ テストレポートの生成に失敗しました:', error.message);
  }
}

async function collectTestSummary() {
  try {
    const resultsFile = 'test-results/results.json';
    if (fs.existsSync(resultsFile)) {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      
      return {
        totalTests: results.stats?.expected || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        status: results.stats?.failed > 0 ? 'FAILED' : 'PASSED'
      };
    }
  } catch (error) {
    console.warn('⚠️ テスト結果の収集に失敗しました:', error.message);
  }

  return {
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    status: 'UNKNOWN'
  };
}

export default globalTeardown;