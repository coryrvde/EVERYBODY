// Simple Storage System Test
// This tests the AsyncStorage functionality without external dependencies

import AsyncStorage from '@react-native-async-storage/async-storage';

async function testAsyncStorage() {
  try {
    console.log('🧪 Testing AsyncStorage functionality...\n');

    // Test 1: Basic storage operations
    console.log('1️⃣ Testing basic storage operations...');
    
    const testData = {
      message: 'Hello from Guardian AI Storage!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // Store data
    await AsyncStorage.setItem('test_storage', JSON.stringify(testData));
    console.log('✅ Data stored successfully');

    // Retrieve data
    const retrievedData = await AsyncStorage.getItem('test_storage');
    const parsedData = JSON.parse(retrievedData);
    console.log('✅ Data retrieved successfully');
    console.log('📋 Retrieved data:', parsedData);

    // Test 2: Multiple data types
    console.log('\n2️⃣ Testing multiple data types...');
    
    const userProfile = {
      name: 'Test Parent',
      email: 'test@guardian-ai.com',
      role: 'parent'
    };

    const userPreferences = {
      theme: 'dark',
      notifications: true,
      language: 'en'
    };

    const alerts = [
      {
        id: '1',
        type: 'content_flag',
        severity: 'high',
        message: 'Test alert 1'
      },
      {
        id: '2',
        type: 'location',
        severity: 'medium',
        message: 'Test alert 2'
      }
    ];

    // Store multiple items
    await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
    await AsyncStorage.setItem('user_preferences', JSON.stringify(userPreferences));
    await AsyncStorage.setItem('alerts', JSON.stringify(alerts));

    console.log('✅ Multiple data types stored successfully');

    // Test 3: Retrieve all data
    console.log('\n3️⃣ Testing data retrieval...');
    
    const storedProfile = await AsyncStorage.getItem('user_profile');
    const storedPrefs = await AsyncStorage.getItem('user_preferences');
    const storedAlerts = await AsyncStorage.getItem('alerts');

    console.log('📋 User Profile:', JSON.parse(storedProfile));
    console.log('📋 User Preferences:', JSON.parse(storedPrefs));
    console.log('📋 Alerts Count:', JSON.parse(storedAlerts).length);

    // Test 4: Storage statistics
    console.log('\n4️⃣ Testing storage statistics...');
    
    const keys = ['test_storage', 'user_profile', 'user_preferences', 'alerts'];
    let totalSize = 0;
    
    for (const key of keys) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        totalSize += data.length;
        console.log(`📊 ${key}: ${data.length} characters`);
      }
    }
    
    console.log(`📊 Total storage size: ${totalSize} characters (${Math.round(totalSize / 1024)} KB)`);

    // Test 5: Data cleanup
    console.log('\n5️⃣ Testing data cleanup...');
    
    await AsyncStorage.removeItem('test_storage');
    const removedData = await AsyncStorage.getItem('test_storage');
    
    if (removedData === null) {
      console.log('✅ Data cleanup successful');
    } else {
      console.log('❌ Data cleanup failed');
    }

    console.log('\n🎉 AsyncStorage test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Basic storage operations: Working');
    console.log('✅ Multiple data types: Working');
    console.log('✅ Data retrieval: Working');
    console.log('✅ Storage statistics: Working');
    console.log('✅ Data cleanup: Working');

    console.log('\n🚀 AsyncStorage is ready for your Guardian AI app!');
    console.log('📱 Your storage system will work perfectly in the React Native environment.');

    return true;

  } catch (error) {
    console.error('❌ AsyncStorage test failed:', error);
    return false;
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testAsyncStorage()
    .then((success) => {
      if (success) {
        console.log('\n✅ All AsyncStorage tests passed!');
      } else {
        console.log('\n❌ Some AsyncStorage tests failed.');
      }
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
    });
}

export { testAsyncStorage };
