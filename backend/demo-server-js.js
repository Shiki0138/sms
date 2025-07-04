const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8080

// CORS設定
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://storage.googleapis.com',
    'https://salon-frontend-static.storage.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// デモモード用ミドルウェア
app.use((req, res, next) => {
  console.log(`[DEMO] ${req.method} ${req.path}`)
  res.setHeader('X-Demo-Mode', 'true')
  next()
})

// ヘルスチェック
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1-demo-full',
    message: '美容室管理システム - フル機能デモモード'
  })
})

// ログインエンドポイント（どんなメール/パスワードでも成功）
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body
  
  console.log(`[DEMO] ログイン試行: ${email}`)
  
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
  })
})

// 顧客一覧（デモデータ）
app.get('/api/v1/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: '山田花子',
        nameKana: 'ヤマダハナコ',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        birthDate: '1985-05-15',
        lastVisit: '2024-06-15',
        totalVisits: 12,
        totalSpent: 45000,
        averageSpent: 3750,
        notes: '定期的にカラーとトリートメントを利用',
        tags: ['常連', 'カラー'],
        createdAt: '2023-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: '田中美香',
        nameKana: 'タナカミカ',
        email: 'mika@example.com',
        phone: '090-2345-6789',
        birthDate: '1990-08-20',
        lastVisit: '2024-06-20',
        totalVisits: 8,
        totalSpent: 32000,
        averageSpent: 4000,
        notes: 'パーマのお客様、3ヶ月周期で来店',
        tags: ['新規', 'パーマ'],
        createdAt: '2023-03-20T14:30:00Z'
      },
      {
        id: '3',
        name: '佐藤直美',
        nameKana: 'サトウナオミ',
        email: 'naomi@example.com',
        phone: '090-3456-7890',
        birthDate: '1988-12-10',
        lastVisit: '2024-06-25',
        totalVisits: 15,
        totalSpent: 67500,
        averageSpent: 4500,
        notes: 'VIP顧客、特別割引適用',
        tags: ['VIP', 'トリートメント'],
        createdAt: '2022-11-05T09:15:00Z'
      },
      {
        id: '4',
        name: '鈴木さくら',
        nameKana: 'スズキサクラ',
        email: 'sakura@example.com',
        phone: '090-4567-8901',
        birthDate: '1995-03-22',
        lastVisit: '2024-06-28',
        totalVisits: 5,
        totalSpent: 20000,
        averageSpent: 4000,
        notes: '新規のお客様、カット希望',
        tags: ['新規'],
        createdAt: '2024-02-10T11:20:00Z'
      },
      {
        id: '5',
        name: '伊藤まゆみ',
        nameKana: 'イトウマユミ',
        email: 'mayumi@example.com',
        phone: '090-5678-9012',
        birthDate: '1982-11-18',
        lastVisit: '2024-06-30',
        totalVisits: 20,
        totalSpent: 90000,
        averageSpent: 4500,
        notes: 'VIP常連客、月2回来店',
        tags: ['VIP', '常連'],
        createdAt: '2022-07-01T08:00:00Z'
      }
    ],
    total: 5,
    page: 1,
    limit: 20
  })
})

// 予約一覧（デモデータ）
app.get('/api/v1/reservations', (req, res) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        customerId: '1',
        customerName: '山田花子',
        staffId: 'staff1',
        staffName: '田中スタイリスト',
        services: [
          { name: 'カット', price: 3500, duration: 30 },
          { name: 'カラー', price: 5000, duration: 90 }
        ],
        date: today.toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed',
        totalPrice: 8500,
        notes: 'いつものブラウン系で'
      },
      {
        id: '2',
        customerId: '2',
        customerName: '田中美香',
        staffId: 'staff2',
        staffName: '佐藤スタイリスト',
        services: [
          { name: 'パーマ', price: 12000, duration: 150 }
        ],
        date: today.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:30',
        status: 'pending',
        totalPrice: 12000,
        notes: 'ゆるめのウェーブ希望'
      },
      {
        id: '3',
        customerId: '3',
        customerName: '佐藤直美',
        staffId: 'staff1',
        staffName: '田中スタイリスト',
        services: [
          { name: 'トリートメント', price: 5000, duration: 60 }
        ],
        date: tomorrow.toISOString().split('T')[0],
        startTime: '11:30',
        endTime: '12:30',
        status: 'confirmed',
        totalPrice: 5000,
        notes: 'ダメージケア重視'
      }
    ],
    total: 3,
    page: 1,
    limit: 20
  })
})

