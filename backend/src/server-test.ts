import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '4002', 10);
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test server is running',
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Database connection test
app.get('/api/v1/test/db', async (req, res) => {
  try {
    await prisma.$connect();
    const customerCount = await prisma.customer.count();
    const reservationCount = await prisma.reservation.count();
    const staffCount = await prisma.staff.count();

    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        customers: customerCount,
        reservations: reservationCount,
        staff: staffCount
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple tenant creation for testing
app.post('/api/v1/test/create-tenant', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        plan: 'light',
        isActive: true
      }
    });

    const staff = await prisma.staff.create({
      data: {
        email,
        password: 'temporary-password',
        name: 'Admin User',
        role: 'ADMIN',
        tenantId: tenant.id
      }
    });

    res.json({
      success: true,
      message: 'Test tenant created successfully',
      data: {
        tenant,
        staff: {
          id: staff.id,
          email: staff.email,
          name: staff.name,
          role: staff.role
        }
      }
    });
  } catch (error) {
    console.error('Tenant creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple customer creation for testing
app.post('/api/v1/test/create-customer', async (req, res) => {
  try {
    const { name, email, phone, tenantId } = req.body;
    
    if (!name || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Name and tenantId are required'
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        tenantId,
        segment: 'NEW',
        visitCount: 0,
        totalSpent: 0
      }
    });

    res.json({
      success: true,
      message: 'Test customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all customers for a tenant
app.get('/api/v1/test/customers/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const customers = await prisma.customer.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        visitCount: true,
        totalSpent: true,
        segment: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Customers retrieved successfully',
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('Customer retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create reservation for testing
app.post('/api/v1/test/create-reservation', async (req, res) => {
  try {
    const { customerId, tenantId, startTime, endTime, menuContent, totalAmount } = req.body;
    
    if (!customerId || !tenantId || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'customerId, tenantId, and startTime are required'
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        customerId,
        tenantId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        menuContent: menuContent || 'カット & シャンプー',
        totalAmount: totalAmount || 5000,
        source: 'MANUAL',
        status: 'CONFIRMED',
        paymentStatus: 'pending'
      }
    });

    res.json({
      success: true,
      message: 'Test reservation created successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all reservations for a tenant
app.get('/api/v1/test/reservations/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const reservations = await prisma.reservation.findMany({
      where: { tenantId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    res.json({
      success: true,
      message: 'Reservations retrieved successfully',
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    console.error('Reservation retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test data cleanup
app.delete('/api/v1/test/cleanup', async (req, res) => {
  try {
    // Delete in correct order to respect foreign key constraints
    await prisma.reservation.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.tenant.deleteMany({});

    res.json({
      success: true,
      message: 'Test data cleaned up successfully'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup test data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log('\n🚀 Test Server Started');
  console.log(`📍 Server running on: http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🔌 Database test: http://localhost:${port}/api/v1/test/db`);
  console.log(`👥 Create tenant: POST http://localhost:${port}/api/v1/test/create-tenant`);
  console.log(`👤 Create customer: POST http://localhost:${port}/api/v1/test/create-customer`);
  console.log(`📋 Get customers: GET http://localhost:${port}/api/v1/test/customers/:tenantId`);
  console.log(`📅 Create reservation: POST http://localhost:${port}/api/v1/test/create-reservation`);
  console.log(`📆 Get reservations: GET http://localhost:${port}/api/v1/test/reservations/:tenantId`);
  console.log(`🧹 Cleanup: DELETE http://localhost:${port}/api/v1/test/cleanup`);
  console.log('\n✨ Ready for 20-user testing!\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;