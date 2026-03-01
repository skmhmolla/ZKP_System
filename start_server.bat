@echo off
echo Starting PrivaSeal Node Backend on http://localhost:8000...
start cmd /k "cd node_backend && set PORT=8000&& npm run dev"
timeout /t 3
echo Starting PrivaSeal Frontend on http://localhost:3000...
start cmd /k "cd frontend && npm run dev"
echo PrivaSeal System Started!
pause
