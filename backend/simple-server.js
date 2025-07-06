const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// CORS設定
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://storage.googleapis.com',
    'https://salon-frontend-static.storage.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// ヘルスチェック
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1',
    message: 'Simple Salon Management API'
  });
});

// ログインエンドポイント - どのメールアドレスでもログイン可能
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
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

// 顧客一覧
app.get('/api/v1/customers', (req, res) => {
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

// 予約一覧
app.get('/api/v1/reservations', (req, res) => {
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

// 売上統計
app.get('/api/v1/analytics/dashboard', (req, res) => {
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

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(port, () => {
  console.log(`🚀 Simple Salon Management API running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔑 Login: POST http://localhost:${port}/api/v1/auth/login`);
});

module.exports = app;