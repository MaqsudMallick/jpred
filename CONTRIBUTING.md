# Contributing to JPred

First off, thank you for considering contributing to JPred! It's people like you that make JPred such a great tool for job seekers everywhere.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Pledge

We pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed and what behavior you expected**
* **Include screenshots if possible**
* **Include your environment details** (OS, Node.js version, terminal emulator)

**Example Bug Report:**

```markdown
### Description
Timer doesn't start when pressing Space key on Windows Terminal

### Steps to Reproduce
1. Open Windows Terminal
2. Run `jpred`
3. Select Job Search timer (1)
4. Press Space

### Expected Behavior
Timer should start and display "Started Job Search" notification

### Actual Behavior
Nothing happens when Space is pressed

### Environment
- OS: Windows 11
- Node.js: 20.10.0
- Terminal: Windows Terminal 1.18
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how this enhancement would be used**

### Your First Code Contribution

Unsure where to begin contributing to JPred? You can start by looking through these `good first issue` and `help wanted` issues:

* **Good first issues** - Issues that should only require a few lines of code
* **Help wanted issues** - Issues that should be a bit more involved than beginner issues

### Pull Requests

Before submitting a pull request, please:

1. Fork the repository and create your branch
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Ensure the test suite passes
6. Submit the pull request

## 🛠️ Development Setup

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)
- Git

### Setting Up Development Environment

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/jpred.git
   cd jpred
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm start
   ```

4. **Run tests:**
   ```bash
   node tests/test_timer_engine.js
   node tests/stress_test.js
   ```

### Project Structure

```
jpred/
├── src/
│   ├── index.js          # Entry point
│   ├── app.js            # Main TUI application (modify this for UI changes)
│   ├── timerEngine.js    # Timer logic (modify this for timer functionality)
│   ├── soundManager.js   # Audio alerts (modify this for sound features)
│   └── appLauncher.js    # Auto-open apps (modify this for new integrations)
├── tests/
│   ├── test_timer_engine.js
│   └── stress_test.js
├── package.json
└── README.md
```

## 📝 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated and pass
- [ ] Documentation has been updated (README.md, etc.)
- [ ] Commit messages follow the commit message guidelines
- [ ] No new warnings or errors introduced

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Testing
Describe how you tested your changes:
- [ ] Manual testing
- [ ] Automated tests added/updated
- [ ] Tested on Windows
- [ ] Tested on macOS/Linux

## Screenshots (if applicable)
Add screenshots of your changes if they affect the UI

## Related Issues
Closes #ISSUE_NUMBER
```

## 💻 Coding Standards

### JavaScript Style Guide

We follow a simple JavaScript style guide:

1. **Use const and let, not var**
   ```javascript
   const timer = new TimerEngine();
   let count = 0;
   ```

2. **Use meaningful variable names**
   ```javascript
   // Good
   const elapsedTime = engine.getElapsedTime(type);
   
   // Bad
   const t = engine.getElapsedTime(type);
   ```

3. **Use template literals for string concatenation**
   ```javascript
   // Good
   const message = `Started ${TIMER_LABELS[type]}`;
   
   // Bad
   const message = 'Started ' + TIMER_LABELS[type];
   ```

4. **Add comments for complex logic**
   ```javascript
   // Recover running timers (calculate elapsed time while app was closed)
   this.recoverRunningTimers();
   ```

5. **Use async/await for asynchronous code**
   ```javascript
   async function loadData() {
     const data = await fs.promises.readFile(path, 'utf8');
     return JSON.parse(data);
   }
   ```

### File Organization

- One class/function per file when possible
- Related functions grouped together
- Exports at the bottom of the file

### Testing Standards

- Write tests for new features
- Update tests when fixing bugs
- Aim for high test coverage on core functionality
- Include both unit tests and integration tests

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect the meaning (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(timer): add silent start mode with Space key

Added ability to start timers without opening associated resources.
Pressing Space now starts timer silently, while 's' opens resources.

Closes #42
```

```
fix(sound): prevent crash when progress exceeds 100%

Added Math.min/max guards in progress bar calculation to prevent
negative repeat counts causing crashes.

Fixes #38
```

```
docs(readme): update installation instructions for Windows

Added detailed Windows installation steps with screenshots.
```

## 🎨 Adding New Features

### Adding a New Timer Type

If you want to add a new timer category:

1. **Update `timerEngine.js`:**
   ```javascript
   const TimerType = {
     JOB_SEARCH: 'job_search',
     PRACTICE: 'practice',
     UPSKILLING: 'upskilling',
     NETWORKING: 'networking'  // Your new type
   };
   ```

2. **Update `appLauncher.js`:**
   ```javascript
   const TIMER_APPS = {
     // ... existing types
     networking: {
       name: 'Networking',
       urls: ['https://linkedin.com', 'https://twitter.com'],
       browser: 'firefox'
     }
   };
   ```

3. **Update `app.js`:**
   - Add timer card configuration
   - Add keyboard shortcut
   - Update UI labels

4. **Update tests**

### Adding New Website Integrations

To add new websites to an existing timer:

1. **Edit `appLauncher.js`:**
   ```javascript
   const TIMER_APPS = {
     job_search: {
       name: 'Job Search',
       urls: [
         'https://www.linkedin.com/jobs',
         'https://www.indeed.com',
         'https://www.glassdoor.com',
         'https://wellfound.com'  // Your new addition
       ],
       browser: 'firefox'
     }
   };
   ```

2. **Test that websites open correctly**

3. **Update documentation**

## 🐛 Debugging Tips

### Common Issues

1. **Screen doesn't render:**
   - Check for `screen.render()` calls after updates
   - Wrap render calls in try/catch

2. **Key bindings not working:**
   - Ensure key is added to `screen.key()` listener array
   - Check for conflicts with existing bindings

3. **Data not persisting:**
   - Check `save()` is called after state changes
   - Verify data path is correct

### Logging

Add console logs for debugging:
```javascript
console.log('Timer started:', type);
console.error('Error loading data:', error);
```

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord/Slack**: [Link if applicable]

## 🙏 Thank You!

Every contribution to JPred helps job seekers around the world. Whether it's fixing a typo, reporting a bug, or adding a major feature, we appreciate your help in making JPred better!

---

<div align="center">

**Happy Coding! 🚀**

</div>
