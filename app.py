"""
Fortum Myyntiavustaja 8.89
Flask-sovellus sähkön myyntiapuun
"""

from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import sys
import logging
import google.generativeai as genai

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'
# Määritetään absoluuttinen polku tietokannalle, jotta se toimii PythonAnywheressä
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'puhelut.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Asetetaan lokitus stderr-virtaan, jotta viestit näkyvät PythonAnywheren error.logissa
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

db = SQLAlchemy(app)

# Tietokanta-kansio
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Tietokantamalli
class Puhelu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    sopimus = db.Column(db.String(100))
    yhtio = db.Column(db.String(100))
    asumismuoto = db.Column(db.String(100))
    neliot = db.Column(db.Integer)
    lammitys = db.Column(db.String(255))
    kulutus = db.Column(db.Integer)
    saastot = db.Column(db.Float)
    muistiinpanot = db.Column(db.Text)
    lopputulos = db.Column(db.String(50))
    lopputulos_vaihe = db.Column(db.String(100))
    polku = db.Column(db.Text)
    aloitus = db.Column(db.String(50))

    def __repr__(self):
        return f'<Puhelu {self.id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'sopimus': self.sopimus,
            'yhtio': self.yhtio,
            'asumismuoto': self.asumismuoto,
            'neliot': self.neliot,
            'lammitys': self.lammitys,
            'kulutus': self.kulutus,
            'saastot': self.saastot,
            'muistiinpanot': self.muistiinpanot,
            'lopputulos': self.lopputulos,
            'lopputulos_vaihe': self.lopputulos_vaihe,
            'polku': self.polku,
            'aloitus': self.aloitus
        }

# Konfiguroi Gemini Pro API
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    logging.warning("VAROITUS: GEMINI_API_KEY ei ole asetettu. Gemini Pro -ominaisuudet eivät toimi.")
    model = None

@app.route('/')
def index():
    """Pääsivu"""
    return render_template('index.html')

@app.route('/api/end-call', methods=['POST'])
def end_call():
    """Tallenna puhelun tiedot ja lopputulos tietokantaan"""
    try:
        data = request.get_json()

        # Tallenna tietokantaan
        puhelu = Puhelu(
            sopimus=data.get('sopimus') or None,
            yhtio=data.get('yhtio') or None,
            asumismuoto=data.get('asumismuoto') or None,
            neliot=data.get('neliot') or None,
            lammitys=data.get('lammitys') or None,
            kulutus=data.get('kulutus') or None,
            saastot=data.get('saastot') or 0,
            muistiinpanot=data.get('muistiinpanot') or None,
            lopputulos=data.get('lopputulos'),
            lopputulos_vaihe=data.get('lopputulos_vaihe'),
            polku=data.get('polku'),
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Puhelun lopputulos tallennettu.',
            'id': puhelu.id
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Virhe: {str(e)}'
        }), 500

@app.route('/api/tilastot', methods=['GET'])
def get_tilastot():
    """Hae dashboardin perustilastot tietokannasta"""
    try:
        total_calls = Puhelu.query.count()
        total_savings = db.session.query(db.func.sum(Puhelu.saastot)).scalar()
        
        # Lasketaan keskimääräinen säästö
        avg_savings = (total_savings / total_calls) if total_calls and total_savings else 0.0

        # Haetaan jakauma asiakkaiden nykyisistä sopimuksista
        contract_stats = db.session.query(Puhelu.sopimus, db.func.count(Puhelu.id)).group_by(Puhelu.sopimus).all()
        stats_dict = {stat[0]: stat[1] for stat in contract_stats if stat[0]}
        
        # Voit lisätä monimutkaisempia tilastoja tähän
        # Esim. keskimääräinen säästö, eniten myyty sopimus jne.

        return jsonify({
            'success': True,
            'total_calls': total_calls if total_calls else 0,
            'total_savings': round(total_savings, 2) if total_savings else 0.0,
            'avg_savings': round(avg_savings, 2),
            'contract_stats': stats_dict
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Virhe: {str(e)}'
        }), 500

@app.route('/api/calls', methods=['GET'])
def get_calls():
    """Hae kaikki tallennetut puhelut tietokannasta"""
    try:
        calls = Puhelu.query.all()
        return jsonify({
            'success': True,
            'calls': [call.to_dict() for call in calls]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Virhe: {str(e)}'
        }), 500

