/**
 * Sound utility for JPred
 * Plays beep sounds using Windows built-in sounds
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class SoundManager {
  constructor() {
    this.beepInterval = null;
    this.isBeeping = false;
    this.completedTimers = new Set();
  }

  /**
   * Play a single beep sound using PowerShell
   */
  playBeep() {
    if (process.platform === 'win32') {
      // Use PowerShell to play Windows default beep
      exec('powershell -c "[Console]::Beep(800, 500)"', (err) => {
        if (err) {
          // Fallback: try alternative method
          this.playBeepFallback();
        }
      });
    } else {
      // For non-Windows, use terminal bell
      process.stdout.write('\x07');
    }
  }

  /**
   * Fallback beep using Node.js console
   */
  playBeepFallback() {
    process.stdout.write('\x07');
  }

  /**
   * Start continuous beeping for completed goals
   */
  startGoalAlert(timerType) {
    if (this.completedTimers.has(timerType)) {
      return; // Already alerting for this timer
    }

    this.completedTimers.add(timerType);
    
    if (!this.isBeeping) {
      this.isBeeping = true;
      this.playBeep(); // Play immediately
      
      // Continue beeping every 2 seconds
      this.beepInterval = setInterval(() => {
        if (this.isBeeping && this.completedTimers.size > 0) {
          this.playBeep();
        }
      }, 2000);
    }
  }

  /**
   * Stop beeping for a specific timer
   */
  stopGoalAlert(timerType) {
    this.completedTimers.delete(timerType);

    // If no more completed timers, stop beeping
    if (this.completedTimers.size === 0) {
      this.stopAllAlerts();
    }
  }

  /**
   * Stop all beeping
   */
  stopAllAlerts() {
    this.isBeeping = false;
    if (this.beepInterval) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }
    this.completedTimers.clear();
  }

  /**
   * Check if a timer should trigger alert
   */
  checkGoalCompletion(timerType, progress) {
    if (progress >= 1.0 && !this.completedTimers.has(timerType)) {
      this.startGoalAlert(timerType);
      return true;
    }
    return false;
  }

  /**
   * Play a success sound when goal is first reached
   */
  playSuccessSound() {
    if (process.platform === 'win32') {
      // Play Windows success sound
      exec('powershell -c "[Console]::Beep(1000, 300); Start-Sleep -Milliseconds 100; [Console]::Beep(1200, 300); Start-Sleep -Milliseconds 100; [Console]::Beep(1500, 400)"', (err) => {
        if (err) console.error('Sound error:', err);
      });
    } else {
      // Multiple beeps for success
      this.playBeep();
      setTimeout(() => this.playBeep(), 200);
      setTimeout(() => this.playBeep(), 400);
    }
  }
}

module.exports = SoundManager;
