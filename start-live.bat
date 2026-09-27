@echo off
title Jewelora - Live Public Launcher
echo ====================================================
echo  JEWELORA - LAUNCHING LIVE PUBLIC ACCESS (HTTPS)
echo ====================================================
echo.
echo Starting Cloudflare Live Secure Tunnel...
echo.
npx --yes cloudflared tunnel --url http://localhost:5000
pause
