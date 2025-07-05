const express = require('express');
const cors = require('cors');

const app = express();
const port = 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: 'v1',
    message: 'Test API Server',
    database: 'Connected'
  });
});

// Mock API endpoints for testing
app.get('/api/v1/analytics/dashboard-kpis', (req, res) => {
  res.json({
    success: true,
    data: {
      revenue: {
        thisMonth: 150000,
        lastMonth: 145000,
        growth: 3.4
      },
      customers: {
        total: 250,
        new: 15,
        active: 180
      },
      reservations: {
        today: 12,
        thisWeek: 85,
        confirmed: 80
      }
    }
  });
});

app.get('/api/v1/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'customer-001', name: 'テストユーザー1', email: 'test1@example.com' },
      { id: 'customer-002', name: 'テストユーザー2', email: 'test2@example.com' }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2
    }
  });
});

app.get('/api/v1/messages', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'msg-001', content: 'テストメッセージ1', channel: 'LINE' },
      { id: 'msg-002', content: 'テストメッセージ2', channel: 'LINE' }
    ]
  });
});

app.get('/api/v1/reservations', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'res-001', date: '2025-06-18', time: '10:00', status: 'CONFIRMED' },
      { id: 'res-002', date: '2025-06-18', time: '14:00', status: 'CONFIRMED' }
    ]
  });
});

app.post('/api/v1/reservations', (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      id: 'res-' + Date.now(),
      ...req.body,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'test-jwt-token-' + Date.now(),
    user: { id: 'user-001', email: req.body.email }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(port, () => {
  console.log(`🚀 Test API Server running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`📊 Dashboard KPIs: http://localhost:${port}/api/v1/analytics/dashboard-kpis`);
});