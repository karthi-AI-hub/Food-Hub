@echo off
echo Starting ExcelPOS Application...

:: Navigate to the backend folder and start the backend server
echo Starting Backend...
cd backend
start cmd /k "npm start"

:: Navigate to the frontend folder and start the frontend server
echo Starting Frontend...
cd ../frontend
start cmd /k "npm start"

:: Return to the root directory
cd ..

echo Both Frontend and Backend are running in separate terminals.
pause