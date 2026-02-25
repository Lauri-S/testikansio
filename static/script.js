// Fortum Myyntiavustaja - JavaScript
// Tämä tiedosto sisältää kaiken logiikan

// --- GLOBAALIT MUUTTUJAT ---
let stepHistory = [];
let currentStep = '';
let valittuAsumismuoto = '';
let valitutNeliot = 100;
let valitutLammitykset = {}; 
let kulutusTiedot = {};
let pricingTiedot = {};
let voitettavaSopimus = '';
let current30DayPrice = "lasketaan...";

// --- VASTA-ARGUMENTIT KIRJASTO ---
const vastaArgumentitData = {
    yleiset: [
        {
            q: "🗣️ \"Tyytyväinen nykyiseen\"",
            arvo: ["Hienoa kuulla, ymmärrän täysin että nykyiseen on helppo tyytyä! Usein on kuitenkin niin, että juuri pitkäaikaisille ja tyytyväisille asiakkaille kertyy huomaamatta piilokuluja. Varsinkin jos teillä on toistaiseksi voimassa oleva sähkösopimus, siinä on todella usein sisäänrakennettuna sellaista niin sanottua 'mukavuuslisää', josta maksatte aivan turhaan. Katsoimme juuri, että teidän asunnossanne säästöpotentiaali on olemassa, joten karsitaanko nämä turhat lisät pois ja päivitetään sopimus kerralla reiluun malliin?"],
            alennus: [
                "Jos viemme tämän nyt kerralla maaliin ja poistamme nuo piilokulut, haluan poikkeuksellisesti tulla teitä vastaan: saatte {{TARJOUS_1}}! Teille ei siis koidu tästä uudesta reilummasta sopimuksesta juurikaan kiinteitä kuluja alkuun. Laitetaanko paperit vetämään?", 
                "Haluan todella näyttää, että meillä ei makseta turhasta mukavuuslisästä. Venytän edun maksimiin: saatte {{TARJOUS_2}}. This is markkinoiden kovin etu juuri nyt, otetaanko tämä heti hyötykäyttöön?"
            ]
        }
    ]
};

const kilpailijat = ["Helen (Helsingin Energia)", "Vattenfall", "Väre", "Oomi", "Vaasan Sähkö", "Lumme Energia", "Aalto Energia", "Hehku Energia", "Herrfors", "Imatran Seudun Sähkö", "Keravan Energia", "Kokkolan Energia", "Kuoreveden Sähkö", "Nordic Green Energy", "Nurmijärven Sähkö", "Pohjois-Karjalan Sähkö (PKS)", "Porvoon Energia", "Ei kerro / Ei tiedä"];

const lammitysAnalyysit = {
    "Sähkölämmitys": { text: "<b>Analyysi:</b> Sähkölämmitys on markkinan herkin hintapiikeille, koska kulutus nousee suoraan pakkasen mukaan.<br><br><b>Onko teillä sielä kyseessä suora sähkölämmitys vai varaava?</b>", answers: ["Suora sähkö", "Varaava sähkö"], extraOptions: ["Takka", "Ilmalämpöpumppu", "Lämminvesivaraaja"] },
    "Maalämpö": { text: "<b>Analyysi:</b> Maalämpö on tehokas, mutta pumppu haukkaa sähköä juuri silloin kun se on markkinalla kalleinta.<br><br><b>Oliko teillä sielä muuten minkäkokoinen varaaja käyttövedelle?</b>", answers: ["Pieni varaaja", "Iso varaaja"], extraOptions: ["Takka", "Ilmalämpöpumppu"] },
    "Kaukolämpö": { text: "<b>Analyysi:</b> Kaukolämmössä kodin lämmitys ei kuluta sähköä, mutta sähkölaitteiden ajoitus korostuu. <br><br><b>Löytyykö teiltä kotoa takkaa tai ilmalämpöpumppua sähkölaskua tasoittamaan?</b>", answers: [], extraOptions: ["Takka", "Ilmalämpöpumppu"] }
};

