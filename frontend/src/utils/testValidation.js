/**
 * testValidation.js
 * Runtime validation utilities to verify data persistence is working correctly
 */

// Check if all required localStorage keys exist and have expected structure
export function validateLocalStorageStructure() {
  const requiredKeys = [
    'app_fuel_logs',
    'app_soil_logs', 
    'app_fuel_stations',
    'app_staff',
    'app_license_plates',
    'app_drivers',
    'app_offline_queue'
  ];

  const results = {};
  let allValid = true;

  requiredKeys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data === null) {
        results[key] = { status: 'missing', data: null, error: 'Key not found' };
        allValid = false;
      } else {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          results[key] = { status: 'valid', data: parsed, count: parsed.length };
        } else {
          results[key] = { status: 'invalid', data: parsed, error: 'Not an array' };
          allValid = false;
        }
      }
    } catch (error) {
      results[key] = { status: 'error', data: null, error: error.message };
      allValid = false;
    }
  });

  return { allValid, results };
}

// Test the offline queue functionality
export function testOfflineQueue() {
  const queueData = localStorage.getItem('app_offline_queue');
  if (!queueData) {
    return { status: 'empty', message: 'No offline queue found' };
  }

  try {
    const queue = JSON.parse(queueData);
    if (!Array.isArray(queue)) {
      return { status: 'invalid', message: 'Queue is not an array' };
    }

    const hasValidStructure = queue.every(item => 
      item.id && item.type && item.url && item.method && item.timestamp
    );

    return {
      status: hasValidStructure ? 'valid' : 'invalid',
      count: queue.length,
      message: hasValidStructure 
        ? `${queue.length} items in offline queue with valid structure`
        : 'Some queue items have invalid structure'
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// Simulate adding test data to verify persistence
export function addTestData() {
  const testFuelLog = {
    id: `test-fuel-${Date.now()}`,
    description: 'Test fuel log entry',
    driver_name: 'Test Driver',
    license_plate: 'TEST-123',
    refill_liters: 50,
    oil_in: 0,
    time_in: new Date().toISOString(),
    shift: 'Morning',
    created_at: new Date().toISOString()
  };

  const testSoilLog = {
    id: `test-soil-${Date.now()}`,
    station_name: 'Test Station',
    trip_count: 5,
    cubic_meters_per_trip: 10,
    time_start: '08:00',
    time_end: '12:00',
    log_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  try {
    // Add to fuel logs
    const fuelLogs = JSON.parse(localStorage.getItem('app_fuel_logs') || '[]');
    fuelLogs.unshift(testFuelLog);
    localStorage.setItem('app_fuel_logs', JSON.stringify(fuelLogs));

    // Add to soil logs  
    const soilLogs = JSON.parse(localStorage.getItem('app_soil_logs') || '[]');
    soilLogs.unshift(testSoilLog);
    localStorage.setItem('app_soil_logs', JSON.stringify(soilLogs));

    return {
      status: 'success',
      message: 'Test data added successfully',
      data: { testFuelLog, testSoilLog }
    };
  } catch (error) {
    return {
      status: 'error', 
      message: error.message
    };
  }
}

// Clean up test data
export function cleanupTestData() {
  try {
    const fuelLogs = JSON.parse(localStorage.getItem('app_fuel_logs') || '[]');
    const soilLogs = JSON.parse(localStorage.getItem('app_soil_logs') || '[]');

    const cleanedFuel = fuelLogs.filter(log => !log.id.startsWith('test-fuel-'));
    const cleanedSoil = soilLogs.filter(log => !log.id.startsWith('test-soil-'));

    localStorage.setItem('app_fuel_logs', JSON.stringify(cleanedFuel));
    localStorage.setItem('app_soil_logs', JSON.stringify(cleanedSoil));

    return {
      status: 'success',
      message: `Cleaned up test data. Removed ${fuelLogs.length - cleanedFuel.length} fuel logs and ${soilLogs.length - cleanedSoil.length} soil logs.`
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

// Comprehensive data persistence test
export function runComprehensiveTest() {
  console.log('🧪 Running comprehensive data persistence test...');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: localStorage structure
  console.log('Test 1: Validating localStorage structure...');
  results.tests.localStorage = validateLocalStorageStructure();

  // Test 2: Offline queue
  console.log('Test 2: Testing offline queue...');
  results.tests.offlineQueue = testOfflineQueue();

  // Test 3: Add test data
  console.log('Test 3: Adding test data...');
  results.tests.addData = addTestData();

  // Test 4: Verify data persistence after adding
  console.log('Test 4: Verifying data was persisted...');
  const afterAdd = validateLocalStorageStructure();
  results.tests.dataAdded = {
    status: afterAdd.allValid ? 'success' : 'failed',
    fuelCount: afterAdd.results.app_fuel_logs?.count || 0,
    soilCount: afterAdd.results.app_soil_logs?.count || 0
  };

  // Test 5: Cleanup
  console.log('Test 5: Cleaning up test data...');
  results.tests.cleanup = cleanupTestData();

  // Overall result
  const allPassed = Object.values(results.tests).every(test => 
    test.status === 'success' || test.status === 'valid' || test.allValid
  );

  results.overall = {
    status: allPassed ? 'PASS' : 'FAIL',
    message: allPassed 
      ? 'All data persistence tests passed successfully!' 
      : 'Some tests failed. Check individual test results.'
  };

  console.log('🎯 Test Results:', results);
  return results;
}

// Export test utilities for console use
if (typeof window !== 'undefined') {
  window.testDataPersistence = {
    validateLocalStorageStructure,
    testOfflineQueue,
    addTestData,
    cleanupTestData,
    runComprehensiveTest
  };
}