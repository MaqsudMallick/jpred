/**
 * Application Launcher for JPred
 * Opens browsers and apps based on timer type
 */
const { exec } = require('child_process');
const path = require('path');

// URLs and apps for each timer type
const TIMER_APPS = {
  job_search: {
    name: 'Job Search',
    urls: [
      'https://www.linkedin.com/jobs',
      'https://www.indeed.com',
      'https://www.glassdoor.com'
    ],
    browser: 'firefox'
  },
  practice: {
    name: 'Practice',
    urls: [
      'https://leetcode.com',
      'https://www.hackerrank.com',
      'https://www.codewars.com'
    ],
    browser: 'firefox'
  },
  upskilling: {
    name: 'Upskilling',
    app: 'code',
    args: ['-n'] // New window
  }
};

class AppLauncher {
  constructor() {
    this.openedApps = new Map();
  }

  /**
   * Open apps/URLs for a timer type
   */
  openForTimer(timerType) {
    const config = TIMER_APPS[timerType];
    if (!config) {
      console.log('No app configured for timer type:', timerType);
      return false;
    }

    console.log(`Opening ${config.name} resources...`);

    if (config.urls) {
      // Open URLs in browser
      return this.openUrls(config.urls, config.browser);
    } else if (config.app) {
      // Open application
      return this.openApp(config.app, config.args);
    }

    return false;
  }

  /**
   * Open URLs in specified browser
   */
  openUrls(urls, browser = 'firefox') {
    const results = [];

    urls.forEach((url, index) => {
      // Stagger opening to avoid browser blocking
      setTimeout(() => {
        this.openUrl(url, browser);
      }, index * 500);
      results.push(true);
    });

    return results.length > 0;
  }

  /**
   * Open a single URL in browser
   */
  openUrl(url, browser = 'firefox') {
    if (process.platform === 'win32') {
      // Windows: use start command or firefox directly
      if (browser === 'firefox') {
        exec(`start firefox "${url}"`, (err) => {
          if (err) {
            // Fallback: use default browser
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
      // macOS
      exec(`open -a "${browser}" "${url}"`, (err) => {
        if (err) exec(`open "${url}"`);
      });
    } else {
      // Linux
      exec(`${browser} "${url}" &`, (err) => {
        if (err) exec(`xdg-open "${url}"`);
      });
    }

    console.log('Opened:', url);
    return true;
  }

  /**
   * Open an application
   */
  openApp(app, args = []) {
    const argsStr = args.join(' ');
    
    if (process.platform === 'win32') {
      exec(`start ${app} ${argsStr}`, (err) => {
        if (err) {
          console.error(`Failed to open ${app}:`, err);
        }
      });
    } else {
      exec(`${app} ${argsStr} &`, (err) => {
        if (err) console.error(`Failed to open ${app}:`, err);
      });
    }

    console.log(`Opened ${app} ${argsStr}`);
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

module.exports = { AppLauncher, TIMER_APPS };
