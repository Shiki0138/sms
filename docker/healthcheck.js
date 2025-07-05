#!/usr/bin/env node
/**
 * 🩺 美容室統合管理システム - ヘルスチェック
 */

const http = require('http');

// ヘルスチェック設定
const HEALTH_CHECK_CONFIG = {
  backend: {
    host: 'localhost',
    port: 4002,
    path: '/health',
    timeout: 5000
  },
  frontend: {
    host: 'localhost', 
    port: 80,
    path: '/health',
    timeout: 5000
  }
};

/**
 * HTTPヘルスチェック実行
 */
function checkHealth(config) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: config.host,
      port: config.port,
      path: config.path,
      method: 'GET',
      timeout: config.timeout
    }, (res) => {
      if (res.statusCode === 200) {
        resolve({ service: `${config.host}:${config.port}`, status: 'healthy' });
      } else {
        reject(new Error(`Health check failed: ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(new Error(`Health check error: ${err.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.end();
  });
}

/**
 * メインヘルスチェック
 */
async function main() {
  try {
    console.log('🩺 美容室システム ヘルスチェック開始...');
    
    // バックエンドヘルスチェック
    const backendHealth = await checkHealth(HEALTH_CHECK_CONFIG.backend);
    console.log('✅ バックエンド:', backendHealth.status);
    
    // フロントエンドヘルスチェック  
    const frontendHealth = await checkHealth(HEALTH_CHECK_CONFIG.frontend);
    console.log('✅ フロントエンド:', frontendHealth.status);
    
    console.log('🎉 システム正常稼働中');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ヘルスチェック失敗:', error.message);
    process.exit(1);
  }
}

// 実行
if (require.main === module) {
  main();
}

module.exports = { checkHealth };