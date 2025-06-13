const axios = require('axios');

async function testMinimal() {
  console.log('🧪 Testing Minimal Server...\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get('http://localhost:8080/health');
    console.log('✅ Health Response:', health.data);
    
    // Test API endpoint
    console.log('\n2️⃣ Testing API Endpoint...');
    const api = await axios.get('http://localhost:8080/api/v1/test');
    console.log('✅ API Response:', api.data);
    
    console.log('\n🎉 Minimal server is working correctly!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Server is not running');
      console.log('💡 Start the server with: npm run dev-minimal');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testMinimal();