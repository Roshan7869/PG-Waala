@echo off
echo Starting PG Waala development server...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in PATH. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo npm is not installed or not in PATH. Please install Node.js and try again.
    pause
    exit /b 1
)

REM Run the development server using npx to bypass execution policy issues
echo Running development server...
npx vite

pause 