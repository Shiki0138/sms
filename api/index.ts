import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Salon Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      reservations: '/api/reservations',
      customers: '/api/customers',
      messages: '/api/messages'
    }
  });
}