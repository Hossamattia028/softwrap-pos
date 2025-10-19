@echo off
REM Softwrap POS - Quick Run Script for Windows

echo ==================================
echo    Softwrap POS - Quick Start
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo [OK] npm found
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes on first run...
    call npm install
    
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
) else (
    echo [OK] Dependencies already installed
)

echo.
echo [INFO] Starting Softwrap POS in development mode...
echo.
echo Default login credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the application
echo ==================================
echo.

REM Run the application
call npm run dev

