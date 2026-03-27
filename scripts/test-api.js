// Test script to verify transaction API
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Transaction API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('   ✅ Health:', health.data.status);

    // Test 2: Get all transactions
    console.log('\n2. Testing GET /api/transactions...');
    const getRes = await axios.get(`${API_URL}/transactions`);
    console.log('   ✅ Success:', getRes.data.success);
    console.log('   📊 Count:', getRes.data.count);

    // Test 3: Create transaction
    console.log('\n3. Testing POST /api/transactions...');
    const postData = {
      description: 'Test Transaction API',
      amount: 25.50,
      date: new Date().toISOString(),
      type: 'expense',
    };
    const postRes = await axios.post(`${API_URL}/transactions`, postData);
    console.log('   ✅ Success:', postRes.data.success);
    console.log('   📁 Category:', postRes.data.analysis?.predictedCategory);
    console.log('   ⚡ Confidence:', postRes.data.analysis?.confidence);

    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is running (npm start)');
    console.log('   2. MongoDB is connected');
    console.log('   3. FastAPI is running (optional, for AI features)\n');
  }
}

testAPI();
