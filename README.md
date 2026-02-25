# Fortum Myyntiavustaja 8.89 - Flask-versio

Myyntityökalusovellus sähkönmyyntiin, muutettu Flask + Python -ympäristöön.

## 📋 Järjestelmävaatimukset

- Python 3.8+
- pip (Python-paketinhallinta)

## 🚀 Käynnistäminen

### 1. Asenna riippuvuudet

```bash
pip install -r requirements.txt
```

### 2. Käynnistä sovellus

```bash
python app.py
```

### 3. Avaa selaimessa

```
http://localhost:5000
```

## 📁 Kansiorakenne

```
fortum-myyntiavustaja/
├── app.py                 # Flask-sovellus
├── requirements.txt       # Python-riippuvuudet
├── README.md             # Tämä tiedosto
├── templates/
│   └── index.html        # HTML-pohja
├── static/
│   └── script.js         # JavaScript-logiikka
└── data/                 # Tallennetut puhelut (luodaan automaattisesti)
```

## 🎯 Ominaisuudet

- ✅ Interaktiivinen puhelunhallinta
- ✅ Vertailulaskuri kilpailijoille
- ✅ Sopimustietojen tallentaminen
- ✅ Asiakastietojen dokumentointi
- ✅ Yhteenvedon lataaminen tekstinä

## 💾 Tietojen tallentaminen

Puhelun yhteenveto tallennetaan automaattisesti `data/`-kansioon JSON-muodossa:
- Pvm ja aika
- Sopimustiedot
- Asiakastiedot
- Laskentavaiheet

## 🔐 Tietosuoja

Sovellus tallentaa tiedot paikallisesti omalle palvelimelle. Varmista, että:
- Palvelin on turvallisessa verkossa
- Oikeat pääsy-oikeudet on asetettu
- Arkaluontoiset tiedot suojataan

## 📝 Kehityksen seuraavat vaiheet

1. Tietokanta-integraatio (SQLite/PostgreSQL)
2. Käyttäjätunnistautuminen
3. Raportointi ja analysointi
4. Mobiiliversio
5. API-integraatiot (pörssihinnat, sähkönsiirto jne.)

## 🛠️ Kehittäjälle

Flask-kehityspalvelin päivittyy automaattisesti koodiin tehtyjen muutosten jälkeen.

Lisää `debug=False` app.py:ssä, kun otat sovelluksen tuotantoon.

---

**Versio:** 8.89  
**Päivitetty:** 2026-02-25
