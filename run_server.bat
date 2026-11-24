@echo off
title The Ivory Table - Restaurant & Owner Server (Python Flask)
echo ===================================================================
echo     ★ THE IVORY TABLE - SEASIDE FINE DINING, MARINE DRIVE ★
echo ===================================================================
echo.
echo Initializing database and starting server on http://localhost:5000 ...
echo.
python database.py
python server.py
pause
