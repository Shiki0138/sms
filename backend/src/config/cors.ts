export const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://storage.googleapis.com',
    'https://salon-frontend-static.storage.googleapis.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400
};
