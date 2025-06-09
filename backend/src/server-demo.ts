import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4002;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:4003', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    message: 'Salon Management API - Demo Mode (No Database)',
    features: [
      '✅ 統合メッセージ管理システム',
      '✅ LINE & Instagram DM 一元管理',
      '✅ 予約管理システム',
      '✅ 顧客管理システム',
      '⚠️  デモモード（データベース接続なし）'
    ]
  });
});

// Demo API endpoints
const apiPrefix = `/api/${process.env.API_VERSION || 'v1'}`;

// Demo Auth endpoints
app.post(`${apiPrefix}/auth/register`, (req, res) => {
  res.status(201).json({
    message: '管理者登録が完了しました（デモモード）',
    user: {
      id: 'demo-user-id',
      email: req.body.email,
      name: req.body.name,
      role: req.body.role || 'ADMIN'
    },
    token: 'demo-jwt-token-12345'
  });
});

app.post(`${apiPrefix}/auth/login`, (req, res) => {
  res.status(200).json({
    message: 'ログインが成功しました（デモモード）',
    user: {
      id: 'demo-user-id',
      email: req.body.email,
      name: 'システム管理者',
      role: 'ADMIN'
    },
    token: 'demo-jwt-token-12345'
  });
});

app.get(`${apiPrefix}/auth/profile`, (req, res) => {
  res.status(200).json({
    user: {
      id: 'demo-user-id',
      email: 'admin@salon.test',
      name: 'システム管理者',
      role: 'ADMIN',
      tenant: {
        id: 'demo-tenant-id',
        name: 'デモ美容室',
        plan: 'PREMIUM'
      }
    }
  });
});

