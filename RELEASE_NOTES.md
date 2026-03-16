# JPred v1.0.0 - Initial Release

🎉 First public release of JPred - Job Hunting Time Tracker!

## 📦 What's Included

- **jpred.exe** - Standalone Windows executable (39MB)
  - No Node.js installation required
  - Run anywhere on Windows
  - All features included

## ✨ Features

### Three Independent Timers
- 💼 **Job Search** - Track applications and job board browsing
- 📝 **Practice** - Track coding practice and interview prep
- 📚 **Upskilling** - Track learning and skill development

### Smart Workflow
- 🌐 Auto-open resources (Firefox/VS Code) when starting timers
- 🔔 Audio alerts when daily goals are completed
- 📊 Real-time progress visualization
- 💾 Automatic data persistence

### Keyboard Controls
| Key | Action |
|-----|--------|
| `Space` | Start/Stop timer (silent) |
| `s` | Start timer + Open resources |
| `1`, `2`, `3` | Select timer |
| `r` | Reset |
| `g` | Set goal |
| `h` | History |
| `q` | Quit |

## 🚀 Usage

### Option 1: Run Executable Directly
1. Download `jpred.exe`
2. Double-click to run, or run from command line:
   ```bash
   .\jpred.exe
   ```

### Option 2: Install System-Wide
1. Download and extract
2. Run the installer:
   ```bash
   .\install.bat
   ```
3. Restart terminal and run:
   ```bash
   jpred
   ```

## 📝 Installation (Source Code)

```bash
# Clone the repository
git clone https://github.com/MaqsudMallick/jpred.git
cd jpred

# Install dependencies
npm install

# Run the application
npm start
```

## 🐛 Known Issues

- First run may take a moment to initialize
- Requires Windows Terminal or modern terminal for best display

## 📚 Documentation

- [README.md](https://github.com/MaqsudMallick/jpred/blob/main/README.md) - Full documentation
- [CONTRIBUTING.md](https://github.com/MaqsudMallick/jpred/blob/main/CONTRIBUTING.md) - Contribution guidelines

## 🙏 Acknowledgments

Built with [blessed](https://github.com/chjj/blessed) - A curses-like library for Node.js

---

**Full Changelog**: https://github.com/MaqsudMallick/jpred/commits/v1.0.0
