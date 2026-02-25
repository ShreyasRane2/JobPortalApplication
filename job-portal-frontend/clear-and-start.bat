@echo off
echo Clearing React cache and restarting...
echo.

REM Delete .cache directories
if exist node_modules\.cache (
    echo Deleting node_modules\.cache...
    rmdir /s /q node_modules\.cache
)

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force

echo.
echo Starting development server...
echo.
npm start