// Demo Customer endpoints
app.get(`${apiPrefix}/customers`, (req, res) => {
  res.status(200).json({
    customers: [
      {
        id: 'customer-1',
        name: '田中花子',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        instagramId: 'shiki_fp_138',
        lineId: 'line_tanaka_123',
        visitCount: 5,
        lastVisitDate: '2024-12-01T10:00:00.000Z',
        createdAt: '2024-10-01T09:00:00.000Z'
      },
      {
        id: 'customer-2',
        name: '山田太郎',
        phone: '090-9876-5432',
        email: 'yamada@example.com',
        instagramId: 'shiki_fp_138',
        lineId: 'line_yamada_456',
        visitCount: 3,
        lastVisitDate: '2024-11-15T14:00:00.000Z',
        createdAt: '2024-09-15T11:00:00.000Z'
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1
    }
  });
});

app.post(`${apiPrefix}/customers`, (req, res) => {
  res.status(201).json({
    message: '顧客が作成されました（デモモード）',
    customer: {
      id: 'new-customer-id',
      ...req.body,
      visitCount: 0,
      createdAt: new Date().toISOString()
    }
  });
});

// Demo Message endpoints
app.get(`${apiPrefix}/messages/threads`, (req, res) => {
  res.status(200).json({
    threads: [
      {
        id: 'thread-1',
        customer: {
          id: 'customer-1',
          name: '田中花子',
          instagramId: 'shiki_fp_138'
        },
        channel: 'INSTAGRAM',
        status: 'OPEN',
        lastMessage: {
          content: '予約を取りたいのですが、今度の土曜日は空いていますか？',
          createdAt: '2024-12-09T15:30:00.000Z',
          senderType: 'CUSTOMER'
        },
        unreadCount: 1,
        updatedAt: '2024-12-09T15:30:00.000Z'
      },
      {
        id: 'thread-2',
        customer: {
          id: 'customer-2',
          name: '山田太郎',
          lineId: 'line_yamada_456'
        },
        channel: 'LINE',
        status: 'IN_PROGRESS',
        assignedStaff: {
          id: 'staff-1',
          name: 'スタッフA'
        },
        lastMessage: {
          content: 'こんにちは！先日はありがとうございました。',
          createdAt: '2024-12-09T12:00:00.000Z',
          senderType: 'CUSTOMER'
        },
        unreadCount: 0,
        updatedAt: '2024-12-09T12:15:00.000Z'
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1
    }
  });
});

app.post(`${apiPrefix}/messages/send`, (req, res) => {
  res.status(200).json({
    message: 'メッセージが送信されました（デモモード）',
    sentMessage: {
      id: 'message-new',
      threadId: req.body.threadId,
      content: req.body.content,
      mediaType: req.body.mediaType || 'TEXT',
      senderType: 'STAFF',
      createdAt: new Date().toISOString()
    }
  });
});

app.get(`${apiPrefix}/messages/stats`, (req, res) => {
  res.status(200).json({
    stats: {
      totalThreads: 15,
      openThreads: 8,
      inProgressThreads: 5,
      closedThreads: 2,
      unreadMessages: 12,
      avgResponseTime: '2.5時間',
      channelBreakdown: {
        INSTAGRAM: 8,
        LINE: 7
      }
    }
  });
});

// Demo Reservation endpoints
app.get(`${apiPrefix}/reservations`, (req, res) => {
  res.status(200).json({
    reservations: [
      {
        id: 'reservation-1',
        startTime: '2024-12-15T10:00:00.000Z',
        endTime: '2024-12-15T11:30:00.000Z',
        menuContent: 'カット＋カラー',
        customerName: '田中花子',
        customer: {
          id: 'customer-1',
          name: '田中花子',
          phone: '090-1234-5678'
        },
        staff: {
          id: 'staff-1',
          name: 'スタッフA'
        },
        source: 'MANUAL',
        status: 'CONFIRMED',
        notes: '明るめのブラウンカラー希望'
      },
      {
        id: 'reservation-2',
        startTime: '2024-12-15T14:00:00.000Z',
        endTime: '2024-12-15T15:00:00.000Z',
        menuContent: 'カット',
        customerName: '山田太郎',
        customer: {
          id: 'customer-2',
          name: '山田太郎',
          phone: '090-9876-5432'
        },
        source: 'HOTPEPPER',
        status: 'CONFIRMED'
      }
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 2,
      totalPages: 1
    }
  });
});

app.post(`${apiPrefix}/reservations`, (req, res) => {
  res.status(201).json({
    message: '予約が作成されました（デモモード）',
    reservation: {
      id: 'new-reservation-id',
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

app.post(`${apiPrefix}/reservations/import/hotpepper`, (req, res) => {
  res.status(200).json({
    message: 'ホットペッパーCSVインポートが完了しました（デモモード）',
    results: {
      total: 5,
      imported: 4,
      skipped: 1,
      errors: ['Row 3: 無効な日付形式']
    }
  });
});

app.post(`${apiPrefix}/reservations/sync/google-calendar`, (req, res) => {
  res.status(200).json({
    message: 'Google Calendar同期が完了しました（デモモード）',
    results: {
      imported: 3,
      updated: 2,
      errors: []
    }
  });
});

app.get(`${apiPrefix}/reservations/stats`, (req, res) => {
  res.status(200).json({
    stats: {
      todayReservations: 6,
      monthReservations: 45,
      confirmedReservations: 5,
      completedReservations: 38,
      cancelledReservations: 2,
      cancellationRate: 4
    }
  });
});

// Demo Webhook endpoints
app.get(`${apiPrefix}/webhooks/instagram`, (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'demo-verify-token') {
    console.log('Instagram webhook verified (demo mode)');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

app.post(`${apiPrefix}/webhooks/instagram`, (req, res) => {
  console.log('Instagram webhook received (demo mode):', JSON.stringify(req.body, null, 2));
  res.status(200).json({ 
    success: true, 
    message: 'Instagram メッセージを受信しました（デモモード）',
    processedEvents: req.body.entry?.length || 0
  });
});

app.post(`${apiPrefix}/webhooks/line`, (req, res) => {
  console.log('LINE webhook received (demo mode):', JSON.stringify(req.body, null, 2));
  res.status(200).json({ 
    success: true, 
    message: 'LINE メッセージを受信しました（デモモード）',
    processedEvents: req.body.events?.length || 0
  });
});

// API Documentation endpoint
app.get(`${apiPrefix}/docs`, (req, res) => {
  res.status(200).json({
    title: '美容室SaaS統合管理システム API',
    version: '1.0.0',
    description: 'LINE & Instagram DM統合メッセージ管理、予約管理、顧客管理システム',
    features: {
      messaging: {
        description: '統合メッセージ管理システム',
        endpoints: [
          'GET /api/v1/messages/threads - 統合インボックス',
          'POST /api/v1/messages/send - メッセージ送信',
          'POST /api/v1/webhooks/instagram - Instagram Webhook',
          'POST /api/v1/webhooks/line - LINE Webhook'
        ]
      },
      customers: {
        description: '顧客管理システム',
        endpoints: [
          'GET /api/v1/customers - 顧客一覧',
          'POST /api/v1/customers - 顧客作成'
        ]
      },
      reservations: {
        description: '予約管理システム',
        endpoints: [
          'GET /api/v1/reservations - 予約一覧',
          'POST /api/v1/reservations - 予約作成',
          'POST /api/v1/reservations/import/hotpepper - CSV インポート',
          'POST /api/v1/reservations/sync/google-calendar - Google Calendar同期'
        ]
      }
    },
    demoMode: true,
    note: 'これはデモモードです。実際のデータベースには接続されていません。'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableEndpoints: [
      'GET /health',
      `GET ${apiPrefix}/docs`,
      `POST ${apiPrefix}/auth/register`,
      `POST ${apiPrefix}/auth/login`,
      `GET ${apiPrefix}/messages/threads`,
      `POST ${apiPrefix}/webhooks/instagram`,
      `POST ${apiPrefix}/webhooks/line`
    ]
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Demo Server is running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`📖 API docs: http://localhost:${port}${apiPrefix}/docs`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'} (Demo Mode)`);
  console.log(`\n✨ 統合メッセージ管理システム - デモモード`);
  console.log(`   LINE & Instagram DM 一元管理システム`);
});

export default app;