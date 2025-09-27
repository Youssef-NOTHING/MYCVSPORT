@echo off
echo Installing project dependencies...
npm install

echo.
echo Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo All dependencies installed successfully!
echo.
echo Available commands:
echo   start.bat          - Install deps and start the app
echo   npm start          - Start the production server
echo   npm run dev        - Start development mode
echo   npm run backend    - Start only backend
echo   npm run frontend   - Start only frontend
echo.
pause