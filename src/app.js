#!/usr/bin/env node
/**
 * JPred - Job Hunting Time Tracker
 * A modern TUI for tracking job hunting activities
 */

const blessed = require('blessed');
const { TimerEngine, TimerType, TIMER_LABELS, TIMER_ICONS } = require('./timerEngine.js');
const SoundManager = require('./soundManager.js');
const { AppLauncher } = require('./appLauncher.js');

// Create screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'JPred - Job Hunting Time Tracker',
  fullUnicode: true
});

// Create timer engine
const engine = new TimerEngine();

// Create sound manager
const soundManager = new SoundManager();

// Create app launcher
const appLauncher = new AppLauncher();

// Track goal completion state
const goalCompleted = {
  [TimerType.JOB_SEARCH]: false,
  [TimerType.PRACTICE]: false,
  [TimerType.UPSKILLING]: false
};

// Format time helper
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Format datetime helper
function formatDateTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Create main layout
const mainBox = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  autoPadding: true
});

screen.append(mainBox);

// Header
const header = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: 3,
  content: '          💼  JPRED - Job Hunting Time Tracker  💼          ',
  style: {
    bg: 'black',
    fg: 'cyan'
  },
  border: {
    type: 'line',
    fg: 'cyan'
  }
});
mainBox.append(header);

// Timer cards container
const timersBox = blessed.listbar({
  top: 3,
  left: 0,
  width: '100%',
  height: 14,
  autoCommandKeys: false,
  mouseKeys: [0, 1, 2],
  style: {
    prefix: { fg: 'cyan' },
    selected: { fg: 'cyan', bg: 'blue', bold: true }
  }
});

// Create individual timer boxes
const timerBoxes = {};
const timerDisplays = {};
const timerStatus = {};
const timerProgress = {};
const timerToday = {};
const timerTitles = {};

const timerConfigs = [
  { type: TimerType.JOB_SEARCH, top: 4, left: 2, width: 30, height: 9, key: '1' },
  { type: TimerType.PRACTICE, top: 4, left: 34, width: 30, height: 9, key: '2' },
  { type: TimerType.UPSKILLING, top: 4, left: 66, width: 30, height: 9, key: '3' }
];

timerConfigs.forEach(config => {
  const { type, top, left, width, height, key } = config;
  
  // Timer card box
  const box = blessed.box({
    top: top,
    left: left,
    width: width,
    height: height,
    border: {
      type: 'line',
      fg: 'gray'
    },
    style: {
      border: { fg: 'gray' }
    }
  });
  mainBox.append(box);
  timerBoxes[type] = box;
  
  // Title
  const title = blessed.text({
    top: 0,
    left: 2,
    width: width - 4,
    height: 1,
    align: 'center',
    content: `${TIMER_ICONS[type]} ${TIMER_LABELS[type]} [${key}]`,
    style: {
      bold: true,
      fg: 'white'
    }
  });
  box.append(title);
  timerTitles[type] = title;

  // Time display
  const display = blessed.text({
    top: 2,
    left: 0,
    width: width,
    height: 1,
    align: 'center',
    content: '00:00:00',
    style: {
      fg: 'cyan',
      bold: true
    }
  });
  box.append(display);
  timerDisplays[type] = display;
  
  // Progress bar (using text)
  const progress = blessed.text({
    top: 4,
    left: 2,
    width: width - 4,
    height: 1,
    align: 'center',
    content: '[██████████░░░░░░░░░░] 50%',
    style: {
      fg: 'green'
    }
  });
  box.append(progress);
  timerProgress[type] = progress;
  
  // Status
  const status = blessed.text({
    top: 5,
    left: 0,
    width: width,
    height: 1,
    align: 'center',
    content: '○ Stopped',
    style: {
      fg: 'gray'
    }
  });
  box.append(status);
  timerStatus[type] = status;
  
  // Today's time
  const today = blessed.text({
    top: 6,
    left: 0,
    width: width,
    height: 1,
    align: 'center',
    content: 'Today: 00:00/120m',
    style: {
      fg: 'gray'
    }
  });
  box.append(today);
  timerToday[type] = today;
  
  // Buttons row
  const buttons = blessed.text({
    top: 8,
    left: 0,
    width: width,
    height: 1,
    align: 'center',
    content: '[▶] Start  [⏹] Stop  [↻] Reset  [g] Goal',
    style: {
      fg: 'white'
    }
  });
  box.append(buttons);
});

