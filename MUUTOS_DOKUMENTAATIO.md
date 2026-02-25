# Fortum Myyntiavustaja - Muuntaminen HTML:stä Flask-sovellukseksi

## ✅ Mitä tehtiin

HTML-sovellus muutettiin täysipainoiseksi Flask + Python -sovellukseksi.

## 📦 Luotu rakenne

```
fortum-myyntiavustaja/
├── app.py                      # Flask backend (API-reitit)
├── requirements.txt            # Python-paketit (Flask)
├── README.md                   # Dokumentaatio
├── .gitignore                  # Git-asetukset
├── start.bat                   # Windows käynnistysscripti
├── start.sh                    # Linux/Mac käynnistysscripti
│
├── templates/
│   └── index.html             # HTML-pohja Jinja2 templatingilla
│
└── static/
    └── script.js              # JavaScript logiikka
    
data/                          # Tietokanta (luodaan automaattisesti)
└── call_*.json               # Tallennetut puhelut
```

## 🚀 Käynnistys

### Windows:
```
start.bat
```

### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

### Manuaalinen käynnistys:
```bash
pip install -r requirements.txt
python app.py
```

Avaa sitten: **http://localhost:5000**

## 🔧 Backend (Flask) - Mitä voi tehdä

Sovelluksessa on jo valmiina:

1. **POST /api/save-call** - Tallenna puhelun yhteenveto
2. **GET /api/calls** - Hae kaikki tallennetut puhelut
3. **GET /api/porssi-hinta** - Hae pörssihintatiedot

Tiedot tallennetaan JSON-muodossa `data/`-kansioon.

## 📝 Seuraavat kehitysaskeleet

### 1. Tietokanta-integraatio
```python
# Asenna SQLAlchemy
pip install Flask-SQLAlchemy

# Lisää app.py:yn
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myyntitiedot.db'
db = SQLAlchemy(app)
```

### 2. Käyttäjätunnistautuminen
```python
# Asenna Flask-Login
pip install Flask-Login

# Hallitse käyttäjiä ja istuntoja
```

### 3. Reaaliaikainen pörssihinnan haku
```python
# Asenna requests
pip install requests

# Integroita Nord Pool API
```

### 4. Sähköpostilla lähettäminen
```python
# Asenna Flask-Mail
pip install Flask-Mail

# Lähetä sopimukset sähköpostilla
```

### 5. Raportointi
```python
# Asenna pandas ja matplotlib
pip install pandas matplotlib

# Luo raportointimoduuli
```

## 💡 Hyödylliset komennot

```bash
# Asennus
pip install -r requirements.txt

# Päivitä requirements
pip freeze > requirements.txt

# Käynnistä debug-tilassa
python -m flask run --debug

# Luo tietokanta
python
>>> from app import db
>>> db.create_all()
>>> exit()
```

## 🔐 Tuotantoasetukset

Kun otat sovelluksen tuotantoon:

1. **Aseta `debug=False`** app.py:ssä
2. **Käytä production-palvelinta** (esim. Gunicorn):
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```
3. **Konfiguroi reverse proxy** (esim. Nginx)
4. **Ota SSL/HTTPS käyttöön**
5. **Aseta ympäristömuuttujat** `.env`-tiedostossa

## 📊 Tietokantamalli (tulevaisuus)

```python
class Call(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    customer_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    agreement_type = db.Column(db.String(50))
    notes = db.Column(db.Text)
    savings = db.Column(db.Float)
    created_by = db.Column(db.String(100))

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    base_price = db.Column(db.Float)
    unit_price = db.Column(db.Float)
```

## 📞 Tuki ja kysymykset

Sovellus on nyt täysin skaalautuva ja ylläpidettävä!

---

**Valmistuneet:** 🎉 2026-02-25  
**Flask-versio:** 3.0.0  
**Python:** 3.8+
