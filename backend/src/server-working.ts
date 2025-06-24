import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = parseInt(process.env.PORT || '4002', 10);
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  try {
    const { lat, lng, date, startTime, endTime, skills } = req.query;
    
    // For now, return mock data
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
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post(`${apiPrefix}/support-staff/request`, async (req, res) => {
  try {
    const { staffId, salonId, date, startTime, endTime, hourlyRate, requirements } = req.body;
    
    // Return mock success response
    res.json({
      success: true,
      data: {
        id: 'req_' + Date.now(),
        staffId,
        salonId,
        date,
        startTime,
        endTime,
        hourlyRate,
        requirements,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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

// Basic error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const server = app.listen(port, () => {
  console.log('\n🎉 美容室管理システム API サーバー起動成功！\n');
  console.log(`📍 サーバー稼働中: http://localhost:${port}`);
  console.log(`🏥 ヘルスチェック: http://localhost:${port}/health`);
  console.log(`🤝 応援スタッフ検索: http://localhost:${port}${apiPrefix}/support-staff/search`);
  console.log(`🚩 機能フラグ: http://localhost:${port}${apiPrefix}/feature-flags`);
  console.log('\n✨ 準備完了！\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    prisma.$disconnect();
  });
});

export default app;