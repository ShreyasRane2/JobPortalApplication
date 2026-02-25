@echo off
echo ========================================
echo FORCE CLEAN AND REBUILD ADMIN SERVICE
echo ========================================
echo.

echo Step 1: Stopping any running instances...
echo Please STOP the Admin Service in STS first!
echo.
pause

echo Step 2: Deleting target folder...
cd /d "%~dp0"
if exist target (
    rmdir /s /q target
    echo Target folder deleted successfully!
) else (
    echo Target folder does not exist.
)
echo.

echo Step 3: Deleting .classpath and .project files...
if exist .classpath del /f .classpath
if exist .project del /f .project
echo.

echo Step 4: Running Maven Clean...
call mvnw.cmd clean
echo.

echo Step 5: Running Maven Install (skip tests)...
call mvnw.cmd install -DskipTests
echo.

echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Next steps in STS:
echo 1. Right-click on admin-dashboard-microservice project
echo 2. Select "Maven" -^> "Update Project"
echo 3. Check "Force Update of Snapshots/Releases"
echo 4. Click OK
echo 5. Run as Spring Boot App
echo.
pause
