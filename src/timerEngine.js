const fs = require('fs');
const path = require('path');

// Timer types
const TimerType = {
  JOB_SEARCH: 'job_search',
  PRACTICE: 'practice',
  UPSKILLING: 'upskilling'
};

const TIMER_LABELS = {
  [TimerType.JOB_SEARCH]: 'Job Search',
  [TimerType.PRACTICE]: 'Practice',
  [TimerType.UPSKILLING]: 'Upskilling'
};

const TIMER_ICONS = {
  [TimerType.JOB_SEARCH]: '💼',
  [TimerType.PRACTICE]: '📝',
  [TimerType.UPSKILLING]: '📚'
};

class TimerEngine {
  constructor(dataPath) {
    this.dataPath = dataPath || path.join(process.env.USERPROFILE || process.env.HOME, '.jpred', 'data.json');
    this.timers = {};
    this.goals = {};
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dataPath)) {
        let data;
        try {
          data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
        } catch (parseError) {
          console.error('Data file corrupted, creating backup and starting fresh...');
          // Backup corrupted file
          const backupPath = this.dataPath + '.backup.' + Date.now();
          fs.copyFileSync(this.dataPath, backupPath);
          console.error('Backup created at:', backupPath);
          this.initializeDefaultState();
          return;
        }

        // Validate data structure
        if (!data.timers || !data.goals) {
          console.error('Invalid data structure, resetting...');
          this.initializeDefaultState();
          return;
        }

        // Initialize timers
        Object.values(TimerType).forEach(type => {
          if (data.timers && data.timers[type]) {
            // Validate timer structure
            const timer = data.timers[type];
            this.timers[type] = {
              totalTime: typeof timer.totalTime === 'number' ? timer.totalTime : 0,
              isRunning: timer.isRunning === true ? true : false,
              currentStart: timer.currentStart || null,
              sessions: Array.isArray(timer.sessions) ? timer.sessions : []
            };
          } else {
            this.timers[type] = {
              totalTime: 0,
              isRunning: false,
              currentStart: null,
              sessions: []
            };
          }
        });

        // Load goals
        this.goals = {};
        Object.values(TimerType).forEach(type => {
          if (data.goals[type] && typeof data.goals[type] === 'number') {
            this.goals[type] = data.goals[type];
          } else {
            this.goals[type] = 120; // Default 2 hours
          }
        });

        // Recover running timers (calculate elapsed time while app was closed)
        this.recoverRunningTimers();
      } else {
        this.initializeDefaultState();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.initializeDefaultState();
    }
  }

  initializeDefaultState() {
    Object.values(TimerType).forEach(type => {
      this.timers[type] = {
        totalTime: 0,
        isRunning: false,
        currentStart: null,
        sessions: []
      };
      this.goals[type] = 120;
    });
  }

  recoverRunningTimers() {
    const now = Date.now();
    Object.values(this.timers).forEach(timer => {
      if (timer.isRunning && timer.currentStart) {
        const elapsed = (now - timer.currentStart) / 1000;
        timer.totalTime += elapsed;
        timer.isRunning = false;
        timer.currentStart = null;
      }
    });
  }

  save() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = {
        timers: this.timers,
        goals: this.goals,
        lastSaved: new Date().toISOString()
      };

      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  startTimer(type) {
    const timer = this.timers[type];
    if (!timer.isRunning) {
      timer.isRunning = true;
      timer.currentStart = Date.now();
      this.save();
    }
  }

  stopTimer(type) {
    const timer = this.timers[type];
    if (timer.isRunning && timer.currentStart) {
      const endTime = Date.now();
      const duration = (endTime - timer.currentStart) / 1000;
      timer.totalTime += duration;
      timer.isRunning = false;

      const session = {
        startTime: timer.currentStart,
        endTime: endTime,
        duration: duration
      };
      timer.sessions.push(session);
      timer.currentStart = null;
      this.save();
      return session;
    }
    return null;
  }

  resetTimer(type) {
    const timer = this.timers[type];
    if (timer.isRunning) {
      this.stopTimer(type);
    }
    timer.totalTime = 0;
    this.save();
  }

  getElapsedTime(type) {
    const timer = this.timers[type];
    if (timer.isRunning && timer.currentStart) {
      return timer.totalTime + (Date.now() - timer.currentStart) / 1000;
    }
    return timer.totalTime;
  }

  isRunning(type) {
    return this.timers[type].isRunning;
  }

  getTotalTime(type) {
    return this.timers[type].totalTime;
  }

  setGoal(type, minutes) {
    this.goals[type] = minutes;
    this.save();
  }

  getGoal(type) {
    return this.goals[type] || 120;
  }

  getProgress(type) {
    const goalMinutes = this.getGoal(type);
    if (goalMinutes <= 0) return 0;
    const currentMinutes = this.getElapsedTime(type) / 60;
    return currentMinutes / goalMinutes;
  }

  getTodaySessions(type) {
    const timer = this.timers[type];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    return timer.sessions.filter(s => s.startTime >= todayStart);
  }

  getTodayTotal(type) {
    const sessions = this.getTodaySessions(type);
    return sessions.reduce((sum, s) => sum + s.duration, 0);
  }

  getAllSessions() {
    const result = {};
    Object.values(TimerType).forEach(type => {
      result[type] = [...this.timers[type].sessions];
    });
    return result;
  }

  getTotalTodayAll() {
    return Object.values(TimerType).reduce((sum, type) => sum + this.getTodayTotal(type), 0);
  }
}

module.exports = { TimerEngine, TimerType, TIMER_LABELS, TIMER_ICONS };
