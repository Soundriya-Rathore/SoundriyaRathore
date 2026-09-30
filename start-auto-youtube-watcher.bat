@echo off
title Soundriya Rathore - YouTube Auto Channel Watcher
color 0b
echo ========================================================
echo   Soundriya Rathore - YouTube Automatic Video Watcher
echo ========================================================
echo.
echo  This service monitors the YouTube channel (@soundriya.rathore).
echo  Whenever a new video is uploaded:
echo   1. Optimizes Title, Description with Socials & Website, and Tags
echo   2. Creates a 9:16 vertical thumbnail for Shorts
echo   3. Creates a 16:9 thumbnail for normal videos
echo   4. Automatically uploads the custom thumbnail to YouTube
echo.
echo  Checking every 5 minutes. Keep this window open or minimized.
echo  Press Ctrl+C to stop.
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\auto-youtube-watcher.ps1" -IntervalMinutes 5

pause
