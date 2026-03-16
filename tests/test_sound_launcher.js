const SoundManager = require('../src/soundManager.js');
const { AppLauncher } = require('../src/appLauncher.js');

console.log('=== Testing Sound and App Launcher ===\n');

// Test Sound Manager
console.log('Test 1: Sound Manager');
const soundManager = new SoundManager();
console.log('  Playing test beep...');
soundManager.playBeep();

setTimeout(() => {
  console.log('  Playing success sound...');
  soundManager.playSuccessSound();
}, 1000);

// Test App Launcher
setTimeout(() => {
  console.log('\nTest 2: App Launcher');
  const launcher = new AppLauncher();
  
  console.log('  Testing Job Search URLs...');
  launcher.openForTimer('job_search');
  
  setTimeout(() => {
    console.log('  Testing Practice URLs...');
    launcher.openForTimer('practice');
  }, 1000);
  
  setTimeout(() => {
    console.log('  Testing Upskilling (VS Code)...');
    launcher.openForTimer('upskilling');
  }, 2000);
}, 2000);

setTimeout(() => {
  console.log('\n=== Tests Complete ===');
  process.exit(0);
}, 5000);
