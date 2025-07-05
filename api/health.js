export default async function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Salon Management System API is running',
    version: '1.0.0'
  });
}