@echo off
REM Build script with Java 17 compatibility fix for Spring Boot 4.0.2

echo.
echo ================================
echo Building Application Service with Kafka & JWT
echo ================================
echo.

REM Check if Java 17 is available
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    exit /b 1
)

REM Get current Java version
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| find "version"') do set JAVA_VERSION=%%i
echo Current Java Version: %JAVA_VERSION%

REM Clean and build
echo.
echo Cleaning previous builds...
rmdir /s /q target 2>nul

echo.
echo Downloading dependencies and compiling...
call mvnw.cmd clean compile

if %errorlevel% neq 0 (
    echo.
    echo ============================================
    echo Build Compilation Failed
    echo ============================================
    echo.
    echo SOLUTION: Use Docker to build with Java 17:
    echo.
    echo   docker run --rm -v "%%CD%%":/workspace -w /workspace ^
    echo     maven:3.9-eclipse-temurin-17 ^
    echo     mvn clean package -DskipTests
    echo.
    echo OR update Spring Boot version in pom.xml to 4.0.9+
    echo.
    exit /b 1
)

echo.
echo Packaging application...
call mvnw.cmd package -DskipTests

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo BUILD SUCCESSFUL!
    echo ============================================
    echo.
    echo JAR Location: target\application-service-0.0.1-SNAPSHOT.jar
    echo.
    echo Next steps:
    echo   1. Start services: docker-compose up -d
    echo   2. Run the app: java -jar target\application-service-0.0.1-SNAPSHOT.jar
    echo.
) else (
    echo.
    echo ============================================
    echo BUILD FAILED
    echo ============================================
    echo.
    echo See error messages above for details.
    echo.
)

exit /b %errorlevel%
