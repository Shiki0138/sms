import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '4002', 10);
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(cors({
  origin: true,  // Allow all origins for now
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '美容室管理システムAPI稼働中',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Support Staff endpoints (Feature Flag enabled by default)
app.get(`${apiPrefix}/support-staff/search`, async (req, res) => {
  console.log('Support staff search request:', req.query);
  
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: '山田花子',
        email: 'yamada@example.com',
        skills: ['カット', 'カラー'],
        experience: 5,
        rating: 4.8,
        distance: 2.5,
        minHourlyRate: 2500,
        profilePhoto: null
      },
      {
        id: '2',
        name: '佐藤美香',
        email: 'sato@example.com',
        skills: ['カット', 'パーマ', 'トリートメント'],
        experience: 8,
        rating: 4.9,
        distance: 4.2,
        minHourlyRate: 3000,
        profilePhoto: null
      }
    ]
  });
});

app.post(`${apiPrefix}/support-staff/request`, async (req, res) => {
  console.log('Support staff request:', req.body);
  
  res.json({
    success: true,
    data: {
      id: 'req_' + Date.now(),
      ...req.body,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
  });
});

// Feature flags endpoint
app.get(`${apiPrefix}/feature-flags`, (req, res) => {
  res.json({
    success: true,
    data: {
      supportStaffPlatform: true,  // Enabled by default as requested
      posSystem: false,            // Not yet implemented
      aiShiftManagement: false,
      businessStrategy: false
    }
  });
});

// Simple test endpoint
app.get(`${apiPrefix}/test`, (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.path} not found`
  });
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log('\n===========================================');
  console.log('🎉 美容室管理システム API 起動成功！');
  console.log('===========================================\n');
  console.log(`📍 Port: ${port}`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log(`🧪 Test: http://localhost:${port}${apiPrefix}/test`);
  console.log(`🤝 Support Staff: http://localhost:${port}${apiPrefix}/support-staff/search`);
  console.log(`🚩 Feature Flags: http://localhost:${port}${apiPrefix}/feature-flags`);
  console.log('\n✨ サーバー稼働中...\n');
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;