// Stats panel
const statsBox = blessed.box({
  top: 14,
  left: 2,
  width: '100%-4',
  height: 5,
  border: {
    type: 'line',
    fg: 'blue'
  },
  style: {
    border: { fg: 'blue' }
  }
});
mainBox.append(statsBox);

const statsTitle = blessed.text({
  top: 0,
  left: 2,
  content: '📊 Today\'s Summary',
  style: {
    bold: true,
    fg: 'blue'
  }
});
statsBox.append(statsTitle);

const statsContent = blessed.text({
  top: 1,
  left: 2,
  width: '100%-4',
  height: 4,
  content: ''
});
statsBox.append(statsContent);

// History box (hidden by default)
const historyBox = blessed.box({
  top: 15,
  left: 2,
  width: '100%-4',
  height: '100%-18',
  border: {
    type: 'line',
    fg: 'cyan'
  },
  style: {
    border: { fg: 'cyan' }
  },
  hidden: true
});
mainBox.append(historyBox);

const historyTitle = blessed.text({
  top: 0,
  left: 2,
  content: '📜 Session History (Press h to close)',
  style: {
    bold: true,
    fg: 'cyan'
  }
});
historyBox.append(historyTitle);

const historyContent = blessed.text({
  top: 1,
  left: 2,
  width: '100%-4',
  height: '100%-2',
  content: '',
  tags: true
});
historyBox.append(historyContent);

// Footer
const footer = blessed.text({
  bottom: 0,
  left: 0,
  width: '100%',
  height: 1,
  align: 'center',
  content: '[1][2][3] Select | [Space] Start | [s] +Resources | [r] Reset | [g] Goal | [h] History | [q] Quit',
  style: {
    fg: 'cyan'
  }
});
mainBox.append(footer);

// Selected timer
let selectedTimer = TimerType.JOB_SEARCH;
let showHistory = false;

// Update progress bar visual
function updateProgressBar(type) {
  const progress = engine.getProgress(type);
  const percent = Math.min(Math.round(progress * 100), 100);
  const filled = Math.min(Math.floor(progress * 20), 20);
  const empty = 20 - filled;

  let barColor = 'green';
  if (progress < 0.3) barColor = 'red';
  else if (progress < 0.7) barColor = 'yellow';

  const bar = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));
  timerProgress[type].setContent('[' + bar + '] ' + percent + '%');
  timerProgress[type].style.fg = barColor;
}

// Update all displays
function updateDisplays() {
  const keyMap = {
    [TimerType.JOB_SEARCH]: '1',
    [TimerType.PRACTICE]: '2',
    [TimerType.UPSKILLING]: '3'
  };

  Object.values(TimerType).forEach(type => {
    const elapsed = engine.getElapsedTime(type);
    const isRunning = engine.isRunning(type);
    const today = engine.getTodayTotal(type);
    const goal = engine.getGoal(type);
    const key = keyMap[type];
    const progress = engine.getProgress(type);

    // Check for goal completion
    if (progress >= 1.0 && isRunning && !goalCompleted[type]) {
      goalCompleted[type] = true;
      soundManager.playSuccessSound();
      soundManager.startGoalAlert(type);
      
      // Show notification
      notify(`🎉 Goal completed for ${TIMER_LABELS[type]}!`);
    }

    // Update time display
    timerDisplays[type].setContent(formatTime(elapsed));
    if (isRunning) {
      timerDisplays[type].style.fg = 'green';
    } else {
      timerDisplays[type].style.fg = 'cyan';
    }

    // Update status
    if (isRunning) {
      timerStatus[type].setContent('● Running');
      timerStatus[type].style.fg = 'green';
    } else {
      timerStatus[type].setContent('○ Stopped');
      timerStatus[type].style.fg = 'gray';
    }

    // Update today's time
    timerToday[type].setContent('Today: ' + formatTime(today) + '/' + goal + 'm');

    // Update progress bar
    updateProgressBar(type);

    // Update border for selected timer
    if (type === selectedTimer) {
      timerBoxes[type].style.border.fg = 'cyan';
      timerTitles[type].setContent(TIMER_ICONS[type] + ' ' + TIMER_LABELS[type] + ' [SELECTED]');
      timerTitles[type].style.fg = 'cyan';
      timerTitles[type].style.bold = true;
    } else {
      timerBoxes[type].style.border.fg = 'gray';
      timerTitles[type].setContent(TIMER_ICONS[type] + ' ' + TIMER_LABELS[type] + ' [' + key + ']');
      timerTitles[type].style.fg = 'white';
      timerTitles[type].style.bold = false;
    }
  });

  // Update stats
  updateStats();

  try {
    screen.render();
  } catch (renderError) {
    console.error('Render error:', renderError);
  }
}

