@echo off
cd backend
echo Starting Backend on 0.0.0.0:8000 for local network access...
venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
pause
