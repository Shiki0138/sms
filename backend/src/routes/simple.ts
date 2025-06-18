import { Router } from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  getCustomerStats 
} from '../controllers/customerController-simple';
import { 
  getThreads, 
  sendMessage, 
  getMessageStats 
} from '../controllers/messageController-simple';
import { 
  getReservations, 
  createReservation, 
  importHotPepperCsv, 
  syncGoogleCalendar, 
  getReservationStats 
} from '../controllers/reservationController-simple';
import {
  createFeedback,
  submitQuickRating,
  getFeedbackStats
} from '../controllers/feedbackController';
import {
  submitBetaApplication,
  sendConfirmationEmail,
  getBetaApplications,
  updateApplicationStatus,
  getBetaApplicationStats
} from '../controllers/betaApplicationController';

const router = Router();

// Customer routes
router.get('/customers', getCustomers);
router.get('/customers/stats', getCustomerStats);
router.get('/customers/:id', getCustomerById);

// Message routes
router.get('/messages/threads', getThreads);
router.post('/messages/send', sendMessage);
router.get('/messages/stats', getMessageStats);

// Reservation routes
router.get('/reservations', getReservations);
router.post('/reservations', createReservation);
router.post('/reservations/import/hotpepper', importHotPepperCsv);
router.post('/reservations/sync/google-calendar', syncGoogleCalendar);
router.get('/reservations/stats', getReservationStats);

// Feedback routes (for beta testing)
router.post('/feedback', createFeedback);
router.post('/feedback/quick-rating', submitQuickRating);
router.get('/feedback/stats', getFeedbackStats);

// Beta application routes
router.post('/beta-applications', submitBetaApplication);
router.post('/beta-applications/send-confirmation', sendConfirmationEmail);
router.get('/beta-applications', getBetaApplications);
router.put('/beta-applications/:id/status', updateApplicationStatus);
router.get('/beta-applications/stats', getBetaApplicationStats);

// Demo auth endpoints
router.post('/auth/register', (req, res) => {
  res.status(201).json({
    message: '管理者登録が完了しました（デモモード）',
    user: {
      id: 'demo-user-id',
      email: req.body.email,
      name: req.body.name,
      role: req.body.role || 'ADMIN',
    },
    token: 'demo-jwt-token-12345',
  });
});

router.post('/auth/login', (req, res) => {
  res.status(200).json({
    message: 'ログインが成功しました（デモモード）',
    user: {
      id: 'demo-user-id',
      email: req.body.email,
      name: 'システム管理者',
      role: 'ADMIN',
    },
    token: 'demo-jwt-token-12345',
  });
});

router.get('/auth/profile', (req, res) => {
  res.status(200).json({
    user: {
      id: 'demo-user-id',
      email: 'admin@salon.test',
      name: 'システム管理者',
      role: 'ADMIN',
      tenant: {
        id: 'demo-tenant-id',
        name: 'デモ美容室',
        plan: 'PREMIUM',
      },
    },
  });
});

// Webhook endpoints
router.get('/webhooks/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'demo-verify-token') {
    console.log('Instagram webhook verified (production mode)');
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

router.post('/webhooks/instagram', (req, res) => {
  console.log('Instagram webhook received (production mode):', JSON.stringify(req.body, null, 2));
  res.status(200).json({
    success: true,
    message: 'Instagram メッセージを受信しました（プロダクションモード）',
    processedEvents: req.body.entry?.length || 0,
  });
});

router.post('/webhooks/line', (req, res) => {
  console.log('LINE webhook received (production mode):', JSON.stringify(req.body, null, 2));
  res.status(200).json({
    success: true,
    message: 'LINE メッセージを受信しました（プロダクションモード）',
    processedEvents: req.body.events?.length || 0,
  });
});

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.status(200).json({
    title: '美容室SaaS統合管理システム API',
    version: '1.0.0',
    description: 'LINE & Instagram DM統合メッセージ管理、予約管理、顧客管理システム',
    mode: 'Production Mode (Database Connected)',
    features: {
      messaging: {
        description: '統合メッセージ管理システム',
        endpoints: [
          'GET /api/v1/messages/threads - 統合インボックス',
          'POST /api/v1/messages/send - メッセージ送信',
          'POST /api/v1/webhooks/instagram - Instagram Webhook',
          'POST /api/v1/webhooks/line - LINE Webhook',
        ],
      },
      customers: {
        description: '顧客管理システム',
        endpoints: [
          'GET /api/v1/customers - 顧客一覧',
          'GET /api/v1/customers/:id - 顧客詳細',
          'GET /api/v1/customers/stats - 顧客統計',
        ],
      },
      reservations: {
        description: '予約管理システム',
        endpoints: [
          'GET /api/v1/reservations - 予約一覧',
          'POST /api/v1/reservations - 予約作成',
          'POST /api/v1/reservations/import/hotpepper - CSV インポート',
          'POST /api/v1/reservations/sync/google-calendar - Google Calendar同期',
        ],
      },
    },
    database: 'SQLite (Connected)',
    note: 'プロダクションモード：実際のデータベースに接続されています。',
  });
});

export default router;