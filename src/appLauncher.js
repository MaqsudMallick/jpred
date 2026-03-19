/**
 * Application Launcher for JPred
 * Opens browsers and apps based on timer type
 */
const { exec } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const RESOURCES_FILE = path.join(os.homedir(), '.jpred', 'resources.json');

// Default resources used on first run (no saved file)
const DEFAULT_RESOURCES = {
  job_search: [
    'https://www.linkedin.com/jobs',
    'https://www.indeed.com',
    'https://www.glassdoor.com'
  ],
  practice: [
    'https://leetcode.com',
    'https://www.hackerrank.com',
    'https://www.codewars.com'
  ],
  upskilling: [
    'code -n'
  ]
};

class AppLauncher {
  constructor() {
    this.openedApps = new Map();
    this.resources = this._loadResources();
  }

  _loadResources() {
    try {
      if (fs.existsSync(RESOURCES_FILE)) {
        return JSON.parse(fs.readFileSync(RESOURCES_FILE, 'utf8'));
      }
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_RESOURCES));
  }

  _saveResources() {
    try {
      const dir = path.dirname(RESOURCES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(RESOURCES_FILE, JSON.stringify(this.resources, null, 2));
    } catch (e) { /* ignore */ }
  }

  getResources(timerType) {
    return (this.resources[timerType] || []).slice();
  }

  addResource(timerType, value) {
    if (!this.resources[timerType]) this.resources[timerType] = [];
    this.resources[timerType].push(value.trim());
    this._saveResources();
  }

  removeResource(timerType, index) {
    if (!this.resources[timerType] || index < 0 || index >= this.resources[timerType].length) return;
    this.resources[timerType].splice(index, 1);
    this._saveResources();
  }

  /**
   * Open apps/URLs for a timer type
   */
  openForTimer(timerType) {
    const resources = this.getResources(timerType);
    if (resources.length === 0) return false;

    let opened = false;
    resources.forEach((resource, index) => {
      if (resource.startsWith('http')) {
        setTimeout(() => { this.openUrl(resource, 'firefox'); }, index * 500);
        opened = true;
      } else {
        const parts = resource.trim().split(/\s+/);
        this.openApp(parts[0], parts.slice(1));
        opened = true;
      }
    });
    return opened;
  }

  /**
   * Open a single URL in browser
   */
  openUrl(url, browser = 'firefox') {
    if (process.platform === 'win32') {
      if (browser === 'firefox') {
        exec(`start firefox "${url}"`, (err) => {
          if (err) {
            exec(`start "" "${url}"`, (err2) => {
              if (err2) console.error('Failed to open URL:', url);
            });
          }
        });
      } else {
        exec(`start "" "${url}"`, (err) => {
          if (err) console.error('Failed to open URL:', url);
        });
      }
    } else if (process.platform === 'darwin') {
      exec(`open -a "${browser}" "${url}"`, (err) => {
        if (err) exec(`open "${url}"`);
      });
    } else {
      exec(`${browser} "${url}" &`, (err) => {
        if (err) exec(`xdg-open "${url}"`);
      });
    }
    return true;
  }

  /**
   * Open an application
   */
  openApp(app, args = []) {
    const argsStr = args.join(' ');
    if (process.platform === 'win32') {
      exec(`start ${app} ${argsStr}`, (err) => {
        if (err) console.error(`Failed to open ${app}:`, err);
      });
    } else {
      exec(`${app} ${argsStr} &`, (err) => {
        if (err) console.error(`Failed to open ${app}:`, err);
      });
    }
    return true;
  }

  /**
   * Check if app was already opened for this session
   */
  wasOpened(timerType) {
    return this.openedApps.get(timerType) || false;
  }

  /**
   * Mark app as opened
   */
  markOpened(timerType) {
    this.openedApps.set(timerType, Date.now());
  }

  /**
   * Reset opened state
   */
  reset(timerType) {
    this.openedApps.delete(timerType);
  }
}

module.exports = { AppLauncher, TIMER_APPS: DEFAULT_RESOURCES };
