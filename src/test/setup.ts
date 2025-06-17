import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

// Test database instance
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db'
    }
  }
});

// Test utilities
export const testUtils = {
  // Clear all data from test database
  async clearDatabase() {
    const tablenames = await testDb.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    `;
    
    for (const { name } of tablenames) {
      await testDb.$executeRawUnsafe(`DELETE FROM ${name};`);
    }
  },

  // Create test tenant
  async createTestTenant(data: Partial<any> = {}) {
    return await testDb.tenant.create({
      data: {
        name: 'Test Salon',
        plan: 'premium',
        isActive: true,
        ...data
      }
    });
  },

  // Create test staff
  async createTestStaff(tenantId: string, data: Partial<any> = {}) {
    return await testDb.staff.create({
      data: {
        tenantId,
        name: 'Test Staff',
        email: 'test@example.com',
        role: 'STAFF',
        isActive: true,
        ...data
      }
    });
  },

  // Create test customer
  async createTestCustomer(tenantId: string, data: Partial<any> = {}) {
    return await testDb.customer.create({
      data: {
        tenantId,
        name: 'Test Customer',
        phone: '090-1234-5678',
        ...data
      }
    });
  }
};

// Global test setup
beforeAll(async () => {
  // Ensure test database is connected
  await testDb.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await testDb.$disconnect();
});

beforeEach(async () => {
  // Clear database before each test
  await testUtils.clearDatabase();
});

afterEach(async () => {
  // Additional cleanup if needed
});