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
