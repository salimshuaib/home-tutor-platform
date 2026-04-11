@echo off
echo ==============================================
echo  Starting Local Development Server
echo ==============================================

:: Try to use npx live-server first for hot-reloading
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [Node.js found] Starting live-server...
    npx --yes live-server --port=5000 --host=localhost --entry-file=login.html
    goto end
)

:: If Node is not installed, fallback to Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [Python found] Starting http.server...
    start http://localhost:5000/login.html
    python -m http.server 5000 --bind 127.0.0.1
    goto end
)

echo [Error] Neither Node.js nor Python were found. 
echo Please install NodeJS (https://nodejs.org/) to run the local server.
pause

:end
