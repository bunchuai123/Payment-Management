@echo off
echo Starting Payment Management System - Local Development
echo.
echo Starting Backend Server...
cd /d "C:\Aeva\Projects\Payment Management\backend"
start "Backend Server" cmd /c "venv\Scripts\activate && python test_server.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "C:\Aeva\Projects\Payment Management\frontend"
start "Frontend Server" cmd /c "npm run dev"

echo.
echo ========================================
echo   Payment Management System Started!
echo ========================================
echo.
echo Backend API: http://localhost:8001
echo Frontend App: http://localhost:3001
echo.
echo Login Credentials:
echo Email: admin@paymentpro.com
echo Password: admin123
echo.
echo Press any key to stop all servers...
pause > nul

echo Stopping servers...
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo Servers stopped.
pause