const axios = require('axios');

const baseURL = 'http://localhost:4002';

async function testAPI() {
  try {
    console.log('🔍 Testing Health Endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check Response:', healthResponse.data);
    
    console.log('\n🔍 Testing Simple API Routes...');
    const apiResponse = await axios.get(`${baseURL}/api/v1/customers`);
    console.log('✅ API Response:', apiResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Connection Error: Could not connect to server');
      console.log('Make sure the server is running on port 4002');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testAPI();