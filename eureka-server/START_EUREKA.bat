@echo off
echo ========================================
echo Starting Eureka Server
echo ========================================
echo.
echo Eureka Server will start on port 8761
echo Dashboard: http://localhost:8761
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

mvnw spring-boot:run

pause
