#!/bin/bash

echo ""
echo "===================================="
echo " Fortum Myyntiavustaja 8.89"
echo " Flask-sovellus"
echo "===================================="
echo ""

# Tarkista Python
if ! command -v python3 &> /dev/null
then
    echo "ERROR: Python3 ei ole asennettu!"
    exit 1
fi

echo "[OK] Python3 löytyi"

# Asenna riippuvuudet
echo ""
echo "Asennetaan riippuvuudet..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "ERROR: Riippuvuuksien asennus epäonnistui!"
    exit 1
fi

echo "[OK] Riippuvuudet asennettu"

# Käynnistä sovellus
echo ""
echo "Käynnistetään sovellusta..."
echo ""
echo "🌐 Avaa selaimessa: http://localhost:5000"
echo ""

python3 app.py
