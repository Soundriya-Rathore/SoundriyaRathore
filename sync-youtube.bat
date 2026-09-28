@echo off
title Soundriya Rathore - YouTube Auto-Sync
color 0b
echo ========================================================
echo   Soundriya Rathore Portfolio - YouTube Auto-Sync
echo ========================================================
echo.
echo Fetching latest videos from YouTube...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync-youtube.ps1"

echo.
echo ========================================================
echo   Sync Complete! Your files are up to date.
echo ========================================================
echo.
pause
