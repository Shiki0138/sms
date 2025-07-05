// Quick API test script
const axios = require('axios');

const baseURL = 'http://localhost:4002';

async function quickTest() {
  console.log('🔍 Salon Management System - Quick API Test');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Health Check
    console.log('\\n1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Status:', health.data.status);
    console.log('📊 Uptime:', Math.round(health.data.uptime), 'seconds');
    
    // Test 2: Customers API
    console.log('\\n2️⃣ Testing Customers API...');
    const customers = await axios.get(`${baseURL}/api/v1/customers`);
    console.log('✅ Customers found:', customers.data.data?.length || 0);
    
    // Test 3: Create Test Customer
    console.log('\\n3️⃣ Creating Test Customer...');
    const newCustomer = await axios.post(`${baseURL}/api/v1/customers`, {
      name: 'テスト顧客',
      phone: '090-1234-5678',
      email: 'test@example.com'
    });
    console.log('✅ Customer created:', newCustomer.data.data?.name);
    
    // Test 4: Reservations API
    console.log('\\n4️⃣ Testing Reservations API...');
    const reservations = await axios.get(`${baseURL}/api/v1/reservations`);
    console.log('✅ Reservations found:', reservations.data.data?.length || 0);
    
    // Test 5: Threads API
    console.log('\\n5️⃣ Testing Message Threads API...');
    const threads = await axios.get(`${baseURL}/api/v1/threads`);
    console.log('✅ Threads found:', threads.data.data?.length || 0);
    
    console.log('\\n🎉 All tests passed! API is working correctly.');
    console.log('=' .repeat(50));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status);
      console.error('📝 Message:', error.response.data);
    } else if (error.request) {
      console.error('❌ Connection Error: Server not reachable');
      console.log('💡 Make sure server is running: npm run dev-test');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

quickTest();