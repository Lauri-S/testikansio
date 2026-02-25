"""
Fortum Myyntiavustaja 8.89
Flask-sovellus sähkön myyntiapuun
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime
import json
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Tietokanta-kansio
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

@app.route('/')
def index():
    """Pääsivu"""
    return render_template('index.html')

@app.route('/api/save-call', methods=['POST'])
def save_call():
    """Tallenna puhelun yhteenveto"""
    try:
        data = request.get_json()
        timestamp = datetime.now().isoformat()
        
        # Tallenna tiedot JSON-tiedostoon
        filename = os.path.join(DATA_DIR, f"call_{timestamp.replace(':', '-')}.json")
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': timestamp,
                'data': data
            }, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'message': 'Puhelun yhteenveto tallennettu',
            'filename': filename
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Virhe: {str(e)}'
        }), 500

@app.route('/api/calls', methods=['GET'])
def get_calls():
    """Hae kaikki tallennetut puhelut"""
    try:
        calls = []
        if os.path.exists(DATA_DIR):
            for filename in sorted(os.listdir(DATA_DIR), reverse=True):
                if filename.endswith('.json'):
                    filepath = os.path.join(DATA_DIR, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        call_data = json.load(f)
                        calls.append({
                            'filename': filename,
                            'data': call_data
                        })
        
        return jsonify({
            'success': True,
            'calls': calls
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

if __name__ == '__main__':
    print("🚀 Fortum Myyntiavustaja käynnistyy...")
    print("📍 Avaa selain: http://localhost:5000")
    app.run(debug=True, port=5000)
