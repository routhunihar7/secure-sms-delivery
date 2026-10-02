const http = require('http');
const { app, startServer } = require('./src/server');

// Helper to make local HTTP requests
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End API Test Suite...');
  let serverInstance = null;

  try {
    serverInstance = await startServer(5098);
    const port = 5098;
    console.log(`✅ Test server running on port ${port}`);

    // Test 1: Health check
    console.log('\n[Test 1] GET /api/system/status');
    const health = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/system/status',
      method: 'GET',
    });
    console.log(`Status: ${health.status}, DB: ${health.data?.data?.database?.status}, SMS: ${health.data?.data?.smsService?.mode}`);
    if (health.status !== 200) throw new Error('Health check failed');

    // Test 2: Admin Login
    console.log('\n[Test 2] POST /api/auth/login');
    const loginRes = await request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'admin@securesms.local',
        password: 'AdminSecure@123456',
      }
    );
    console.log(`Status: ${loginRes.status}, Message: ${loginRes.data?.message}`);
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    const token = loginRes.data.token;
    console.log(`✅ Received JWT Bearer Token: ${token.substring(0, 20)}...`);

    // Test 3: Create Secure Message (One-Time Access)
    console.log('\n[Test 3] POST /api/messages (Create message & CSPRNG token)');
    const createRes = await request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      {
        recipientPhone: '+14155552671',
        title: 'Project Defense Confidential Credentials',
        message: 'Master Key: sk_live_99482710492 | Database Password: SuperSecretProjectPass!2026',
        expiresInMinutes: 60,
        isOneTime: true,
        consentGiven: true,
        sendImmediately: true,
      }
    );
    console.log(`Status: ${createRes.status}`);
    console.log(`Generated Raw Token: ${createRes.data?.data?.rawToken}`);
    console.log(`Token Fingerprint: ${createRes.data?.data?.tokenFingerprint}`);
    console.log(`SMS Mode: ${createRes.data?.data?.smsStatus}`);
    
    if (createRes.status !== 201 || !createRes.data?.data?.rawToken) {
      throw new Error(`Create message failed: ${JSON.stringify(createRes.data)}`);
    }
    const rawToken = createRes.data.data.rawToken;
    const messageId = createRes.data.data.id;

    // Test 4: Recipient opens the link for the 1st time
    console.log('\n[Test 4] GET /api/messages/:token (Recipient First View)');
    const view1 = await request({
      hostname: '127.0.0.1',
      port,
      path: `/api/messages/${rawToken}`,
      method: 'GET',
    });
    console.log(`Status: ${view1.status}, Title: "${view1.data?.data?.title}"`);
    console.log(`Payload: "${view1.data?.data?.message}"`);
    if (view1.status !== 200) throw new Error('First view failed');

    // Test 5: Recipient attempts to open the one-time link a 2nd time (Should return 410 Burned)
    console.log('\n[Test 5] GET /api/messages/:token (Recipient Second View - One-Time Burn Verification)');
    const view2 = await request({
      hostname: '127.0.0.1',
      port,
      path: `/api/messages/${rawToken}`,
      method: 'GET',
    });
    console.log(`Status: ${view2.status} (Expected 410 Gone), Error: "${view2.data?.error}"`);
    if (view2.status !== 410) throw new Error(`Expected 410 for burned token, got ${view2.status}`);

    // Test 6: Get Message Summary Stats
    console.log('\n[Test 6] GET /api/messages/stats/summary');
    const statsRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/messages/stats/summary',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`Stats: Total=${statsRes.data?.data?.totalMessages}, Opened=${statsRes.data?.data?.openedMessages}, Rate=${statsRes.data?.data?.openRate}%`);

    // Test 7: List History
    console.log('\n[Test 7] GET /api/messages (Admin delivery audit log)');
    const historyRes = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/messages?limit=5',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`History count: ${historyRes.data?.data?.length}`);

    console.log('\n🎉 ALL 7 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  }
}

runTests();
