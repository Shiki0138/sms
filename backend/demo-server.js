const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// CORS設定（すべてのオリジンを許可）
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// デモモード用ミドルウェア
app.use((req, res, next) => {
  console.log(`[DEMO] ${req.method} ${req.path}`);
  res.setHeader('X-Demo-Mode', 'true');
  next();
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1-demo',
    message: '美容室管理システム - デモモード'
  });
});

// ログインエンドポイント（どんなメール/パスワードでも成功）
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`[DEMO] ログイン試行: ${email}`);
  
  // デモモードでは常に成功
  res.status(200).json({
    success: true,
    message: 'ログインが成功しました（デモモード）',
    data: {
      user: {
        id: 'demo-' + Date.now(),
        email: email || 'demo@salon.jp',
        name: email ? email.split('@')[0] : 'デモユーザー',
        role: 'ADMIN',
        isActive: true,
        tenantId: 'demo-tenant'
      },
      token: 'demo-token-' + Date.now()
    }
  });
});

// 顧客一覧（デモデータ）
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
        totalVisits: 12,
        totalSpent: 45000,
        averageSpent: 3750,
        tags: ['常連', 'カラー']
      },
      {
        id: '2',
        name: '田中美香',
        email: 'mika@example.com',
        phone: '090-2345-6789',
        lastVisit: '2024-06-20',
        totalVisits: 8,
        totalSpent: 32000,
        averageSpent: 4000,
        tags: ['新規', 'パーマ']
      },
      {
        id: '3',
        name: '佐藤直美',
        email: 'naomi@example.com',
        phone: '090-3456-7890',
        lastVisit: '2024-06-25',
        totalVisits: 15,
        totalSpent: 67500,
        averageSpent: 4500,
        tags: ['VIP', 'トリートメント']
      },
      {
        id: '4',
        name: '鈴木さくら',
        email: 'sakura@example.com',
        phone: '090-4567-8901',
        lastVisit: '2024-06-28',
        totalVisits: 5,
        totalSpent: 20000,
        averageSpent: 4000,
        tags: ['新規']
      },
      {
        id: '5',
        name: '伊藤まゆみ',
        email: 'mayumi@example.com',
        phone: '090-5678-9012',
        lastVisit: '2024-06-30',
        totalVisits: 20,
        totalSpent: 90000,
        averageSpent: 4500,
        tags: ['VIP', '常連']
      }
    ]
  });
});

// 予約一覧（デモデータ）
app.get('/api/v1/reservations', (req, res) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        customerName: '山田花子',
        customerId: '1',
        service: 'カット & カラー',
        staffName: '田中スタイリスト',
        date: today.toISOString().split('T')[0],
        time: '10:00',
        duration: 120,
        status: 'confirmed',
        price: 8500
      },
      {
        id: '2',
        customerName: '田中美香',
        customerId: '2',
        service: 'パーマ',
        staffName: '佐藤スタイリスト',
        date: today.toISOString().split('T')[0],
        time: '14:00',
        duration: 150,
        status: 'pending',
        price: 12000
      },
      {
        id: '3',
        customerName: '佐藤直美',
        customerId: '3',
        service: 'トリートメント',
        staffName: '田中スタイリスト',
        date: tomorrow.toISOString().split('T')[0],
        time: '11:30',
        duration: 60,
        status: 'confirmed',
        price: 5000
      }
    ]
  });
});

// ダッシュボード統計（デモデータ）
app.get('/api/v1/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      todayRevenue: 45000,
      monthRevenue: 850000,
      todayCustomers: 8,
      monthCustomers: 180,
      popularServices: [
        { name: 'カット', count: 45, revenue: 180000 },
        { name: 'カラー', count: 32, revenue: 256000 },
        { name: 'パーマ', count: 18, revenue: 216000 },
        { name: 'トリートメント', count: 25, revenue: 125000 }
      ],
      revenueChart: [
        { date: '2024-06-01', revenue: 32000 },
        { date: '2024-06-08', revenue: 45000 },
        { date: '2024-06-15', revenue: 38000 },
        { date: '2024-06-22', revenue: 52000 },
        { date: '2024-06-29', revenue: 48000 }
      ]
    }
  });
});

// デモモード情報
app.get('/api/v1/demo/info', (req, res) => {
  res.json({
    success: true,
    data: {
      mode: 'DEMO',
      message: 'これはデモモードです。実際のデータは保存されません。',
      features: [
        '✓ ログイン（どのメール/パスワードでも可）',
        '✓ 顧客管理',
        '✓ 予約管理',
        '✓ 売上分析',
        '✓ ダッシュボード'
      ],
      limitations: [
        '× データの保存',
        '× メール送信',
        '× 決済処理',
        '× データエクスポート'
      ]
    }
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl,
    demo: true
  });
});

// エラーハンドラー
app.use((err, req, res, next) => {
  console.error('[DEMO ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'デモモードエラー',
    message: err.message,
    demo: true
  });
});

app.listen(port, () => {
  console.log('🎯 デモサーバー起動');
  console.log(`📋 URL: http://localhost:${port}`);
  console.log(`🔑 ログイン: どのメール/パスワードでもOK`);
  console.log(`👥 テスト顧客: 5名`);
  console.log(`📅 テスト予約: 3件`);
  console.log('✨ デモモードで実行中...');
});

module.exports = app;