// ダッシュボード統計（デモデータ）
app.get('/api/v1/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      todayRevenue: 45000,
      yesterdayRevenue: 38000,
      monthRevenue: 850000,
      lastMonthRevenue: 780000,
      todayCustomers: 8,
      yesterdayCustomers: 6,
      monthCustomers: 180,
      lastMonthCustomers: 165,
      todayReservations: 12,
      cancelRate: 5.2,
      averageSpendPerCustomer: 4722,
      newCustomersThisMonth: 15,
      returningCustomersRate: 78.5,
      popularServices: [
        { name: 'カット', count: 45, revenue: 180000, percentage: 21.2 },
        { name: 'カラー', count: 32, revenue: 256000, percentage: 30.1 },
        { name: 'パーマ', count: 18, revenue: 216000, percentage: 25.4 },
        { name: 'トリートメント', count: 25, revenue: 125000, percentage: 14.7 },
        { name: 'その他', count: 12, revenue: 73000, percentage: 8.6 }
      ],
      hourlyRevenue: [
        { hour: '09:00', revenue: 0 },
        { hour: '10:00', revenue: 8500 },
        { hour: '11:00', revenue: 12000 },
        { hour: '12:00', revenue: 5500 },
        { hour: '13:00', revenue: 3000 },
        { hour: '14:00', revenue: 12000 },
        { hour: '15:00', revenue: 8000 },
        { hour: '16:00', revenue: 6000 },
        { hour: '17:00', revenue: 10000 },
        { hour: '18:00', revenue: 7500 },
        { hour: '19:00', revenue: 4500 }
      ],
      revenueChart: [
        { date: '2024-06-01', revenue: 32000 },
        { date: '2024-06-08', revenue: 45000 },
        { date: '2024-06-15', revenue: 38000 },
        { date: '2024-06-22', revenue: 52000 },
        { date: '2024-06-29', revenue: 48000 }
      ]
    }
  })
})

// メッセージ/スレッド一覧（デモデータ）
app.get('/api/v1/messages/threads', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'thread1',
        customerId: '1',
        customerName: '山田花子',
        platform: 'LINE',
        lastMessage: '来週の予約をお願いします',
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 1,
        status: 'active'
      },
      {
        id: 'thread2',
        customerId: '2',
        customerName: '田中美香',
        platform: 'Instagram',
        lastMessage: 'カラーの色見本を送ってもらえますか？',
        lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 0,
        status: 'active'
      },
      {
        id: 'thread3',
        customerId: '3',
        customerName: '佐藤直美',
        platform: 'LINE',
        lastMessage: 'ありがとうございました！',
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
        unreadCount: 0,
        status: 'closed'
      }
    ],
    total: 3,
    page: 1,
    limit: 20
  })
})

// スタッフ一覧（デモデータ）
app.get('/api/v1/staff', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'staff1',
        name: '田中スタイリスト',
        email: 'tanaka@salon.jp',
        role: 'stylist',
        specialties: ['カット', 'カラー'],
        workingDays: ['月', '火', '木', '金', '土'],
        rating: 4.8,
        reviewCount: 120
      },
      {
        id: 'staff2',
        name: '佐藤スタイリスト',
        email: 'sato@salon.jp',
        role: 'stylist',
        specialties: ['パーマ', 'トリートメント'],
        workingDays: ['火', '水', '金', '土', '日'],
        rating: 4.9,
        reviewCount: 98
      },
      {
        id: 'staff3',
        name: '鈴木アシスタント',
        email: 'suzuki@salon.jp',
        role: 'assistant',
        specialties: ['シャンプー', 'ヘッドスパ'],
        workingDays: ['月', '水', '木', '金', '土'],
        rating: 4.7,
        reviewCount: 65
      }
    ]
  })
})

// タグ一覧（デモデータ）
app.get('/api/v1/tags', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: '1', name: 'VIP', color: '#FFD700', count: 12 },
      { id: '2', name: '常連', color: '#4CAF50', count: 45 },
      { id: '3', name: '新規', color: '#2196F3', count: 23 },
      { id: '4', name: 'カラー', color: '#E91E63', count: 38 },
      { id: '5', name: 'パーマ', color: '#9C27B0', count: 19 },
      { id: '6', name: 'トリートメント', color: '#00BCD4', count: 27 }
    ]
  })
})

// デモモード情報
app.get('/api/v1/demo/info', (req, res) => {
  res.json({
    success: true,
    data: {
      mode: 'DEMO',
      message: 'これはデモモードです。実際のデータは保存されません。',
      features: [
        '✓ ログイン（どのメール/パスワードでも可）',
        '✓ ダッシュボード（売上・来店統計）',
        '✓ 顧客管理（検索・詳細表示）',
        '✓ 予約管理（カレンダー表示）',
        '✓ 売上分析（グラフ・レポート）',
        '✓ メッセージ管理（LINE/Instagram）',
        '✓ スタッフ管理',
        '✓ 設定画面'
      ],
      limitations: [
        '× データの保存',
        '× メール送信',
        '× 決済処理',
        '× データエクスポート',
        '× 外部API連携'
      ],
      testAccounts: [
        { email: 'demo@salon.jp', password: 'demo123', role: '管理者' },
        { email: 'test@example.com', password: 'test', role: 'スタッフ' },
        { email: 'user@demo.com', password: 'password', role: 'ビューワー' }
      ]
    }
  })
})

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl,
    demo: true
  })
})

app.listen(port, () => {
  console.log('🎯 フル機能デモサーバー起動')
  console.log(`📋 URL: http://localhost:${port}`)
  console.log(`🔑 ログイン: どのメール/パスワードでもOK`)
  console.log(`📊 全機能利用可能`)
  console.log('✨ デモモードで動作中...')
})

module.exports = app