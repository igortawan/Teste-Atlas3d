@echo off
chcp 65001 >nul
title ATLAS VET 3D
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080
  node server.mjs 8080
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    start "" http://localhost:8080
    python -m http.server 8080
  ) else (
    echo Instale o Node.js (https://nodejs.org) ou o Python para executar o servidor local.
    pause
  )
)