const scriptData = {
    alku: { title: "ALOITUS", text: "Valitse puhelun fiiliksen mukaan sopiva aloitus alta:", options: [{ label: "1. Kunnioittava & Suora", next: "aloitus_1" }, { label: "2. Asiantunteva", next: "aloitus_2" }, { label: "3. Pattern Interrupt", next: "aloitus_3" }, { label: "4. Suora aloitus", next: "aloitus_suora" }] },
    
    aloitus_1: { title: "Aloitus 1", text: "Moi, [Nimesi] Fortumilta täällä, terve! <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Soitan lyhyesti sähkön hintavaihteluihin liittyen – tiedän, että olet varmasti kiireinen, joten mennään suoraan asiaan. Monella suomalaisella sähkölaskut ovat nyt pompanneet yllättäen ylöspäin, ja halusin soittaa tarkistaakseni, onko teillä kotiin tuleva hinta jo suojattu näiltä piikeiltä?", options: [{ label: "on suojattu", next: "reaktio_hyva" }, { label: "en tiedä", next: "reaktio_ei" }, { label: "ei ole vaikuttanut", next: "reaktio_hyva" }, { label: "asiakkaalla on kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "en vastaa", next: "ei_paattaja" }] },
    
    aloitus_suora: { title: "Suora aloitus", text: "No se on [Nimesi] Fortumilta, moikka! <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Soitan sähkösopimusasioissa, niin vastaatko teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä -> Kartoitukseen", next: "suora_reaktio" }, { label: "asiakkaalla on kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "en vastaa", next: "ei_paattaja" }] },
    
    reaktio_kylla: { title: "Reagointi", text: "Aivan, et todellakaan ole ainoa. Se on ollut monelle aikamoinen yllätys. Lähdetään purkamaan tätä – vastaatko sä teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    reaktio_ei: { title: "Reagointi", text: "Ymmärrän täysin! Mutta juuri sieltä se isoin piikki voi nykyään iskeä. Katsotaan tää tilanne kerralla kuntoon – vastaatko sä muuten teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    reaktio_hyva: { title: "Reagointi", text: "No hienoa kuulla, asiat on siis siellä hyvällä mallilla! Katsotaan silti nopeasti voisitteko säästää nykyisestäkin laskusta. Vastaatko sä teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    
    ei_paattaja: { title: "Soittopyyntö", text: "Ymmärrän! Soittoni on kuitenkin tärkeä koko talouden kannalta, sillä nämä sähkön hintapiikit nostavat kuluja huomattavasti. Pääsisikö hän nyt ihan minuutiksi puhelimeen?", options: [{ label: "Päättäjä puhelimeen", next: "alku" }, { label: "Sain numeron", next: "alku" }, { label: "Ei onnistunut", next: "alku" }] },
    
    kartoitus_tiedot: { title: "Sopimus", text: "Hienoa! Ihan ensimmäisenä, onko teillä hinta lukittu määräaikaisella, vai onko sielä pörssisähkö tai toistaiseksi voimassa oleva?", options: [{ label: "Määräaikainen", next: "kartoitus_yhtio", saveSopimus: "Määräaikainen" }, { label: "Pörssi / TVO", next: "kartoitus_yhtio", saveSopimus: "Pörssi" }] },
    
    kartoitus_yhtio: { title: "Yhtiö", text: "Minkä yhtiön kanssa teillä on tämä sopimus tällä hetkellä?", type: "yhtio-select" },
    
    kartoitus_avoin: { title: "Asumismuoto", text: "Hienoa! Ihan ensimmäisenä, millaista kotia teillä siellä oikein lämmitetään?", type: "asunto-select", asuntoOptions: ["Kerrostalo", "Rivitalo", "Paritalo", "Erillistalo", "Omakotitalo", "Mökki"] }
};

// --- FUNKTIOT ---

function renderStep(stepId, isHistoryBypass = false) {
    const step = scriptData[stepId];
    if (!step) return;
    const container = document.getElementById('content');
    if (!isHistoryBypass && currentStep !== '' && currentStep !== stepId) stepHistory.push(currentStep);
    currentStep = stepId;
    
    let txt = (step.text || "").replace('{{KESKIHINTA}}', current30DayPrice);
    let html = `<span class="step-info">${step.title}</span>`;
    
    if (step.type === "yhtio-select") {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        kilpailijat.forEach(y => { html += `<button class="yhtio-btn" onclick="tallennaYhtio('${y}')">${y}</button>`; });
        html += `</div>`;
    } else if (step.type === "asunto-select") {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        step.asuntoOptions.forEach(opt => { html += `<button class="answer-btn" onclick="valitseAsuntoTyyppi('${opt}', this)">${opt}</button>`; });
        html += `</div>`;
    } else if (step.options) {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        step.options.forEach(o => {
            let act = `renderStep('${o.next}')`;
            if(o.saveSopimus) act = `tallennaSopimus('${o.saveSopimus}', '${o.next}')`;
            html += `<button class="primary-action-btn" onclick="${act}">${o.label}</button>`;
        });
        html += `</div>`;
    } else { html += `<div class="speech-bubble">${txt}</div>`; }
    
    if(stepId !== 'alku') html += `<div style="margin-top:20px;"><button class="back-btn" onclick="goBack()">← Takaisin</button><span class="reset-link" onclick="resetApp()">Palaa alkuun</span></div>`;
    
    container.innerHTML = html;
    window.scrollTo(0,0);
}

function tallennaSopimus(t, n) { voitettavaSopimus = t; updateSummaryView(); renderStep(n); }
function valitseAsuntoTyyppi(opt, btn) { valittuAsumismuoto = opt; document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('confirmed')); btn.classList.add('confirmed'); }
function tallennaYhtio(y) { document.getElementById('kilpailija-yhtio-input').value = y.includes("Ei kerro") ? "" : y; updateSummaryView(); renderStep('kartoitus_avoin'); }

function calculateSavings() {
    const parseInput = (val) => parseFloat((val || '').toString().replace(/\s/g, '').replace(',', '.')) || 0;
    const currentConsVal = parseInput(document.getElementById('calc-cons')?.value);
    const pmComp = parseInput(document.getElementById('calc-pm')?.value);
    const hComp = parseInput(document.getElementById('calc-marg')?.value);
    const pmOur = parseInput(document.getElementById('our-pm')?.value);
    const hOur = parseInput(document.getElementById('our-marg')?.value);
    
    const costCompY = (pmComp * 12) + (currentConsVal * hComp / 100);
    const costOurY = (pmOur * 12) + (currentConsVal * hOur / 100);
    const diffY = costCompY - costOurY;
    const diffM = diffY / 12;

    const resultDiv = document.getElementById('calc-result');
    if (!resultDiv) return;
    
    let htm = `<div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom: 15px;">
            <div style="background:#f8fafc; padding:10px; border-radius:8px; border: 1px solid #ddd; text-align: center;">
                <span style="font-size: 0.65rem; font-weight: bold; color: #64748b; display: block; margin-bottom: 2px;">KILPAILIJA</span>
                <b>${costCompY.toFixed(2).replace('.', ',')} €/v</b>
            </div>
            <div style="background:#f0fdf4; padding:10px; border-radius:8px; border: 1px solid #bbf7d0; text-align: center;">
                <span style="font-size: 0.65rem; font-weight: bold; color: #166534; display: block; margin-bottom: 2px;">FORTUM</span>
                <b>${costOurY.toFixed(2).replace('.', ',')} €/v</b>
            </div>
        </div>`;

    if (diffY > 0.01) {
        htm += `<div style="background: #dcfce7; padding: 8px; border-radius: 8px; border: 2px solid #22c55e; text-align: center;">
                <span style="font-weight: bold; color: #166534;">Säästö: ${diffY.toFixed(2).replace('.', ',')} €/v (${diffM.toFixed(2).replace('.', ',')} €/kk)</span>
            </div>`;
    }
    htm += `</div>`;
    resultDiv.innerHTML = htm;
}

function updateSummaryView() {
    const yhtioInput = document.getElementById('kilpailija-yhtio-input');
    if (!yhtioInput) return;
    
    let sopimusTags = voitettavaSopimus ? `<span class="tag">⚡ ${voitettavaSopimus}</span>` : "";
    document.getElementById('sopimus-tags').innerHTML = sopimusTags;
}

function resetApp() {
    stepHistory = []; currentStep = ''; valittuAsumismuoto = ''; valitutNeliot = 100;
    valitutLammitykset = {}; kulutusTiedot = {}; pricingTiedot = {}; voitettavaSopimus = '';
    document.getElementById('kilpailija-yhtio-input').value = '';
    document.getElementById('calc-cons').value = '';
    updateSummaryView(); renderStep('alku', true);
}

function goBack() { 
    if (stepHistory.length > 0) renderStep(stepHistory.pop(), true); 
}

function tallennaPuhelu() {
    let text = `FORTUM YHTEENVETO\n`;
    text += `Pvm: ${new Date().toLocaleString('fi-FI')}\n`;
    text += `Sopimus: ${voitettavaSopimus || '-'}\n`;
    text += `Yhtiö: ${document.getElementById('kilpailija-yhtio-input').value || '-'}\n`;
    text += `Asunto: ${valittuAsumismuoto || '-'}\n`;
    text += `Muistiinpanot: ${document.getElementById('muistiinpanot').value || '-'}\n`;
    
    const a = document.createElement("a"); 
    a.href = window.URL.createObjectURL(new Blob([text], {type:"text/plain"})); 
    a.download = "Yhteenveto.txt"; 
    a.click();
}

// Alusta sovellus
renderStep('alku');
