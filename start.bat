@echo off
echo Installing dependencies...
npm install
if %ERRORLEVEL% EQU 0 (
    echo Dependencies installed successfully!
    echo Starting the application...
    npm start
) else (
    echo Error installing dependencies. Please check your npm setup.
    pause
)