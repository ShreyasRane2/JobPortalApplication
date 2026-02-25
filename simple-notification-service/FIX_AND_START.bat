@echo off
echo ========================================
echo Fixing and Starting Notification Service
echo ========================================
echo.
echo This will:
echo 1. Clean the project
echo 2. Compile the project
echo 3. Start the service
echo.
echo ========================================
echo.

echo Step 1: Cleaning project...
call mvnw clean

echo.
echo Step 2: Compiling project...
call mvnw compile

echo.
echo Step 3: Starting service...
call mvnw spring-boot:run

pause
