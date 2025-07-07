#!/bin/bash

# 運用監視セットアップスクリプト

echo "🔍 運用監視環境のセットアップを開始します..."

# 1. ログディレクトリ作成
mkdir -p logs/{app,error,access,performance}

# 2. 監視設定ファイル作成
cat > monitoring/monitoring-config.json << EOF
{
  "monitoring": {
    "logRotation": {
      "maxSize": "100M",
      "maxFiles": 30,
      "compress": true
    },
    "alerts": {
      "errorThreshold": 10,
      "responseTimeThreshold": 3000,
      "memoryThreshold": 80,
      "cpuThreshold": 75
    },
    "healthCheck": {
      "interval": 60,
      "timeout": 5000,
      "endpoints": [
        "/api/health",
        "/api/v1/auth/health"
      ]
    }
  }
}
EOF

# 3. ヘルスチェックスクリプト
cat > monitoring/health-check.js << 'EOF'
const https = require('https');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./monitoring-config.json'));
const baseUrl = process.env.PRODUCTION_URL || 'https://salon-management-system-one.vercel.app';

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(`${baseUrl}${endpoint}`, (res) => {
      const duration = Date.now() - startTime;
      const status = res.statusCode === 200 ? 'OK' : 'ERROR';
      
      resolve({
        endpoint,
        status,
        statusCode: res.statusCode,
        responseTime: duration,
        timestamp: new Date().toISOString()
      });
    }).on('error', (err) => {
      resolve({
        endpoint,
        status: 'ERROR',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    });
  });
}

async function runHealthCheck() {
  const results = await Promise.all(
    config.monitoring.healthCheck.endpoints.map(checkEndpoint)
  );
  
  console.log(JSON.stringify(results, null, 2));
  
  // ログファイルに記録
  fs.appendFileSync(
    `./logs/app/health-check-${new Date().toISOString().split('T')[0]}.log`,
    JSON.stringify(results) + '\n'
  );
}

// 定期実行
setInterval(runHealthCheck, config.monitoring.healthCheck.interval * 1000);
runHealthCheck(); // 初回実行
EOF

# 4. エラー監視スクリプト
cat > monitoring/error-monitor.sh << 'EOF'
#!/bin/bash

# エラーログ監視
ERROR_COUNT=0
THRESHOLD=10

tail -f logs/error/*.log | while read line; do
  if [[ $line == *"ERROR"* ]]; then
    ERROR_COUNT=$((ERROR_COUNT + 1))
    echo "⚠️  Error detected: $line"
    
    if [ $ERROR_COUNT -ge $THRESHOLD ]; then
      echo "🚨 Error threshold reached! Sending alert..."
      # アラート送信処理
      ERROR_COUNT=0
    fi
  fi
done
EOF

chmod +x monitoring/error-monitor.sh

# 5. パフォーマンス監視
cat > monitoring/performance-monitor.js << 'EOF'
const os = require('os');
const fs = require('fs');

function getSystemMetrics() {
  const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;
  
  return {
    timestamp: new Date().toISOString(),
    cpu: {
      usage: cpuUsage.toFixed(2),
      cores: os.cpus().length
    },
    memory: {
      usage: memUsage.toFixed(2),
      total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + 'GB',
      free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + 'GB'
    },
    uptime: os.uptime()
  };
}

// メトリクス記録
setInterval(() => {
  const metrics = getSystemMetrics();
  console.log(JSON.stringify(metrics));
  
  fs.appendFileSync(
    `./logs/performance/metrics-${new Date().toISOString().split('T')[0]}.log`,
    JSON.stringify(metrics) + '\n'
  );
}, 60000); // 1分ごと
EOF

echo "✅ 運用監視環境のセットアップが完了しました"
echo ""
echo "🚀 監視開始方法:"
echo "1. ヘルスチェック: node monitoring/health-check.js"
echo "2. エラー監視: ./monitoring/error-monitor.sh"
echo "3. パフォーマンス監視: node monitoring/performance-monitor.js"