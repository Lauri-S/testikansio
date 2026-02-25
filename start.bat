@echo off
REM Fortum Myyntiavustaja käynnistysscripti

echo.
echo ====================================
echo  Fortum Myyntiavustaja 8.89
echo  Flask-sovellus
echo ====================================
echo.

REM Tarkista Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python ei ole asennettu tai ei ole PATH-ympäristömuuttujan sisällä!
    pause
    exit /b 1
)

echo [OK] Python löytyi

REM Tarkista riippuvuudet
echo.
echo Asennetaan riippuvuudet...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ERROR: Riippuvuuksien asennus epäonnistui!
    pause
    exit /b 1
)

echo [OK] Riippuvuudet asennettu

REM Käynnistä sovellus
echo.
echo Käynnistetään sovellusta...
echo.
echo 🌐 Avaa selaimessa: http://localhost:5000
echo.

python app.py

pause
