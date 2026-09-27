@echo off
echo ==========================================
echo   JEWELORA - Jewellery Management System
echo ==========================================
echo.
echo Installing root dependencies...
call npm install
echo.
echo Installing server dependencies...
call npm install --prefix server
echo.
echo Installing client dependencies...
call npm install --prefix client
echo.
echo Done.
echo.
echo Next:
echo 1. Start MySQL in XAMPP
echo 2. Import database\jewelora.sql in phpMyAdmin
echo 3. Copy server\.env.example to server\.env
echo 4. Run: npm run dev
echo.
pause
