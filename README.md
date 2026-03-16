# 💼 JPred - Job Hunting Time Tracker

> A modern Terminal UI (TUI) application for tracking time spent on job hunting activities with automated workflow integration.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/jpred/jpred)
[![Node](https://img.shields.io/badge/node-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

## 🎯 What is JPred?

JPred is a productivity tool designed specifically for job seekers. It helps you track time spent on three critical job hunting activities:

- **💼 Job Search** - Track applications, job board browsing, and networking
- **📝 Practice** - Track coding practice and technical interview prep
- **📚 Upskilling** - Track learning and skill development

Unlike generic time trackers, JPred understands your job hunting workflow. When you start a timer, it can automatically open the websites and tools you need—LinkedIn for job searching, LeetCode for practice, or VS Code for learning.

## ✨ Features

### Core Features
- 🎯 **Three Independent Timers** - Track job search, practice, and upskilling separately
- 🌐 **Auto-Open Resources** - Automatically opens relevant websites/apps when starting timers
- 🔔 **Goal Completion Alerts** - Audio alerts when you reach daily goals
- 📊 **Progress Visualization** - Real-time progress bars and statistics
- 💾 **Data Persistence** - Your data is saved automatically and persists between sessions
- 📜 **Session History** - View detailed logs of all your work sessions

### Productivity Features
- ⌨️ **Keyboard-First Design** - All features accessible via keyboard shortcuts
- 🖱️ **Mouse Support** - Click to select timers and control buttons
- 🎨 **Modern Dark Theme** - Easy on the eyes for long sessions
- 🔇 **Silent Mode** - Start timers without opening apps (press `Space`)
- 🚀 **Quick Start** - Press `s` to start timer + open resources instantly

## 📦 Installation

### Windows

#### Quick Install (Recommended)

Run the installation script to add `jpred` to your system PATH:

```bash
.\install.bat
```

This will:
1. Copy JPred to your user directory
2. Create a system-wide launcher
3. Add it to your PATH automatically

After installation, restart your terminal and run:
```bash
jpred
```

#### Manual Installation

```bash
# Clone or download the project
cd jpred

# Install dependencies
npm install

# Run the application
npm start
```

### macOS / Linux

```bash
# Install dependencies
npm install

# Run the application
npm start

# Optional: Create a global command
ln -s $(pwd)/src/index.js /usr/local/bin/jpred
```

## 🚀 Usage

### Starting Timers

| Key | Action |
|-----|--------|
| `Space` | Start/Stop timer (silent - no apps opened) |
| `s` | Start timer + Open associated resources |

### Navigation

| Key | Action |
|-----|--------|
| `1` | Select Job Search timer |
| `2` | Select Practice timer |
| `3` | Select Upskilling timer |
| `r` | Reset selected timer |
| `g` | Set daily goal |
| `h` | Toggle history view |
| `q` | Quit application |

### Auto-Open Resources

When you press `s` to start a timer, JPred automatically opens:

| Timer | Opens |
|-------|-------|
| **Job Search** (1) | Firefox → LinkedIn Jobs, Indeed, Glassdoor |
| **Practice** (2) | Firefox → LeetCode, HackerRank, CodeWars |
| **Upskilling** (3) | VS Code (new window) |

### Setting Goals

1. Select a timer (`1`, `2`, or `3`)
2. Press `g` to set a custom goal
3. Enter minutes and press Enter

Default goal: 120 minutes (2 hours) per timer per day.

### Goal Completion

When you reach 100% of your daily goal:
1. 🎉 Success sound plays
2. 🔔 Continuous beeping starts (every 2 seconds)
3. 📢 Notification popup appears
4. ⏹ Press `Space` to stop the timer and silence the alert

## 📊 Data Storage

Your timer data is automatically saved to:
- **Windows**: `C:\Users\<YourUsername>\.jpred\data.json`
- **macOS/Linux**: `~/.jpred/data.json`

Data includes:
- Total time per timer
- Session history with timestamps
- Custom goals
- Running state (recovered if app closes unexpectedly)

## 🖼️ Screenshots

### Main Interface
```
┌─────────────────────────────────────────────────────────────────┐
│          💼  JPRED - Job Hunting Time Tracker  💼               │
└─────────────────────────────────────────────────────────────────┘

  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
  │  💼 Job Search     │  │  📝 Practice       │  │  📚 Upskilling     │
  │                    │  │                    │  │                    │
  │      00:00         │  │      00:00         │  │      00:00         │
  │                    │  │                    │  │                    │
  │  [░░░░░░░░░░] 0%  │  │  [░░░░░░░░░░] 0%  │  │  [░░░░░░░░░░] 0%  │
  │  ○ Stopped         │  │  ○ Stopped         │  │  ○ Stopped         │
  │  Today: 00:00/120m │  │  Today: 00:00/120m │  │  Today: 00:00/120m │
  └────────────────────┘  └────────────────────┘  └────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │  📊 Today's Summary                                             │
  │  ○ Job Search: 00:00/120m (0%)                                 │
  │  ○ Practice: 00:00/120m (0%)                                   │
  │  ○ Upskilling: 00:00/120m (0%)                                 │
  │  ⏱ Total Today: 00:00                                          │
  └─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Development

### Project Structure

```
jpred/
├── src/
│   ├── index.js          # Entry point
│   ├── app.js            # Main TUI application
│   ├── timerEngine.js    # Timer logic and persistence
│   ├── soundManager.js   # Audio alerts system
│   └── appLauncher.js    # Auto-open browsers/apps
├── tests/
│   ├── test_timer_engine.js
│   └── stress_test.js
├── package.json
├── README.md
├── LICENSE
├── install.bat           # Windows installer
└── run.bat               # Quick run script
```

### Running Tests

```bash
# Run unit tests
node tests/test_timer_engine.js

# Run stress tests
node tests/stress_test.js
```

### Building Executable (Optional)

```bash
# Install pkg for building
npm install --save-dev pkg

# Build Windows executable
npm run build
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution
- Additional website integrations (AngelList, Wellfound, etc.)
- Custom resource URLs configuration
- Weekly/monthly reports
- Export data to CSV/Excel
- Additional themes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [blessed](https://github.com/chjj/blessed) - A curses-like library for Node.js
- Inspired by the need for focused, distraction-free job hunting tools

## 📬 Support

- **Issues**: [GitHub Issues](https://github.com/jpred/jpred/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jpred/jpred/discussions)

---

<div align="center">

**Happy Job Hunting! 🍀**

Made with ❤️ for job seekers everywhere

</div>
