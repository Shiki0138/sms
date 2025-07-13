// Vercel serverless function for health check
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.floor(process.uptime()),
    service: 'SMS Backend API'
  }

  res.status(200).json(health)
}