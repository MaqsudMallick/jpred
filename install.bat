@echo off
REM JPred Installation Script for Windows
REM This script installs JPred to your system so you can run it from anywhere

setlocal enabledelayedexpansion

echo =========================================
echo   JPred Installation for Windows
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"

REM Default installation directory
set "INSTALL_DIR=%USERPROFILE%\.jpred-app"

echo Installing JPred to: %INSTALL_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Copy project files
echo Copying files...
xcopy /E /I /Y "%SCRIPT_DIR%src" "%INSTALL_DIR%\src"
xcopy /E /I /Y "%SCRIPT_DIR%node_modules" "%INSTALL_DIR%\node_modules"
copy /Y "%SCRIPT_DIR%package.json" "%INSTALL_DIR%\package.json"

REM Create bin directory for the launcher
set "BIN_DIR=%USERPROFILE%\.local\bin"
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

REM Create launcher script
echo Creating launcher...
echo @echo off > "%BIN_DIR%\jpred.bat"
echo node "%%USERPROFILE%%\.jpred-app\src\app.js" %%* >> "%BIN_DIR%\jpred.bat"

echo.
echo =========================================
echo   Installation Complete!
echo =========================================
echo.
echo Adding %BIN_DIR% to your PATH...
setx PATH "%PATH%;%BIN_DIR%"
echo.
echo NOTE: You need to restart your terminal for PATH changes to take effect.
echo.
echo After restarting your terminal, you can run JPred by typing:
echo   jpred
echo.
echo Or run it directly from the installation directory:
echo   node %%USERPROFILE%%\.jpred-app\src\app.js
echo.
echo =========================================

pause
