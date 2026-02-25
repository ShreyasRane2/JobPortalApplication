@echo off
echo ========================================
echo COMPLETE FIX FOR ADMIN SERVICE
echo ========================================
echo.
echo This will completely clean and rebuild the admin service.
echo.
echo IMPORTANT: STOP the Admin Service in STS first!
echo Press any key after stopping the service...
pause

cd /d "%~dp0"

echo.
echo [1/6] Deleting target folder...
if exist target (
    rmdir /s /q target
    echo ✅ Target folder deleted
) else (
    echo ℹ Target folder doesn't exist
)

echo.
echo [2/6] Deleting .classpath and .project...
if exist .classpath del /f .classpath
if exist .project del /f .project
echo ✅ Eclipse files deleted

echo.
echo [3/6] Running Maven Clean...
call mvnw.cmd clean
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven clean failed!
    pause
    exit /b 1
)
echo ✅ Maven clean successful

echo.
echo [4/6] Running Maven Install...
call mvnw.cmd install -DskipTests
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven install failed!
    pause
    exit /b 1
)
echo ✅ Maven install successful

echo.
echo [5/6] Testing if service can start...
echo Checking if port 8085 is free...
netstat -ano | findstr :8085
if %ERRORLEVEL% EQU 0 (
    echo ⚠ WARNING: Port 8085 is still in use!
    echo Please make sure you stopped the service in STS.
) else (
    echo ✅ Port 8085 is free
)

echo.
echo [6/6] Verifying build artifacts...
if exist "target\admin-dashboard-microservice-0.0.1-SNAPSHOT.jar" (
    echo ✅ JAR file created successfully
) else (
    echo ❌ JAR file not found - build may have failed
)

echo.
echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Next steps in STS:
echo 1. Right-click admin-dashboard-microservice project
echo 2. Select "Refresh" (F5)
echo 3. Select "Maven" -^> "Update Project"
echo 4. Check "Force Update of Snapshots/Releases"
echo 5. Click OK
echo 6. Right-click project -^> "Run As" -^> "Spring Boot App"
echo.
echo Expected output in Console:
echo   Started AdminDashboardMicroserviceApplication in X seconds
echo   Tomcat started on port(s): 8085 (http)
echo.
echo Then test: http://localhost:8085/api/admin/health
echo.
pause
