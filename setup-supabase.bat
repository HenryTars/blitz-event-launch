@echo off
echo ========================================
echo BliTz Supabase Setup
echo ========================================
echo.

echo Step 1: Testing database connection...
node test-connection.js
if errorlevel 1 (
    echo.
    echo ERROR: Cannot connect to database. Please check your environment variables.
    pause
    exit /b 1
)

echo.
echo Step 2: Running Prisma generate...
npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed.
    pause
    exit /b 1
)

echo.
echo Step 3: Running Prisma migrations...
npx prisma migrate deploy
if errorlevel 1 (
    echo WARNING: Migrations may have issues, but continuing...
)

echo.
echo ========================================
echo Setup complete! You can now run: npm run dev
echo ========================================
pause
