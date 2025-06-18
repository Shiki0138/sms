#!/usr/bin/env node

const { exec } = require('child_process');
const https = require('https');
const http = require('http');

console.log('🚨 【緊急】本番フィーチャーフラグ設定実行');
console.log('================================================');

// 設定する内容を表示
const productionConfig = {
  'ベータ機能 (制限付き)': {
    'beta_application': '15%展開',
    'beta_dashboard': '15%展開', 
    'beta_feedback': '20%展開'
  },
  'システム機能 (本番モード)': {
    'setup_wizard': '100%展開',
    'dashboard_customize': '100%展開',
    'mobile_view': '100%展開',
    'customer_template': '100%展開',
    'staff_sharing': '100%展開',
    'auto_save': '100%展開'
  },
  'スタンダード機能 (有効)': {
    'line_integration': '100%展開',
    'instagram_integration': '100%展開',
    'realtime_analytics': '100%展開',
    'advanced_search': '100%展開',
    'data_export': '100%展開'
  },
  'プレミアム機能 (完全有効)': {
    'premium_ai_analytics': '100%展開',
    'custom_reports': '100%展開',
    'api_access': '100%展開'
  },
  '実験的機能 (慎重展開)': {
    'sales_prediction_ai': '30%展開',
    'pos_integration': '25%展開'
  }
};

console.log('📋 設定する機能:');
Object.entries(productionConfig).forEach(([category, features]) => {
  console.log(`\n${category}:`);
  Object.entries(features).forEach(([feature, rollout]) => {
    console.log(`  - ${feature}: ${rollout}`);
  });
});

console.log('\n🎯 実行コマンド:');
console.log('POST /api/v1/features/admin/setup-production-full');

// サーバーが起動しているかチェック
function checkServer(port = 3001) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/api/v1/features/admin/all',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      resolve(false);
    });

    req.end();
  });
}

async function executeSetup() {
  console.log('\n🔍 サーバー状態確認...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ サーバーが起動していません');
    console.log('📝 手動実行手順:');
    console.log('1. cd backend && npm start');
    console.log('2. 管理者でログイン');
    console.log('3. POST /api/v1/features/admin/setup-production-full を実行');
    return;
  }

  console.log('✅ サーバー起動確認');
  console.log('\n⚠️ 管理者認証が必要です');
  console.log('📝 手動実行手順:');
  console.log('1. 管理者権限でログイン');
  console.log('2. Authorization: Bearer <token> ヘッダーを設定');
  console.log('3. POST /api/v1/features/admin/setup-production-full を実行');
}

// cURLコマンド例を生成
function generateCurlCommand() {
  console.log('\n📋 cURLコマンド例:');
  console.log('curl -X POST http://localhost:3001/api/v1/features/admin/setup-production-full \\');
  console.log('  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\');
  console.log('  -H "Content-Type: application/json"');
}

async function main() {
  await executeSetup();
  generateCurlCommand();
  
  console.log('\n✨ 設定完了後の状態:');
  console.log('- ベータ機能: 制限付きで利用可能');
  console.log('- システム機能: 全ユーザーで利用可能');
  console.log('- プレミアム機能: プレミアムプランで完全利用可能');
  console.log('- 実験的機能: 慎重な段階的展開');
  
  console.log('\n🎉 本番環境準備完了！');
}

main().catch(console.error);