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
