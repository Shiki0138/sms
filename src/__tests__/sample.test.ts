import { testDb, testUtils } from '../test/setup';

describe('Sample Test Suite', () => {
  let testTenant: any;

  beforeEach(async () => {
    testTenant = await testUtils.createTestTenant();
  });

  describe('Basic Test Functionality', () => {
    it('should create test tenant successfully', () => {
      expect(testTenant).toBeDefined();
      expect(testTenant.name).toBe('Test Salon');
      expect(testTenant.plan).toBe('premium');
      expect(testTenant.isActive).toBe(true);
    });

    it('should create test staff successfully', async () => {
      const staff = await testUtils.createTestStaff(testTenant.id);
      
      expect(staff).toBeDefined();
      expect(staff.name).toBe('Test Staff');
      expect(staff.tenantId).toBe(testTenant.id);
      expect(staff.isActive).toBe(true);
    });

    it('should create test customer successfully', async () => {
      const customer = await testUtils.createTestCustomer(testTenant.id);
      
      expect(customer).toBeDefined();
      expect(customer.name).toBe('Test Customer');
      expect(customer.tenantId).toBe(testTenant.id);
    });
  });

  describe('Database Operations', () => {
    it('should clear database successfully', async () => {
      // Create some data
      await testUtils.createTestStaff(testTenant.id);
      await testUtils.createTestCustomer(testTenant.id);
      
      // Clear database
      await testUtils.clearDatabase();
      
      // Verify data is cleared
      const tenants = await testDb.tenant.findMany();
      const staff = await testDb.staff.findMany();
      const customers = await testDb.customer.findMany();
      
      expect(tenants).toHaveLength(0);
      expect(staff).toHaveLength(0);
      expect(customers).toHaveLength(0);
    });
  });
});