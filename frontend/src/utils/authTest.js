/**
 * Authentication Testing Utilities
 * Test the login system with created user accounts
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');

/**
 * Test authentication with demo credentials
 */
export async function testAuthenticationFlow() {
  const testCredentials = [
    { email: 'admin@company.com', password: 'password', expectedRole: 'admin' },
    { email: 'user@company.com', password: 'password', expectedRole: 'user' },
    { email: 'phoungchanphattraseven@gmail.com', password: 'YourAdminy7tl', expectedRole: 'admin' }
  ];

  console.log('🔑 Testing authentication system...');
  
  for (const creds of testCredentials) {
    try {
      console.log(`Testing: ${creds.email}`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        const userData = result.data;
        console.log(`✅ ${creds.email}: Role=${userData.role}, Name=${userData.name}`);
        
        if (userData.role !== creds.expectedRole) {
          console.warn(`⚠️ Role mismatch: expected ${creds.expectedRole}, got ${userData.role}`);
        }
      } else {
        console.error(`❌ ${creds.email}: ${result.detail || result.message || 'Login failed'}`);
      }
    } catch (error) {
      console.error(`💥 ${creds.email}: Network error - ${error.message}`);
    }
  }
  
  console.log('🏁 Authentication test completed');
}

/**
 * Test invalid credentials
 */
export async function testInvalidCredentials() {
  const invalidTests = [
    { email: 'nonexistent@test.com', password: 'password', description: 'Non-existent user' },
    { email: 'admin@company.com', password: 'wrongpassword', description: 'Wrong password' },
    { email: '', password: 'password', description: 'Empty email' }
  ];

  console.log('🚫 Testing invalid credentials...');
  
  for (const test of invalidTests) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.log(`✅ ${test.description}: Correctly rejected (${response.status})`);
      } else {
        console.warn(`⚠️ ${test.description}: Unexpectedly allowed login`);
      }
    } catch (error) {
      console.error(`💥 ${test.description}: Network error - ${error.message}`);
    }
  }
  
  console.log('🏁 Invalid credentials test completed');
}

/**
 * Test user creation and login flow
 */
export async function testUserCreationFlow() {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'testpass123',
    role: 'user',
    status: 'active'
  };

  console.log('👤 Testing user creation and login flow...');
  
  try {
    // Test user creation
    console.log('Creating test user...');
    const createResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ User created successfully');
      
      // Test login with created user
      console.log('Testing login with created user...');
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok && loginResult.status === 'success') {
        console.log('✅ Login with created user successful');
        console.log(`   User: ${loginResult.data.name} (${loginResult.data.role})`);
      } else {
        console.error('❌ Login with created user failed:', loginResult.detail);
      }
      
      // Clean up: delete test user
      if (createResult.data && createResult.data[0]) {
        const userId = createResult.data[0].id;
        await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
        console.log('🧹 Test user cleaned up');
      }
    } else {
      console.log('ℹ️ User creation test skipped (demo mode or error):', createResult.message);
    }
  } catch (error) {
    console.error('💥 User creation flow test failed:', error.message);
  }
  
  console.log('🏁 User creation flow test completed');
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.authTest = {
    testAuthenticationFlow,
    testInvalidCredentials,
    testUserCreationFlow
  };
}