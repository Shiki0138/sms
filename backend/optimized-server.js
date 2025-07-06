const express = require('express');
const cors = require('cors');
const { cacheMiddleware, setCacheHeaders, getCacheStats } = require('./cache-middleware');

const app = express();
const port = process.env.PORT || 8080;

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://storage.googleapis.com',
    'https://salon-frontend-optimized.storage.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' })); // リクエストサイズ制限
app.use(setCacheHeaders); // キャッシュヘッダー設定

// ヘルスチェック（キャッシュなし）
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1-optimized',
    message: 'Optimized Salon Management API',
    cache: getCacheStats()
  });
});

// ログインエンドポイント（キャッシュなし）
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email });
  
  res.status(200).json({
    success: true,
    message: 'ログインが成功しました',
    data: {
      user: {
        id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        name: 'システム管理者',
        role: 'ADMIN',
        isActive: true
      },
      token: 'demo-jwt-token-' + Math.random().toString(36).substr(2, 9)
    }
  });
});

// 顧客一覧（5分キャッシュ）
app.get('/api/v1/customers', cacheMiddleware(300), (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: '山田花子',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        lastVisit: '2024-06-15',
        totalVisits: 12
      },
      {
        id: '2',
        name: '田中美香',
        email: 'mika@example.com',
        phone: '090-2345-6789',
        lastVisit: '2024-06-20',
        totalVisits: 8
      },
      {
        id: '3',
        name: '佐藤直美',
        email: 'naomi@example.com',
        phone: '090-3456-7890',
        lastVisit: '2024-06-25',
        totalVisits: 15
      }
    ]
  });
});

// 予約一覧（1分キャッシュ）
app.get('/api/v1/reservations', cacheMiddleware(60), (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        customerName: '山田花子',
        service: 'カット & カラー',
        date: '2024-07-05',
        time: '10:00',
        status: 'confirmed'
      },
      {
        id: '2',
        customerName: '田中美香',
        service: 'パーマ',
        date: '2024-07-06',
        time: '14:00',
        status: 'pending'
      },
      {
        id: '3',
        customerName: '佐藤直美',
        service: 'トリートメント',
        date: '2024-07-07',
        time: '11:30',
        status: 'confirmed'
      }
    ]
  });
});

// ダッシュボード統計（10分キャッシュ）
app.get('/api/v1/analytics/dashboard', cacheMiddleware(600), (req, res) => {
  res.json({
    success: true,
    data: {
      todayRevenue: 45000,
      monthRevenue: 850000,
      todayCustomers: 8,
      monthCustomers: 180,
      popularServices: [
        { name: 'カット', count: 45 },
        { name: 'カラー', count: 32 },
        { name: 'パーマ', count: 18 }
      ]
    }
  });
});

// コスト監視エンドポイント
app.get('/api/v1/system/costs', (req, res) => {
  res.json({
    success: true,
    data: {
      estimatedMonthlyCost: '$15-25',
      currentUsage: {
        cloudRun: {
          cpu: '0.5 vCPU',
          memory: '256Mi',
          instances: '0-2',
          estimatedCost: '$8-15'
        },
        cloudStorage: {
          storage: '~1GB',
          bandwidth: '~10GB/month',
          estimatedCost: '$1-3'
        },
        firestore: {
          reads: '~50K/month',
          writes: '~10K/month',
          estimatedCost: '$0-5'
        }
      },
      optimization: {
        cacheHitRate: getCacheStats().hits / (getCacheStats().hits + getCacheStats().misses) * 100 + '%',
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 + 'MB'
      }
    }
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`🚀 Optimized Salon Management API running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`💰 Cost monitoring: http://localhost:${port}/api/v1/system/costs`);
  console.log(`🎯 Target monthly cost: $15-25`);
});

module.exports = app;