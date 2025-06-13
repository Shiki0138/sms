import express from 'express';
import cors from 'cors';

const app = express();
const port = 8080;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Simple test endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Minimal server is running',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Simple API endpoint
app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    data: {
      test: 'Hello from Salon Management API',
      version: '1.0.0'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log('\n🚀 Minimal Server Started');
  console.log(`📍 Server running on: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🧪 Test API: http://localhost:${port}/api/v1/test`);
  console.log('\n✨ Ready for testing!\n');
});

export default app;