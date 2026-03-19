#!/usr/bin/env node
/**
 * JPred - Job Hunting Time Tracker
 * A modern TUI for tracking job hunting activities
 */

const blessed = require('blessed');
const { TimerEngine, TimerType, TIMER_LABELS, TIMER_ICONS } = require('./timerEngine.js');
const SoundManager = require('./soundManager.js');
const { AppLauncher } = require('./appLauncher.js');

// ─── Screen ────────────────────────────────────────────────────────────────
const screen = blessed.screen({
  smartCSR: true,
  title: 'JPred - Job Hunting Time Tracker',
  fullUnicode: true,
  dockBorders: true,   // prevents double-drawn shared borders
  ignoreLocked: ['C-c']
});

// ─── Services ──────────────────────────────────────────────────────────────
const engine       = new TimerEngine();
const soundManager = new SoundManager();
const appLauncher  = new AppLauncher();

const goalCompleted = {
  [TimerType.JOB_SEARCH]: false,
  [TimerType.PRACTICE]:   false,
  [TimerType.UPSKILLING]: false
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    month:  '2-digit',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// ─── Root container ────────────────────────────────────────────────────────
// No autoPadding – we manage all coordinates manually so nothing shifts.
const mainBox = blessed.box({
  top:    0,
  left:   0,
  width:  '100%',
  height: '100%'
});
screen.append(mainBox);

// ─── Header (row 0, height 3) ──────────────────────────────────────────────
const header = blessed.box({
  top:    0,
  left:   0,
  width:  '100%',
  height: 3,
  align:  'center',
  valign: 'middle',
  content: '💼  JPRED  —  Job Hunting Time Tracker  💼',
  padding: { left: 1, right: 1 },
  border:  { type: 'line' },
  style: {
    fg:     'cyan',
    bold:   true,
    border: { fg: 'cyan' }
  }
});
mainBox.append(header);

// ─── Timer cards (rows 3-13, height 10) ────────────────────────────────────
// Lay out three timer cards side-by-side using percentage widths.
// Each card is ~33 % wide with small gaps handled by left offsets.

const CARD_TOP    = 3;   // directly below header border
const CARD_HEIGHT = 10;

const timerBoxes    = {};
const timerDisplays = {};
const timerStatus   = {};
const timerProgress = {};
const timerToday    = {};
const timerTitles   = {};

const timerConfigs = [
  { type: TimerType.JOB_SEARCH, left: '0%',   width: '33%-1', key: '1' },
  { type: TimerType.PRACTICE,   left: '33%',  width: '34%-1', key: '2' },
  { type: TimerType.UPSKILLING, left: '67%',  width: '33%',   key: '3' }
];

timerConfigs.forEach(({ type, left, width, key }) => {

  // Card frame
  const box = blessed.box({
    top:     CARD_TOP,
    left:    left,
    width:   width,
    height:  CARD_HEIGHT,
    padding: { top: 0, left: 1, right: 1, bottom: 0 },
    border:  { type: 'line' },
    style: {
      border: { fg: 'gray' }
    }
  });
  mainBox.append(box);
  timerBoxes[type] = box;

  // ── Title row (inside padding area, row 0 of content) ──
  const title = blessed.text({
    top:     0,
    left:    0,
    width:   '100%',
    height:  1,
    align:   'center',
    content: `${TIMER_ICONS[type]} ${TIMER_LABELS[type]}  [${key}]`,
    style:   { bold: true, fg: 'white' }
  });
  box.append(title);
  timerTitles[type] = title;

  // ── Time display (row 2) ──
  const display = blessed.text({
    top:    2,
    left:   0,
    width:  '100%',
    height: 1,
    align:  'center',
    content: '00:00',
    style:   { fg: 'cyan', bold: true }
  });
  box.append(display);
  timerDisplays[type] = display;

  // ── Progress bar (row 4) ──
  const progress = blessed.text({
    top:    4,
    left:   0,
    width:  '100%',
    height: 1,
    align:  'center',
    content: '[░░░░░░░░░░░░░░░░░░░░] 0%',
    style:   { fg: 'red' }
  });
  box.append(progress);
  timerProgress[type] = progress;

  // ── Status (row 5) ──
  const status = blessed.text({
    top:    5,
    left:   0,
    width:  '100%',
    height: 1,
    align:  'center',
    content: '○ Stopped',
    style:   { fg: 'gray' }
  });
  box.append(status);
  timerStatus[type] = status;

  // ── Today (row 6) ──
  const today = blessed.text({
    top:    6,
    left:   0,
    width:  '100%',
    height: 1,
    align:  'center',
    content: 'Today: 00:00 / 120 m',
    style:   { fg: 'gray' }
  });
  box.append(today);
  timerToday[type] = today;
});

// ─── Stats panel (row 13, height 6) ────────────────────────────────────────
const STATS_TOP    = CARD_TOP + CARD_HEIGHT;   // 13
const STATS_HEIGHT = 7;

const statsBox = blessed.box({
  top:    STATS_TOP,
  left:   0,
  width:  '100%',
  height: STATS_HEIGHT,
  border: { type: 'line' },
  style:  { border: { fg: 'blue' } }
});
mainBox.append(statsBox);

const statsTitle = blessed.text({
  top:     0,
  left:    2,
  content: '📊  Today\'s Summary',
  style:   { bold: true, fg: 'blue' }
});
statsBox.append(statsTitle);

// 4 content lines: 3 timers + total (top: 1..4)
const statsContent = blessed.text({
  top:    1,
  left:   2,
  width:  '100%-4',
  height: STATS_HEIGHT - 3,
  tags:   true,
  content: ''
});
statsBox.append(statsContent);

// ─── History panel (below stats, fills remaining space minus footer) ────────
const HISTORY_TOP = STATS_TOP + STATS_HEIGHT;

const historyBox = blessed.box({
  top:    HISTORY_TOP,
  left:   0,
  width:  '100%',
  height: '100%-' + (HISTORY_TOP + 1),  // leave 1 row for footer
  border: { type: 'line' },
  style:  { border: { fg: 'cyan' } },
  hidden: true
});
mainBox.append(historyBox);

const historyTitle = blessed.text({
  top:     0,
  left:    2,
  content: '📜  Session History  (press h to close)',
  style:   { bold: true, fg: 'cyan' }
});
historyBox.append(historyTitle);

const historyContent = blessed.text({
  top:    2,
  left:   2,
  width:  '100%-4',
  height: '100%-3',
  tags:   true,
  content: ''
});
historyBox.append(historyContent);

// ─── Resources panel (below stats, same slot as history) ───────────────────
const resourcesBox = blessed.box({
  top:    HISTORY_TOP,
  left:   0,
  width:  '100%',
  height: '100%-' + (HISTORY_TOP + 1),
  border: { type: 'line' },
  style:  { border: { fg: 'yellow' } },
  hidden: true
});
mainBox.append(resourcesBox);

const resourcesTitle = blessed.text({
  top:     0,
  left:    2,
  content: '📋  Resources',
  style:   { bold: true, fg: 'yellow' }
});
resourcesBox.append(resourcesTitle);

const resourcesContent = blessed.text({
  top:    2,
  left:   2,
  width:  '100%-4',
  height: '100%-4',
  tags:   true,
  content: ''
});
resourcesBox.append(resourcesContent);

// ─── Footer (always at bottom row) ─────────────────────────────────────────
const footer = blessed.text({
  bottom: 0,
  left:   0,
  width:  '100%',
  height: 1,
  align:  'center',
  content: ' [1][2][3] Select  [Space] Start/Stop  [s] Start+Resources  [r] Reset  [g] Goal  [h] History  [e] Resources  [q] Quit ',
  style: {
    fg: 'black',
    bg: 'cyan'
  }
});
mainBox.append(footer);

// ─── State ─────────────────────────────────────────────────────────────────
let selectedTimer        = TimerType.JOB_SEARCH;
let showHistory          = false;
let showResources        = false;
let selectedResourceIdx  = 0;
let showingResourceModal = false;

// ─── Progress bar renderer ─────────────────────────────────────────────────
function updateProgressBar(type) {
  const progress = engine.getProgress(type);
  const percent  = Math.min(Math.round(progress * 100), 100);

  // Scale bar to ~40% of the card inner width (card is ~33% of screen, minus borders/padding)
  const cardInner = Math.max(20, Math.floor(screen.width * 0.33) - 6);
  const barWidth  = Math.floor(cardInner * 0.5);
  const filled    = Math.min(Math.floor(progress * barWidth), barWidth);
  const empty     = barWidth - filled;

  let barColor = 'red';
  if (progress >= 0.7) barColor = 'green';
  else if (progress >= 0.3) barColor = 'yellow';

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  timerProgress[type].setContent(`[${bar}] ${percent}%`);
  timerProgress[type].style.fg = barColor;
}

// ─── Main display update ───────────────────────────────────────────────────
function updateDisplays() {
  const keyMap = {
    [TimerType.JOB_SEARCH]: '1',
    [TimerType.PRACTICE]:   '2',
    [TimerType.UPSKILLING]: '3'
  };

  Object.values(TimerType).forEach(type => {
    const elapsed   = engine.getElapsedTime(type);
    const isRunning = engine.isRunning(type);
    const today     = engine.getTodayTotal(type);
    const goal      = engine.getGoal(type);
    const key       = keyMap[type];
    const progress  = engine.getProgress(type);

    // Goal completion
    if (progress >= 1.0 && isRunning && !goalCompleted[type]) {
      goalCompleted[type] = true;
      soundManager.playSuccessSound();
      soundManager.startGoalAlert(type);
      notify(`🎉 Goal reached: ${TIMER_LABELS[type]}!`);
    }

    // Time display
    timerDisplays[type].setContent(formatTime(elapsed));
    timerDisplays[type].style.fg = isRunning ? 'green' : 'cyan';

    // Status
    if (isRunning) {
      timerStatus[type].setContent('● Running');
      timerStatus[type].style.fg = 'green';
    } else {
      timerStatus[type].setContent('○ Stopped');
      timerStatus[type].style.fg = 'gray';
    }

    // Today
    timerToday[type].setContent(`Today: ${formatTime(today)} / ${goal}m`);

    // Progress bar
    updateProgressBar(type);

    // Border & title highlight for selected timer
    if (type === selectedTimer) {
      timerBoxes[type].style.border.fg = 'cyan';
      timerTitles[type].setContent(`${TIMER_ICONS[type]} ${TIMER_LABELS[type]}  [SELECTED]`);
      timerTitles[type].style.fg   = 'cyan';
      timerTitles[type].style.bold = true;
    } else {
      timerBoxes[type].style.border.fg = 'gray';
      timerTitles[type].setContent(`${TIMER_ICONS[type]} ${TIMER_LABELS[type]}  [${key}]`);
      timerTitles[type].style.fg   = 'white';
      timerTitles[type].style.bold = false;
    }
  });

  updateStats();

  try { screen.render(); } catch (e) { /* ignore render errors */ }
}

// ─── Stats update ──────────────────────────────────────────────────────────
function updateStats() {
  let lines = [];
  let total  = 0;

  Object.values(TimerType).forEach(type => {
    const today    = engine.getTodayTotal(type);
    const goal     = engine.getGoal(type);
    const progress = engine.getProgress(type);
    const percent  = Math.min(Math.round(progress * 100), 100);
    total += today;

    const icon  = progress >= 1 ? '{green-fg}✓{/}' : '○';
    lines.push(`${icon} {bold}${TIMER_LABELS[type]}{/bold}: ${formatTime(today)} / ${goal}m  (${percent}%)`);
  });

  lines.push(`{blue-fg}⏱  Total Today: ${formatTime(total)}{/}`);
  statsContent.setContent(lines.join('\n'));
}

// ─── Notification ──────────────────────────────────────────────────────────
let notificationBox     = null;
let notificationTimeout = null;

function notify(message) {
  if (notificationBox)    { mainBox.remove(notificationBox); }
  if (notificationTimeout){ clearTimeout(notificationTimeout); }

  notificationBox = blessed.box({
    top:     'center',
    left:    'center',
    width:   message.length + 6,
    height:  3,
    align:   'center',
    valign:  'middle',
    content: message,
    padding: { left: 2, right: 2 },
    border:  { type: 'line' },
    style: {
      bg:     'green',
      fg:     'white',
      bold:   true,
      border: { fg: 'white' }
    }
  });

  mainBox.append(notificationBox);
  screen.render();

  notificationTimeout = setTimeout(() => {
    if (notificationBox) {
      mainBox.remove(notificationBox);
      notificationBox = null;
      screen.render();
    }
  }, 3000);
}

// ─── History ───────────────────────────────────────────────────────────────
function updateHistory() {
  const todayStart   = new Date().setHours(0, 0, 0, 0);
  const allSessions  = engine.getAllSessions();
  const todayList    = [];
  const allList      = [];

  Object.values(TimerType).forEach(type => {
    (allSessions[type] || []).forEach(s => {
      const entry = { type, ...s };
      allList.push(entry);
      if (s.startTime >= todayStart) todayList.push(entry);
    });
  });

  todayList.sort((a, b) => b.startTime - a.startTime);
  allList.sort((a, b) => b.startTime - a.startTime);

  const row = s =>
    `  ${formatDateTime(s.startTime)}  ${formatTime(s.duration)}  ${TIMER_LABELS[s.type]}`;

  let content = `Today's Sessions (${todayList.length})\n${'─'.repeat(44)}\n`;
  content += todayList.length === 0
    ? '  No sessions today. Start a timer!\n'
    : todayList.slice(0, 8).map(row).join('\n') + '\n';

  content += `\nAll-Time Sessions (${allList.length})\n${'─'.repeat(44)}\n`;
  content += allList.length === 0
    ? '  No sessions recorded yet.\n'
    : allList.slice(0, 10).map(row).join('\n') + '\n';

  historyContent.setContent(content);
}

// ─── Goal modal ────────────────────────────────────────────────────────────
let goalInput       = '';
let showingGoalModal = false;

function showGoalModal() {
  showingGoalModal = true;
  goalInput = '';

  const modal = blessed.box({
    top:    'center',
    left:   'center',
    width:  52,
    height: 9,
    padding: { top: 1, left: 2, right: 2, bottom: 1 },
    border:  { type: 'line' },
    style: {
      bg:     'black',
      border: { fg: 'blue' }
    }
  });

  const title = blessed.text({
    top:     0,
    left:    0,
    width:   '100%',
    align:   'center',
    content: `Set Goal for ${TIMER_LABELS[selectedTimer]}`,
    style:   { bold: true, fg: 'blue' }
  });
  modal.append(title);

  const label = blessed.text({
    top:     2,
    left:    0,
    content: 'Enter minutes:',
    style:   { fg: 'white' }
  });
  modal.append(label);

  const inputDisplay = blessed.text({
    top:     3,
    left:    0,
    content: '> _',
    style:   { fg: 'cyan', bold: true }
  });
  modal.append(inputDisplay);

  const hint = blessed.text({
    top:     5,
    left:    0,
    content: 'Enter to save  ·  Esc to cancel',
    style:   { fg: 'gray' }
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
      if (value > 0) { engine.setGoal(selectedTimer, value); updateDisplays(); }
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

  screen.onceKey(
    ['escape','enter','0','1','2','3','4','5','6','7','8','9','backspace'],
    handleGoalInput
  );
}

// ─── Resources page ────────────────────────────────────────────────────────
const FOOTER_MAIN      = ' [1][2][3] Select  [Space] Start/Stop  [s] Start+Resources  [r] Reset  [g] Goal  [h] History  [e] Resources  [q] Quit ';
const FOOTER_RESOURCES = ' [1][2][3] Switch  [↑↓] Navigate  [a] Add  [d] Delete  [e/Esc] Close ';

function buildResourcesContent() {
  const resources = appLauncher.getResources(selectedTimer);
  const label     = TIMER_LABELS[selectedTimer];
  const icon      = TIMER_ICONS[selectedTimer];

  resourcesTitle.setContent(`📋  Resources — ${icon} ${label}`);

  if (resources.length === 0) {
    resourcesContent.setContent('  No resources configured.\n\n  Press {bold}a{/bold} to add a URL or command (e.g. https://example.com  or  code -n).');
    return;
  }

  const lines = resources.map((res, i) => {
    if (i === selectedResourceIdx) {
      return `  {yellow-fg}▶ {bold}${res}{/bold}{/yellow-fg}`;
    }
    return `    ${res}`;
  });
  resourcesContent.setContent(lines.join('\n'));
}

function toggleResources() {
  showResources = !showResources;
  resourcesBox.hidden = !showResources;
  if (showResources) {
    if (showHistory) { showHistory = false; historyBox.hidden = true; }
    selectedResourceIdx = 0;
    buildResourcesContent();
    footer.setContent(FOOTER_RESOURCES);
  } else {
    footer.setContent(FOOTER_MAIN);
  }
  screen.render();
}

function showAddResourceModal() {
  showingResourceModal = true;
  let input = '';

  const modal = blessed.box({
    top:    'center',
    left:   'center',
    width:  64,
    height: 9,
    padding: { top: 1, left: 2, right: 2, bottom: 1 },
    border:  { type: 'line' },
    style:   { bg: 'black', border: { fg: 'yellow' } }
  });

  const title = blessed.text({
    top: 0, left: 0, width: '100%', align: 'center',
    content: `Add Resource — ${TIMER_LABELS[selectedTimer]}`,
    style: { bold: true, fg: 'yellow' }
  });
  modal.append(title);

  const label = blessed.text({
    top: 2, left: 0,
    content: 'Enter URL or command:',
    style: { fg: 'white' }
  });
  modal.append(label);

  const inputDisplay = blessed.text({
    top: 3, left: 0, width: '100%',
    content: '> _',
    style: { fg: 'cyan', bold: true }
  });
  modal.append(inputDisplay);

  const hint = blessed.text({
    top: 5, left: 0,
    content: 'Enter to save  ·  Esc to cancel',
    style: { fg: 'gray' }
  });
  modal.append(hint);

  mainBox.append(modal);
  screen.render();

  function handler(ch, key) {
    if (key.name === 'escape') {
      screen.removeListener('keypress', handler);
      mainBox.remove(modal);
      showingResourceModal = false;
      screen.render();
      return;
    }
    if (key.name === 'enter') {
      screen.removeListener('keypress', handler);
      mainBox.remove(modal);
      showingResourceModal = false;
      if (input.trim()) {
        appLauncher.addResource(selectedTimer, input.trim());
        const updated = appLauncher.getResources(selectedTimer);
        selectedResourceIdx = updated.length - 1;
        buildResourcesContent();
        notify(`Added resource`);
      }
      screen.render();
      return;
    }
    if (key.name === 'backspace') {
      input = input.slice(0, -1);
    } else if (ch && ch.length === 1) {
      input += ch;
    }
    inputDisplay.setContent(`> ${input}_`);
    screen.render();
  }

  screen.on('keypress', handler);
}

// ─── Keyboard ──────────────────────────────────────────────────────────────
screen.key(['escape','q','1','2','3','space','s','r','g','h','e','up','down','a','d','?'], (ch, key) => {
  if (showingGoalModal || showingResourceModal) return;

  // e — toggle resources page
  if (ch === 'e' || key.name === 'e') { toggleResources(); return; }

  // h — toggle history (closes resources if open)
  if (ch === 'h' || key.name === 'h') {
    if (showResources) { showResources = false; resourcesBox.hidden = true; footer.setContent(FOOTER_MAIN); }
    showHistory = !showHistory;
    historyBox.hidden = !showHistory;
    if (showHistory) updateHistory();
    screen.render();
    return;
  }

  // ── Resources-page keys ─────────────────────────────────────────────────
  if (showResources) {
    if (key.name === 'escape') { toggleResources(); return; }

    if (key.name === 'up') {
      const r = appLauncher.getResources(selectedTimer);
      if (r.length > 0) { selectedResourceIdx = (selectedResourceIdx - 1 + r.length) % r.length; buildResourcesContent(); screen.render(); }
      return;
    }
    if (key.name === 'down') {
      const r = appLauncher.getResources(selectedTimer);
      if (r.length > 0) { selectedResourceIdx = (selectedResourceIdx + 1) % r.length; buildResourcesContent(); screen.render(); }
      return;
    }
    if (ch === 'a') { showAddResourceModal(); return; }
    if (ch === 'd') {
      const r = appLauncher.getResources(selectedTimer);
      if (r.length > 0) {
        appLauncher.removeResource(selectedTimer, selectedResourceIdx);
        const updated = appLauncher.getResources(selectedTimer);
        selectedResourceIdx = Math.min(selectedResourceIdx, Math.max(0, updated.length - 1));
        buildResourcesContent();
        notify('Resource removed');
        screen.render();
      }
      return;
    }
    // 1/2/3 switch which timer's resources are shown
    if (ch === '1') { selectedTimer = TimerType.JOB_SEARCH; selectedResourceIdx = 0; buildResourcesContent(); updateDisplays(); return; }
    if (ch === '2') { selectedTimer = TimerType.PRACTICE;   selectedResourceIdx = 0; buildResourcesContent(); updateDisplays(); return; }
    if (ch === '3') { selectedTimer = TimerType.UPSKILLING; selectedResourceIdx = 0; buildResourcesContent(); updateDisplays(); return; }
    return; // block other keys while resources page is open
  }

  // ── Main-screen keys ────────────────────────────────────────────────────
  if (key.name === 'q' || key.name === 'escape') {
    soundManager.stopAllAlerts();
    Object.values(TimerType).forEach(t => { if (engine.isRunning(t)) engine.stopTimer(t); });
    return process.exit(0);
  }

  if (ch === 'g' || key.name === 'g') { showGoalModal(); return; }

  if (key.name === 'space' || ch === ' ') {
    if (engine.isRunning(selectedTimer)) {
      engine.stopTimer(selectedTimer);
      soundManager.stopGoalAlert(selectedTimer);
      goalCompleted[selectedTimer] = false;
    } else {
      engine.startTimer(selectedTimer);
      goalCompleted[selectedTimer] = false;
      notify(`▶  ${TIMER_LABELS[selectedTimer]}  started`);
    }
    updateDisplays();
    return;
  }

  if (ch === 's' || key.name === 's') {
    if (!engine.isRunning(selectedTimer)) {
      engine.startTimer(selectedTimer);
      appLauncher.openForTimer(selectedTimer);
      appLauncher.markOpened(selectedTimer);
      goalCompleted[selectedTimer] = false;
      notify(`▶  ${TIMER_LABELS[selectedTimer]}  started  +  resources`);
      updateDisplays();
    }
    return;
  }

  if (ch === 'r' || key.name === 'r') { engine.resetTimer(selectedTimer); updateDisplays(); return; }

  if (ch === '1') { selectedTimer = TimerType.JOB_SEARCH; updateDisplays(); return; }
  if (ch === '2') { selectedTimer = TimerType.PRACTICE;   updateDisplays(); return; }
  if (ch === '3') { selectedTimer = TimerType.UPSKILLING; updateDisplays(); return; }
});

// ─── Mouse ─────────────────────────────────────────────────────────────────
screen.on('mouse', data => {
  if (showingGoalModal || showingResourceModal || showResources) return;
  Object.values(TimerType).forEach(type => {
    const box = timerBoxes[type];
    const pos = box.getPosition();
    if (data.x >= pos.left && data.x < pos.left + pos.width &&
        data.y >= pos.top  && data.y < pos.top  + pos.height) {
      selectedTimer = type;
      updateDisplays();
    }
  });
});

// ─── Main loop ─────────────────────────────────────────────────────────────
setInterval(() => {
  try { updateDisplays(); } catch (e) { /* ignore */ }
}, 1000);

try { updateDisplays(); screen.render(); } catch (e) { /* ignore */ }

screen.on('resize', () => { try { screen.render(); } catch (e) { /* ignore */ } });
