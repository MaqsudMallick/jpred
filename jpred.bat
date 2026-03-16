@echo off
REM JPred - Job Hunting Time Tracker
REM This script runs JPred from anywhere in the system

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Check if running from installation directory or project directory
if exist "%SCRIPT_DIR%node_modules\blessed\package.json" (
    REM Running from installation
    node "%SCRIPT_DIR%src\app.js" %*
) else if exist "%SCRIPT_DIR%..\jpred\node_modules\blessed\package.json" (
    REM Running from project directory
    node "%SCRIPT_DIR%..\jpred\src\app.js" %*
) else (
    REM Try to find jpred installation
    for %%i in (jpred) do set "JPRED_DIR=%%~dpi"
    if exist "!JPRED_DIR!node_modules\blessed\package.json" (
        node "!JPRED_DIR!src\app.js" %*
    ) else (
        echo JPred is not installed. Please install it first.
        echo Usage: npm install -g jpred
        exit /b 1
    )
)
