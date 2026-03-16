# JPred - Job Hunting Time Tracker

A modern, beautiful Terminal UI (TUI) application for tracking time spent on job hunting activities with automated workflow integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-20+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Features

### Three Independent Timers
- 💼 **Job Search** - Track time spent searching and applying for jobs
  - Auto-opens: LinkedIn Jobs, Indeed, Glassdoor in Firefox
- 📝 **Practice** - Track time spent practicing coding problems
  - Auto-opens: LeetCode, HackerRank, CodeWars in Firefox
- 📚 **Upskilling** - Track time spent learning new skills
  - Auto-opens: VS Code (new window)

### Smart Notifications
- 🔔 **Goal Completion Alert** - Continuous beep sound when you reach your daily goal
- 🎉 **Success Sound** - Special sound effect when goal is first achieved
- ⏰ **Persistent Alert** - Keeps beeping until you stop the timer

### Modern Interface
- 🎨 Beautiful dark theme
- 📊 Real-time progress bars with goal visualization
- 📱 Responsive layout with three timer cards
- ⌨️ Full keyboard navigation support
- 🖱️ Mouse click support for timer controls

### Productivity Features
- 🎯 Daily goals with progress tracking
- 📜 Session history with detailed logs
- 💾 Automatic data persistence
- 🔄 Timer recovery (tracks time even if app closes)
- 🌐 Auto-launch relevant websites/apps when starting timers

## Installation

### Quick Install (Run from Anywhere)

Run the installation script to add `jpred` to your system PATH:

```bash
.\install.bat
```

This will:
1. Copy JPred to `%USERPROFILE%\.jpred-app`
2. Create a launcher in `%USERPROFILE%\.local\bin`
3. Add the bin directory to your PATH

After installation, you can run `jpred` from anywhere in your terminal.

### Manual Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the application**:
   ```bash
   npm start
   ```

### Add to PATH Manually

To run `jpred` from anywhere without the install script:

1. Create a batch file at `%USERPROFILE%\.local\bin\jpred.bat`:
   ```batch
   @echo off
   node "%USERPROFILE%\.jpred-app\src\app.js" %*
   ```

2. Add to PATH:
   ```bash
   setx PATH "%PATH%;%USERPROFILE%\.local\bin"
   ```

3. Restart your terminal and run:
   ```bash
   jpred
   ```

## Usage

### Starting/Stopping Timers

**Keyboard:**
| Key | Action |
|-----|--------|
| `1` | Select Job Search timer |
| `2` | Select Practice timer |
| `3` | Select Upskilling timer |
| `Space` | Start/Stop timer (default - no apps opened) |
| `s` | Start timer + Open associated resources |
| `r` | Reset selected timer |
| `g` | Set goal for selected timer |
| `h` | Toggle history view |
| `q` | Quit application |

**Mouse:**
- Click on a timer card to select it
- Click on Start/Stop/Reset buttons to control timers

### Silent Start Mode (Default)

Press `Space` to start a timer **without** opening associated websites or applications. This is the default behavior - perfect for when you:
- Already have the relevant tabs open
- Want to track time without distractions
- Are working offline

### Opening Resources Mode

Press `s` to start a timer **and** automatically open relevant resources:

| Timer | Opens with 's' key |
|-------|--------------------|
| **Job Search** | Firefox → LinkedIn Jobs, Indeed, Glassdoor |
| **Practice** | Firefox → LeetCode, HackerRank, CodeWars |
| **Upskilling** | VS Code (new window) |

### Auto-Open Workflow

When you **start** a timer, JPred automatically opens relevant resources:

| Timer | Opens |
|-------|-------|
| **Job Search** (Space on timer 1) | Firefox → LinkedIn Jobs, Indeed, Glassdoor |
| **Practice** (Space on timer 2) | Firefox → LeetCode, HackerRank, CodeWars |
| **Upskilling** (Space on timer 3) | VS Code (new window) |

### Setting Goals

1. Select a timer using `1`, `2`, or `3`
2. Press `g` to open the goal modal
3. Enter the goal in minutes
4. Press Enter to save, Esc to cancel

### Goal Completion Alerts

When you reach 100% of your goal:
1. 🎉 **Success sound** plays immediately
2. 🔔 **Continuous beeping** starts (every 2 seconds)
3. 📢 **Notification popup** appears
4. ⏹ **Stop the timer** (press Space) to silence the alert

This ensures you know when you've achieved your daily goal!

### Viewing History

Press `h` to toggle the history view which shows:
- **Today's Sessions**: All sessions logged today
- **All Time Sessions**: Complete session history

## Data Storage

Your timer data is automatically saved to:
- **Windows**: `C:\Users\<YourUsername>\.jpred\data.json`
- **macOS/Linux**: `~/.jpred/data.json`

The data includes:
- Total time per timer
- Session history with timestamps
- Custom goals
- Running state (recovered on restart)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Select Job Search timer |
| `2` | Select Practice timer |
| `3` | Select Upskilling timer |
| `Space` | Toggle start/stop selected timer |
| `r` | Reset selected timer |
| `g` | Set goal for selected timer |
| `h` | Toggle history view |
| `q` or `Escape` | Quit application |

## Project Structure

```
jpred/
├── src/
│   ├── index.js          # Entry point
│   ├── app.js            # Main TUI application
│   ├── timerEngine.js    # Timer logic and persistence
│   ├── soundManager.js   # Beep/alert sound system
│   └── appLauncher.js    # Auto-open browsers/apps
├── tests/
│   ├── test_timer_engine.js
│   ├── stress_test.js
│   └── test_sound_launcher.js
├── package.json
├── README.md
├── LICENSE
└── run.bat
```

## Productivity Loop

JPred implements a **Code → Feedback → Code** loop:

1. **Start Timer** → Relevant resources auto-open
2. **Work** → Time is tracked with visual progress
3. **Goal Reached** → Audio alert celebrates achievement
4. **Stop Timer** → Alert silenced, session saved
5. **Review History** → See your progress over time
6. **Repeat** → Build consistent habits

## Troubleshooting

### Display Issues
- Ensure your terminal supports UTF-8 characters
- Try increasing terminal window size if layout appears broken
- For Windows, use Windows Terminal for best experience

### Sound Issues
- Windows: Uses PowerShell `[Console]::Beep()` - requires terminal support
- Fallback: Terminal bell character (may not work in all terminals)

### Auto-Open Issues
- **Firefox not opening**: Ensure Firefox is installed and in PATH
- **VS Code not opening**: Ensure `code` command is available (install via VS Code: Cmd+Shift+P → "Shell Command: Install 'code' command in PATH")
- **Websites not loading**: Check your internet connection

### Data Issues
- Data is stored in `~/.jpred/data.json`
- You can manually edit this file if needed (JSON format)
- Delete the file to reset all data
- Corrupted data is automatically backed up and recovered

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.
