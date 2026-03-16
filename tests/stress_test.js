const { TimerEngine, TimerType } = require('../src/timerEngine.js');
const fs = require('fs');
const path = require('path');

console.log('=== JPred Stress Test ===\n');

const tempPath = path.join(process.env.TEMP || '/tmp', 'jpred_stress_' + Date.now() + '.json');

// Test 1: Progress > 100%
console.log('Test 1: Progress exceeding 100%...');
const engine = new TimerEngine(tempPath);
engine.setGoal(TimerType.JOB_SEARCH, 1); // 1 minute goal

// Simulate 5 minutes (500% progress)
engine.timers[TimerType.JOB_SEARCH].totalTime = 300;

const progress = engine.getProgress(TimerType.JOB_SEARCH);
console.log('  Progress:', progress, '(expected: 5)');
console.log('  Progress >= 1:', progress >= 1, '(expected: true)');

// Test progress bar calculation
const percent = Math.min(Math.round(progress * 100), 100);
const filled = Math.min(Math.floor(progress * 20), 20);
const empty = 20 - filled;

console.log('  Progress bar percent:', percent, '(expected: 100)');
console.log('  Filled blocks:', filled, '(expected: 20)');
console.log('  Empty blocks:', empty, '(expected: 0)');

if (percent === 100 && filled === 20 && empty === 0) {
  console.log('  ✓ PASS: No crash with >100% progress\n');
} else {
  console.log('  ✗ FAIL: Unexpected values\n');
}

// Test 2: Rapid start/stop cycles
console.log('Test 2: Rapid start/stop cycles...');
for (let i = 0; i < 10; i++) {
  engine.startTimer(TimerType.PRACTICE);
  engine.stopTimer(TimerType.PRACTICE);
}
const sessions = engine.getAllSessions()[TimerType.PRACTICE];
console.log('  Sessions created:', sessions.length, '(expected: 10)');
if (sessions.length === 10) {
  console.log('  ✓ PASS: Rapid cycles work\n');
} else {
  console.log('  ✗ FAIL: Session count mismatch\n');
}

// Test 3: Data corruption recovery
console.log('Test 3: Data corruption recovery...');
fs.writeFileSync(tempPath, '{ invalid json }}}');
const engine2 = new TimerEngine(tempPath);
// Should not crash, should initialize with defaults
const defaultGoal = engine2.getGoal(TimerType.JOB_SEARCH);
console.log('  Default goal after corruption:', defaultGoal, '(expected: 120)');
if (defaultGoal === 120) {
  console.log('  ✓ PASS: Corruption recovery works\n');
} else {
  console.log('  ✗ FAIL: Corruption recovery failed\n');
}

// Test 4: Multiple saves
console.log('Test 4: Multiple rapid saves...');
for (let i = 0; i < 50; i++) {
  engine.startTimer(TimerType.UPSKILLING);
  engine.save();
}
console.log('  ✓ PASS: Multiple saves work\n');

// Cleanup
try {
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
  const backups = fs.readdirSync(path.dirname(tempPath))
    .filter(f => f.includes('jpred_stress') && f.includes('.backup'));
  backups.forEach(b => fs.unlinkSync(path.join(path.dirname(tempPath), b)));
} catch (e) {}

console.log('=== Stress Test Complete ===');
