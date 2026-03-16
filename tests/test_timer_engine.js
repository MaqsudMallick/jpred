const assert = require('assert');
const { TimerEngine, TimerType } = require('../src/timerEngine.js');
const fs = require('fs');
const path = require('path');

// Test helper - create temp data path
function createTempPath() {
  return path.join(process.env.TEMP || '/tmp', 'jpred_test_' + Date.now() + '.json');
}

// Clean up temp file
function cleanupTemp(path) {
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  } catch (e) {}
}

console.log('Running JPred Timer Engine Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✓ ' + name);
    passed++;
  } catch (error) {
    console.log('✗ ' + name);
    console.log('  Error: ' + error.message);
    failed++;
  }
}

// Test 1: Initial state
test('Initial timer states are zero', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  assert.strictEqual(engine.getElapsedTime(TimerType.JOB_SEARCH), 0);
  assert.strictEqual(engine.getElapsedTime(TimerType.PRACTICE), 0);
  assert.strictEqual(engine.getElapsedTime(TimerType.UPSKILLING), 0);
  
  cleanupTemp(tempPath);
});

// Test 2: Start timer
test('Start timer sets isRunning to true', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  engine.startTimer(TimerType.JOB_SEARCH);
  assert.strictEqual(engine.isRunning(TimerType.JOB_SEARCH), true);
  
  cleanupTemp(tempPath);
});

// Test 3: Stop timer
test('Stop timer creates session and adds time', (done) => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  engine.startTimer(TimerType.PRACTICE);
  
  setTimeout(() => {
    const session = engine.stopTimer(TimerType.PRACTICE);
    
    assert.strictEqual(engine.isRunning(TimerType.PRACTICE), false);
    assert(session !== null);
    assert(session.duration >= 0.1);
    assert(engine.getElapsedTime(TimerType.PRACTICE) >= 0.1);
    
    cleanupTemp(tempPath);
  }, 150);
});

// Test 4: Reset timer
test('Reset timer clears total time', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  // Manually set some time
  engine.timers[TimerType.UPSKILLING].totalTime = 100;
  engine.save();
  
  engine.resetTimer(TimerType.UPSKILLING);
  assert.strictEqual(engine.getElapsedTime(TimerType.UPSKILLING), 0);
  
  cleanupTemp(tempPath);
});

// Test 5: Goals
test('Set and get goals', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  engine.setGoal(TimerType.JOB_SEARCH, 60);
  assert.strictEqual(engine.getGoal(TimerType.JOB_SEARCH), 60);
  
  engine.setGoal(TimerType.PRACTICE, 90);
  assert.strictEqual(engine.getGoal(TimerType.PRACTICE), 90);
  
  cleanupTemp(tempPath);
});

// Test 6: Progress calculation
test('Progress calculation', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  engine.setGoal(TimerType.JOB_SEARCH, 60); // 60 minutes goal
  
  // Initially 0% progress
  assert.strictEqual(engine.getProgress(TimerType.JOB_SEARCH), 0);
  
  // Manually set 30 minutes (50% progress)
  engine.timers[TimerType.JOB_SEARCH].totalTime = 30 * 60;
  assert.strictEqual(engine.getProgress(TimerType.JOB_SEARCH), 0.5);
  
  cleanupTemp(tempPath);
});

// Test 7: Session history
test('Session history tracking', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  // Create multiple sessions
  for (let i = 0; i < 3; i++) {
    engine.startTimer(TimerType.PRACTICE);
    engine.stopTimer(TimerType.PRACTICE);
  }
  
  const sessions = engine.getAllSessions()[TimerType.PRACTICE];
  assert.strictEqual(sessions.length, 3);
  
  cleanupTemp(tempPath);
});

// Test 8: Persistence
test('Data persistence', () => {
  const tempPath = createTempPath();
  
  // Create engine and add data
  const engine1 = new TimerEngine(tempPath);
  engine1.startTimer(TimerType.JOB_SEARCH);
  engine1.stopTimer(TimerType.JOB_SEARCH);
  engine1.setGoal(TimerType.JOB_SEARCH, 45);
  
  // Create new engine with same path
  const engine2 = new TimerEngine(tempPath);
  
  // Verify data persisted
  assert(engine2.getElapsedTime(TimerType.JOB_SEARCH) >= 0);
  assert.strictEqual(engine2.getGoal(TimerType.JOB_SEARCH), 45);
  
  cleanupTemp(tempPath);
});

// Test 9: Today's sessions
test('Get today\'s sessions', () => {
  const tempPath = createTempPath();
  const engine = new TimerEngine(tempPath);
  
  engine.startTimer(TimerType.JOB_SEARCH);
  engine.stopTimer(TimerType.JOB_SEARCH);
  
  const todaySessions = engine.getTodaySessions(TimerType.JOB_SEARCH);
  assert(todaySessions.length >= 1);
  
  cleanupTemp(tempPath);
});

// Test 10: Format time helper
test('Format time helper', () => {
  // Test MM:SS format
  let result = formatTime(125); // 2 minutes 5 seconds
  assert.strictEqual(result, '02:05');
  
  // Test HH:MM:SS format
  result = formatTime(3661); // 1 hour 1 minute 1 second
  assert.strictEqual(result, '01:01:01');
});

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }
  return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// Summary
console.log('\n' + '='.repeat(40));
console.log('Tests: ' + (passed + failed) + ' | Passed: ' + passed + ' | Failed: ' + failed);
console.log('='.repeat(40));

process.exit(failed > 0 ? 1 : 0);