@app.route('/api/porssi-hinta', methods=['GET'])
def get_porssi_price():
    """Hae nykyinen pörssihinta (esimerkki)"""
    # Tämä voisi hakea oikean datan API:sta
    return jsonify({
        'price': '19,65 c/kWh',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/tilastot')
def stats_page():
    """Näytä tilastosivu"""
    return render_template('tilastot.html')

@app.route('/api/funnel-stats', methods=['GET'])
def get_funnel_stats():
    """Hae suppilotilastot tietokannasta"""
    try:
        # Query for deals, no-deals, and hang-ups grouped by the step they occurred in
        stats = db.session.query(
            Puhelu.lopputulos,
            Puhelu.polku,
            db.func.count(Puhelu.id)
        ).group_by(Puhelu.lopputulos, Puhelu.polku).all()

        # Format the data for the frontend
        # {'kauppa': {'Aloitus -> ... -> Kauppa': 10}, ...}
        formatted_stats = {}
        for lopputulos, polku, count in stats:
            if not lopputulos:
                continue
            
            # Käytetään polkua avaimena, tai jos se puuttuu, käytetään "Tuntematon polku"
            path_key = polku if polku else "Tuntematon polku"
            
            # Määritellään kategoria (yhdistetään eri "ei kauppaa" -syyt)
            category = lopputulos
            if lopputulos in ['kieltäytyi soittopyynnöstä', 'ei kiinnostunut', 'ei tavoitettu']:
                category = 'ei kauppaa'

            if category not in formatted_stats:
                formatted_stats[category] = {}
            
            # Summataan jos samalle polulle tulee useampi merkintä
            if path_key in formatted_stats[category]:
                formatted_stats[category][path_key] += count
            else:
                formatted_stats[category][path_key] = count

        # Apufunktio: Laske jakauma ja kauppaprosentti
        def get_category_stats(column):
            # Hakee: (Kategoria, Lopputulos, Määrä)
            query = db.session.query(column, Puhelu.lopputulos, db.func.count(Puhelu.id))
            results = query.group_by(column, Puhelu.lopputulos).all()
            
            stats = {}
            for label, outcome, count in results:
                if not label: continue
                if label not in stats:
                    stats[label] = {'total': 0, 'kauppa': 0, 'ei_kauppaa': 0, 'luuri_korvaan': 0}
                
                stats[label]['total'] += count
                if outcome == 'kauppa':
                    stats[label]['kauppa'] += count
                elif outcome in ['ei kauppaa', 'kieltäytyi soittopyynnöstä', 'ei kiinnostunut', 'ei tavoitettu']:
                    stats[label]['ei_kauppaa'] += count
                elif outcome == 'luuri korvaan':
                    stats[label]['luuri_korvaan'] += count
            
            # Laske prosentit
            for label in stats:
                stats[label]['win_rate'] = round((stats[label]['kauppa'] / stats[label]['total']) * 100, 1)
            return stats

        housing_stats = get_category_stats(Puhelu.asumismuoto)
        heating_stats = get_category_stats(Puhelu.lammitys)
        contract_stats = get_category_stats(Puhelu.sopimus)
        opening_stats = get_category_stats(Puhelu.aloitus)

        # 4. Keskimääräinen kulutus
        avg_consumption = db.session.query(db.func.avg(Puhelu.kulutus)).scalar()

        return jsonify({
            'success': True, 
            'stats': formatted_stats,
            'demographics': {
                'housing': housing_stats,
                'heating': heating_stats,
                'contract': contract_stats,
                'opening': opening_stats
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Virhe tilastojen haussa: {str(e)}'
        }), 500

@app.route('/api/reset-stats', methods=['POST'])
def reset_stats():
    """Nollaa tilastot"""
    try:
        db.session.query(Puhelu).delete()
        db.session.commit()
        return jsonify({'success': True, 'message': 'Kaikki tilastot nollattu onnistuneesti.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/generate-pitch', methods=['POST'])
def generate_pitch():
    """Generoi myyntipuhe Gemini Prolla"""
    if not model:
        return jsonify({'success': False, 'message': 'Gemini Pro API-avainta ei ole asetettu.'}), 500

    try:
        data = request.get_json()
        prompt = f"""
        Luo lyhyt ja vakuuttava myyntipuhe Fortumin sähkösopimuksesta seuraavien asiakastietojen perusteella:
        Asumismuoto: {data.get('asumismuoto')}
        Neliöt: {data.get('neliot')} m²
        Lämmitys: {data.get('lammitys')}
        Kulutus: {data.get('kulutus')} kWh/vuosi
        Nykyinen sopimus: {data.get('sopimus')}
        Nykyinen yhtiö: {data.get('yhtio')}
        Säästöpotentiaali: {data.get('saastot')} €/vuosi

        Korosta erityisesti asiakkaan saamaa säästöä ja Fortumin etuja. Puheen tulee olla myyvä ja asiakasta motivoiva.
        """
        
        response = model.generate_content(prompt)
        return jsonify({'success': True, 'pitch': response.text})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Virhe myyntipuheen generoinnissa: {str(e)}'}), 500

# Varmistetaan, että tietokantataulut ovat olemassa (ajetaan myös PythonAnywheressä)
try:
    with app.app_context():
        db.create_all()
except Exception as e:
    logging.error(f"VIRHE TIETOKANNAN LUONNISSA: {e}")

if __name__ == '__main__':
    logging.info("🚀 Fortum Myyntiavustaja käynnistyy...")
    logging.info("📍 Avaa selain: http://localhost:5000")
    app.run(debug=True, port=5000)
