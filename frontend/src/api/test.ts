/**
 * API Test Utility
 * Test all API endpoints to verify client is working
 */

import apiClient from './client';
import * as authAPI from './auth';
import * as tasksAPI from './tasks';
import * as storyAPI from './story';
import * as characterAPI from './character';

/**
 * Test API health endpoint
 */
export const testHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    console.log('✅ Health check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
};

/**
 * Test API info endpoint
 */
export const testAPIInfo = async () => {
  try {
    const response = await apiClient.get('/');
    console.log('✅ API Info:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Info failed:', error);
    return false;
  }
};

/**
 * Test authentication flow
 */
export const testAuthFlow = async () => {
  console.log('\n🔐 Testing Authentication Flow...\n');

  try {
    // Test registration
    console.log('1️⃣ Testing Registration...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test@123456',
      username: `testuser${Date.now()}`,
      characterName: 'Test Hero',
    };
    
    const registerResponse = await authAPI.register(registerData);
    console.log('✅ Registration successful:', {
      user: registerResponse.data.user.username,
      level: registerResponse.data.user.level,
    });

    // Test getting current user
    console.log('\n2️⃣ Testing Get Current User...');
    const currentUser = await authAPI.getCurrentUser();
    console.log('✅ Current user:', {
      username: currentUser.username,
      characterName: currentUser.characterName,
      level: currentUser.level,
    });

    // Test logout
    console.log('\n3️⃣ Testing Logout...');
    await authAPI.logout();
    console.log('✅ Logout successful');

    // Test login
    console.log('\n4️⃣ Testing Login...');
    const loginResponse = await authAPI.login({
      email: registerData.email,
      password: registerData.password,
    });
    console.log('✅ Login successful:', {
      user: loginResponse.data.user.username,
    });

    return true;
  } catch (error: any) {
    console.error('❌ Auth flow failed:', error.message || error);
    return false;
  }
};

/**
 * Test task endpoints
 */
export const testTaskFlow = async () => {
  console.log('\n✅ Testing Task Flow...\n');

  try {
    // Create a task
    console.log('1️⃣ Creating a task...');
    const newTask = await tasksAPI.createTask({
      title: 'Morning Workout',
      description: 'Do 30 pushups and 30 situps',
      type: 'DAILY',
      difficulty: 'MEDIUM',
      category: 'Fitness',
    });
    console.log('✅ Task created:', newTask.title);

    // Get all tasks
    console.log('\n2️⃣ Getting all tasks...');
    const tasks = await tasksAPI.getTasks();
    console.log(`✅ Found ${tasks.length} task(s)`);

    // Complete the task
    console.log('\n3️⃣ Completing task...');
    const completedResult = await tasksAPI.completeTask(newTask.id);
    console.log('✅ Task completed! XP gained:', completedResult.data.xpGained);
    if (completedResult.data.leveledUp) {
      console.log('🎉 LEVEL UP! New level:', completedResult.data.newLevel);
    }

    // Get task stats
    console.log('\n4️⃣ Getting task stats...');
    const stats = await tasksAPI.getTaskStats();
    console.log('✅ Task stats:', {
      total: stats.total,
      completed: stats.completed,
      xpEarned: stats.xpEarned,
    });

    return true;
  } catch (error: any) {
    console.error('❌ Task flow failed:', error.message || error);
    return false;
  }
};

/**
 * Test story endpoints
 */
export const testStoryFlow = async () => {
  console.log('\n📖 Testing Story Flow...\n');

  try {
    // Create a story arc
    console.log('1️⃣ Creating story arc...');
    const story = await storyAPI.createStoryArc({
      characterName: 'Test Hero',
      characterLevel: 1,
      characterClass: 'Warrior',
    });
    console.log('✅ Story created:', story.title);
    console.log('📚 Chapter 1:', story.chapterData);

    // Get all stories
    console.log('\n2️⃣ Getting all stories...');
    const stories = await storyAPI.getStories();
    console.log(`✅ Found ${stories.length} story/stories`);

    return true;
  } catch (error: any) {
    console.error('❌ Story flow failed:', error.message || error);
    return false;
  }
};

/**
 * Test character endpoints
 */
export const testCharacterFlow = async () => {
  console.log('\n⚔️ Testing Character Flow...\n');

  try {
    // Get character profile
    console.log('1️⃣ Getting character profile...');
    const profile = await characterAPI.getCharacterProfile();
    console.log('✅ Character profile:', {
      name: profile.user.characterName,
      level: profile.user.level,
      xp: profile.user.xp,
      inventoryItems: profile.inventory.length,
    });

    // Get character stats
    console.log('\n2️⃣ Getting character stats...');
    const stats = await characterAPI.getCharacterStats();
    console.log('✅ Character stats:', stats);

    return true;
  } catch (error: any) {
    console.error('❌ Character flow failed:', error.message || error);
    return false;
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🧪 Starting API Tests...\n');
  console.log('='.repeat(50));

  const results = {
    health: false,
    apiInfo: false,
    auth: false,
    tasks: false,
    story: false,
    character: false,
  };

  // Test health
  results.health = await testHealth();
  
  // Test API info
  results.apiInfo = await testAPIInfo();

  // Test auth flow (this sets up token for other tests)
  results.auth = await testAuthFlow();

  if (results.auth) {
    // Only run these if auth succeeded
    results.tasks = await testTaskFlow();
    results.story = await testStoryFlow();
    results.character = await testCharacterFlow();
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:\n');
  console.log(`Health Check: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Info: ${results.apiInfo ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${results.auth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Tasks: ${results.tasks ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Story: ${results.story ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Character: ${results.character ? '✅ PASS' : '❌ FAIL'}`);

  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\n🎯 Total: ${passCount}/${totalCount} tests passed`);
  console.log('='.repeat(50));

  return results;
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTest = {
    runAll: runAllTests,
    testHealth,
    testAPIInfo,
    testAuth: testAuthFlow,
    testTasks: testTaskFlow,
    testStory: testStoryFlow,
    testCharacter: testCharacterFlow,
  };
}