// Update stats panel
function updateStats() {
  let stats = '';
  let total = 0;

  Object.values(TimerType).forEach(type => {
    const today = engine.getTodayTotal(type);
    const goal = engine.getGoal(type);
    const progress = engine.getProgress(type);
    const percent = Math.min(Math.round(progress * 100), 100);
    total += today;

    const icon = progress >= 1 ? '✓' : '○';
    const color = progress >= 1 ? 'green' : 'white';

    stats += icon + ' ' + TIMER_LABELS[type] + ': ' + formatTime(today) + '/' + goal + 'm (' + percent + '%)    ';
  });

  stats += '\n\n⏱ Total Today: ' + formatTime(total);
  statsContent.setContent(stats);
  statsContent.style.fg = 'cyan';
}

// Notification box
let notificationBox = null;
let notificationTimeout = null;

function notify(message) {
  // Remove existing notification
  if (notificationBox) {
    mainBox.remove(notificationBox);
  }
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // Create notification
  notificationBox = blessed.box({
    top: 'center',
    left: 'center',
    width: message.length + 4,
    height: 3,
    content: message,
    style: {
      bg: 'green',
      fg: 'white'
    },
    border: {
      type: 'line',
      fg: 'green'
    }
  });

  mainBox.append(notificationBox);
  screen.render();

  // Auto-remove after 3 seconds
  notificationTimeout = setTimeout(() => {
    if (notificationBox) {
      mainBox.remove(notificationBox);
      notificationBox = null;
      screen.render();
    }
  }, 3000);
}

// Update history view
function updateHistory() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  const allSessions = engine.getAllSessions();
  const todaySessions = [];
  const allList = [];

  Object.values(TimerType).forEach(type => {
    (allSessions[type] || []).forEach(s => {
      const entry = { type, ...s };
      allList.push(entry);
      if (s.startTime >= todayStart) {
        todaySessions.push(entry);
      }
    });
  });

  todaySessions.sort((a, b) => b.startTime - a.startTime);
  allList.sort((a, b) => b.startTime - a.startTime);

  let content = "Today's Sessions (" + todaySessions.length + ")\n";
  content += '='.repeat(40) + '\n\n';

  if (todaySessions.length === 0) {
    content += 'No sessions today. Start a timer!\n\n';
  } else {
    todaySessions.slice(0, 8).forEach(s => {
      content += formatDateTime(s.startTime) + '  ';
      content += formatTime(s.duration) + '  ';
      content += TIMER_LABELS[s.type] + '\n';
    });
  }

  content += '\nAll Time Sessions (' + allList.length + ')\n';
  content += '='.repeat(40) + '\n\n';

  if (allList.length === 0) {
    content += 'No sessions recorded yet.\n';
  } else {
    allList.slice(0, 8).forEach(s => {
      content += formatDateTime(s.startTime) + '  ';
      content += formatTime(s.duration) + '  ';
      content += TIMER_LABELS[s.type] + '\n';
    });
  }

  historyContent.setContent(content);
}

// Goal input modal
let goalInput = '';
let showingGoalModal = false;

