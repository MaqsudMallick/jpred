@echo off
echo ========================================
echo   JPred - Job Hunting Time Tracker
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
    echo.
)

echo Starting JPred...
echo Press 'q' to quit
echo.

node src/app.js