function showGoalModal() {
  showingGoalModal = true;
  goalInput = '';
  
  const modal = blessed.box({
    top: 'center',
    left: 'center',
    width: 50,
    height: 8,
    border: {
      type: 'line',
      fg: 'blue'
    },
    style: {
      bg: 'black',
      border: { fg: 'blue' }
    }
  });
  
  const title = blessed.text({
    top: 0,
    left: 2,
    content: `Set Goal for ${TIMER_LABELS[selectedTimer]}`,
    style: { bold: true, fg: 'blue' }
  });
  modal.append(title);
  
  const label = blessed.text({
    top: 2,
    left: 2,
    content: 'Enter minutes:',
    style: { fg: 'white' }
  });
  modal.append(label);
  
  const inputDisplay = blessed.text({
    top: 3,
    left: 2,
    content: '> _',
    style: { fg: 'cyan', bold: true }
  });
  modal.append(inputDisplay);
  
  const hint = blessed.text({
    top: 5,
    left: 2,
    content: 'Enter to save, Esc to cancel',
    style: { fg: 'gray' }
  });
  modal.append(hint);
  
  mainBox.append(modal);
  screen.render();
  
  function handleGoalInput(ch, key) {
    if (key.name === 'escape') {
      mainBox.remove(modal);
      showingGoalModal = false;
      screen.render();
      return;
    }
    
    if (key.name === 'enter') {
      const value = parseInt(goalInput, 10);
      if (value > 0) {
        engine.setGoal(selectedTimer, value);
        updateDisplays();
      }
      mainBox.remove(modal);
      showingGoalModal = false;
      screen.render();
      return;
    }
    
    if (key.name === 'backspace') {
      goalInput = goalInput.slice(0, -1);
    } else if (ch >= '0' && ch <= '9') {
      goalInput += ch;
    }
    
    inputDisplay.setContent(`> ${goalInput}_`);
    screen.render();
  }
  
  screen.onceKey(['escape', 'enter', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace'], handleGoalInput);
}

// Handle keyboard input
screen.key(['escape', 'q', '1', '2', '3', 'space', 's', 'r', 'g', 'h', '?'], function(ch, key) {
  if (showingGoalModal) return;

  if (key.name === 'q' || key.name === 'escape') {
    // Stop all beeping
    soundManager.stopAllAlerts();
    
    // Save and exit
    Object.values(TimerType).forEach(type => {
      if (engine.isRunning(type)) {
        engine.stopTimer(type);
      }
    });
    return process.exit(0);
  }

  if (ch === 'h' || key.name === 'h') {
    showHistory = !showHistory;
    historyBox.hidden = !showHistory;
    if (showHistory) {
      updateHistory();
    }
    screen.render();
    return;
  }

  if (ch === 'g' || key.name === 'g') {
    showGoalModal();
    return;
  }

  if (key.name === 'space' || ch === ' ') {
    if (engine.isRunning(selectedTimer)) {
      engine.stopTimer(selectedTimer);
      // Stop beeping for this timer
      soundManager.stopGoalAlert(selectedTimer);
      goalCompleted[selectedTimer] = false;
    } else {
      // Default: Start timer WITHOUT opening apps/websites
      engine.startTimer(selectedTimer);
      goalCompleted[selectedTimer] = false;
      notify(`Started ${TIMER_LABELS[selectedTimer]}`);
    }
    updateDisplays();
    return;
  }

  // 's' key - Start timer AND open associated resources
  if (ch === 's' || key.name === 's') {
    if (!engine.isRunning(selectedTimer)) {
      engine.startTimer(selectedTimer);
      // Open associated app/website
      appLauncher.openForTimer(selectedTimer);
      appLauncher.markOpened(selectedTimer);
      goalCompleted[selectedTimer] = false;
      notify(`Started ${TIMER_LABELS[selectedTimer]} + resources`);
      updateDisplays();
    }
    return;
  }

  if (ch === 'r' || key.name === 'r') {
    engine.resetTimer(selectedTimer);
    updateDisplays();
    return;
  }

  if (ch === '1' || key.name === '1') {
    selectedTimer = TimerType.JOB_SEARCH;
    updateDisplays();
    return;
  }

  if (ch === '2' || key.name === '2') {
    selectedTimer = TimerType.PRACTICE;
    updateDisplays();
    return;
  }

  if (ch === '3' || key.name === '3') {
    selectedTimer = TimerType.UPSKILLING;
    updateDisplays();
    return;
  }
});

// Mouse support
screen.on('mouse', function(data) {
  if (showingGoalModal) return;
  
  // Check clicks on timer boxes
  Object.values(TimerType).forEach(type => {
    const box = timerBoxes[type];
    const pos = box.getPosition();
    
    if (data.x >= pos.left && data.x < pos.left + pos.width &&
        data.y >= pos.top && data.y < pos.top + pos.height) {
      selectedTimer = type;
      
      // Check button clicks (approximate positions)
      const relativeX = data.x - pos.left;
      const buttonRow = pos.top + 8;
      
      if (data.y === buttonRow) {
        if (relativeX >= 1 && relativeX <= 8) {
          // Start button
          engine.startTimer(type);
        } else if (relativeX >= 11 && relativeX <= 20) {
          // Stop button
          engine.stopTimer(type);
        } else if (relativeX >= 23 && relativeX <= 32) {
          // Reset button
          engine.resetTimer(type);
        }
      }
      
      updateDisplays();
    }
  });
});

// Auto-update every second
setInterval(() => {
  try {
    updateDisplays();
  } catch (error) {
    console.error('Update error:', error);
  }
}, 1000);

// Initial render
try {
  updateDisplays();
  screen.render();
} catch (error) {
  console.error('Initial render error:', error);
}

// Handle window resize
screen.on('resize', () => {
  try {
    screen.render();
  } catch (error) {
    console.error('Resize render error:', error);
  }
});
