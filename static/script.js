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
            arvo: ["Hienoa kuulla, ymmärrän täysin että nykyiseen on helppo tyytyä! Usein on kuitenkin niin, että juuri pitkäaikaisille ja tyytyville asiakkaille kertyy huomaamatta piilokuluja. Varsinkin jos teillä on toistaiseksi voimassa oleva sähkösopimus, siinä on todella usein sisäänrakennettuna sellaista niin sanottua 'mukavuuslisää', josta maksatte aivan turhaan. Katsoimme juuri, että teidän asunnossanne säästöpotentiaali on olemassa, joten karsitaanko nämä turhat lisät pois ja päivitetään sopimus kerralla reiluun malliin?"],
            alennus: [
                "Jos viemme tämän nyt kerralla maaliin ja poistamme nuo piilokulut, haluan poikkeuksellisesti tulla teitä vastaan: saatte {{TARJOUS_1}}! Teille ei siis koidu tästä uudesta reilummasta sopimuksesta juurikaan kiinteitä kuluja alkuun. Laitetaanko paperit vetämään?", 
                "Haluan todella näyttää, että meillä ei makseta turhasta mukavuuslisästä. Venytän edun maksimiin: saatte {{TARJOUS_2}}. This is markkinoiden kovin etu juuri nyt, otetaanko tämä heti hyötykäyttöön?"
            ]
        },
        {
            q: "🗣️ \"Laitatko tarjouksen sähköpostiin?\"",
            arvo: ["Meidän käytäntömme on nykyään se, että voin tästä lähettää teille puhelimeen valmiiksi neuvotellun sopimusluonnoksen. Se on kaikista turvallisin tapa: saatte rauhassa tarkastaa sen tekstiviestin kautta ja hyväksyä sen itse yhdellä painalluksella. Jos laitetaan tämä nyt teille vireille, saatte heti käyttöönne tuon äsken katsomamme edun! Laitetaanko paketti teille puhelimeen tarkastettavaksi?"],
            alennus: ["Jos viemme tämän nyt kerralla maaliin, haluan poikkeuksellisesti tulla teitä vastaan ja tarjota tähän päälle vielä perusmaksut 0 € ensimmäiseksi 3 kuukaudeksi. Teille ei siis koidu tästä mitään kiinteitä kuluja alkuun. Laitetaanko tekstarilla tarkastettavaksi?"]
        },
        {
            q: "🗣️ \"Pitää kysyä puolisolta\"",
            arvo: ["Totta kai, se on reilua. Yleensä puolisot ovat kuitenkin vain tyytyväisiä, kun sähkölaskua saadaan pienennettyä ilman että arki muuttuu. Koska säästö on näin selkeä ja riskitön, niin lukitaanko tämä teidän nimiinne nyt heti? Näin pääsette yllättämään puolison positiivisesti pienemmällä sähkölaskulla jo heti seuraavassa kuussa, ilman että teidän tarvitsee murehtia tästä enää yhdessä."],
            alennus: ["Jos lyödään kättä päälle nyt, saatte 3kk ilman perusmaksuja kaupan päälle.", "Viimeinen tarjous: 6kk ilman perusmaksuja, jos hoidetaan tämä nyt kuntoon."]
        }
    ],
    pitch_duo: [
        {
            q: "🗣️ \"Mietin vielä / Palataan myöhemmin\"",
            arvo: [
                "Ymmärrän täysin, että haluatte pohtia! Fakta on kuitenkin se, että pörssisähkö on juuri nyt historiallisesti erittäin matalalla. Meillä Fortumilla saatte Duon avulla markkinoiden halvimmat tunnit käyttöönne ja voitte itse vaikuttaa laskuunne. Laitetaanko paperit vetämään?",
                "Lisäksi kun katsotaan teidän äsken kertomianne tietoja – asutte kohteessa <b>{{ASUMISMUOTO}}</b> ja teillä on <b>{{LAITTEET}}</b> – näillä saadaan heti oikeaa säästöä aikaan. Oman laitteistonne ja fiksun ajoituksen ansiosta voitte todella helposti tienata kulutusvaikutuksen kautta <b>{{KULUTUSVAIKUTUS}} c/kWh</b> lisäalennusta laskullenne. Vahvistetaanko tämä säästömahdollisuus heti teille käyttöön?"
            ],
            alennus: [
                "Koska haluan todella, että pääsette tähän etuuun kiinni heti, teen teille poikkeuksen: nollaan teidän perusmaksut ensimmäiseksi 3 kuukaudeksi! Saatte kiinteän hinnan suojan ja sovelluksen säästötyökalut ilman kiinteitä kuluja. Eiköhän lyödä tämä lukkoon?",
                "Okei, haluan olla täysin reilu ja viedä tämän maaliin asti. Jos lyödään kättä päälle nyt heti, tuplaan tuon edun. Saat peräti 6 kuukautta ilman perusmaksuja. Kiinteä suoja ja puoli vuotta ilman perusmaksua on kyllä markkinoiden kovin etu juuri nyt. Tehdäänkö näin?"
            ]
        },
        {
            q: "🗣️ \"Tämä on kalliimpi kuin nykyinen / Perushinta on korkea\"",
            arvo: [
                "Kyllä! Meidän sopimuksemme on <b>{{HINTAERO_KK}} €/kk</b> kalliimpi, ja tällä sijoituksella saatte täyden vakuutuksen talven hintapiikkejä vastaan! Lisäksi Duo-asiakkaana voitte itse painaa hintaa alaspäin ajoittamalla käyttöä edullisille tunneille. Tämä malli palkitsee teidät heti. Laitetaanko tämä hintakatto ja säästömahdollisuus teille heti turvaksi?",
                "Kyllä! Meidän on kuukaudessa <b>{{HINTAERO_KK}} €</b> kalliimpi, ja tällä erotuksella ostatte ennen kaikkea mielenrauhaa ja luotettavuutta. Fortum on valtio-omisteinen, erittäin vakavarainen yhtiö. Tällä varmistatte, ettei sähköyhtiönne mene nurin tai muuta ehtojaan yksipuolisesti kesken pahimman talvipakkasen. Eiköhän pelata varman päälle?"
            ],
            alennus: [
                "Tehdäänpä niin, että koska neliöitä ja laitteita on teillä tuo määrä, tulen teitä suoraan vastaan. Nollaan teiltä perusmaksut ensimmäiseksi 3 kuukaudeksi. Saat siis halvan kiinteän hinnan turvan markkinoiden kalleimmalle ajalle, muttet maksa niitä perusmaksuja. Laitetaanko paperit vetämään?", 
                "Okei, haluan olla täysin reilu ja viedä tämän maaliin asti. Jos lyödään kättä päälle nyt heti, tuplaan tuon edun. Saat peräti 6 kuukautta ilman perusmaksuja. Kiinteä suoja ja puoli vuotta ilman perusmaksua on kyllä markkinoiden kovin etu juuri nyt. Tehdäänkö näin?"
            ]
        }
    ],
    pitch_porssi: [
        {
            q: "🗣️ \"Mietin vielä / Palataan myöhemmin\"",
            arvo: [
                "Ymmärrän täysin! Fakta on kuitenkin se, että pörssisähkön 30 päivän keskihinta on nyt <b>{{KESKIHINTA}}</b>. Markkina on juuri nyt poikkeuksellisen korkealla ja arvaamaton. Juuri siksi asialle kannattaa tehdä jotain *nyt*, eikä jäädä tuleen makaamaan. Fortum Tarkan avulla emme lukitse teitä pitkään ja kalliiseen sopimukseen, vaan pääsette heti hyötymään hintojen laskusta, kun markkina taas rauhoittuu. Lisäksi ainutlaatuisella Hintatakuulla voitte milloin tahansa suojautua pahimmilta hintapiikeiltä. Laitetaanko tämä joustava turvaverkko heti rullaamaan?",
                "Tiesitkö muuten, että asiakkaanamme saatte palkitun Oma Fortum -sovelluksen? Näette tarkalleen mihin sähköä kuluu ja voitte automaattisesti välttää kalleimmat tunnit jatkossa. Laitetaanko tämä etu heti teille rullaamaan?"
            ],
            alennus: [
                "Ymmärrän, että päätös vaatii harkintaa tällaisessa markkinatilanteessa. Koska haluan todella, että saatte tämän suojan nopeasti päälle, voin poikkeuksellisesti tulla vastaan: saatte perusmaksun -50% alennuksella koko ensimmäisen 6 kuukauden ajaksi! Pääsette siis taklaamaan näitä korkeita hintoja fiksummin ja pienemmillä kiinteillä kuluilla. Eiköhän lukita tämä reilu diili nyt saman tein?"
            ]
        },
        {
            q: "🗣️ \"Pörssisähkö pelottaa / Hinnat voivat nousta\"",
            arvo: ["Se on aivan ymmärrettävä huoli! Juuri siksi Fortum Tarkka on markkinoiden fiksuin pörssisähkö: meiltä saatte ainutlaatuisen Hintatakuu-ominaisuuden. Voitte milloin tahansa lukita hinnan suoraan sovelluksesta, jos markkina alkaa hirvittää. Saatte siis pörssin edut mutta tukevan turvaverkon. Avataanko teille tämä joustava turvaverkko heti käyttöön?"],
            alennus: ["Ymmärrän riskin tunteen täysin, ja siksi haluan madaltaa kynnystänne kokeilla tätä. Tulemme kiinteissä kuluissa reilusti vastaan: saatte perusmaksun -50% alennuksella koko ensimmäisen 6 kuukauden ajaksi! Pääsette nauttimaan pörssin edullisista tunneista pienemmillä kuluilla, ja teillä on silti tuo Hintatakuu turvana. Laitetaanko tämä etu nyt teille lukkoon?"]
        }
    ]
};

const kilpailijat = ["Helen (Helsingin Energia)", "Vattenfall", "Väre", "Oomi", "Vaasan Sähkö", "Lumme Energia", "Aalto Energia", "Hehku Energia", "Herrfors", "Imatran Seudun Sähkö", "Keravan Energia", "Kokkolan Energia", "Kuoreveden Sähkö", "Nordic Green Energy", "Nurmijärven Sähkö", "Pohjois-Karjalan Sähkö (PKS)", "Porvoon Energia", "Ei kerro / Ei tiedä"];
const kilpailijaLinkit = { "Helen (Helsingin Energia)": "https://www.helen.fi/sahko/sahkosopimus", "Vattenfall": "https://www.vattenfall.fi/sahkosopimukset/", "Väre": "https://vare.fi/sahkosopimus/", "Oomi": "https://oomi.fi/sahko/sahkosopimukset/", "Vaasan Sähkö": "https://www.vaasansahko.fi/sahkosopimus/", "Lumme Energia": "https://www.lumme-energia.fi/sahkosopimus", "Aalto Energia": "https://aaltoenergia.com/", "Hehku Energia": "https://hehkuenergia.fi/sahkosopimukset/", "Herrfors": "https://www.herrfors.fi/valitse-paras-sahkosopimus/", "Imatran Seudun Sähkö": "https://www.issoy.fi/tee-sahkosopimus/", "Keravan Energia": "https://www.keravanenergia.fi/sahkosopimukset/", "Kokkolan Energia": "https://www.kokkolanenergia.fi/fi/sahko/", "Kuoreveden Sähkö": "https://www.kuorevedensahko.fi/tuotteet-ja-palvelut/sahkon-myynti/tee-sahkosopimus/", "Nordic Green Energy": "https://www.nordicgreen.fi/", "Nurmijärven Sähkö": "https://online.nurmijarvensahko.fi/contract/", "Pohjois-Karjalan Sähkö (PKS)": "https://www.pks.fi/sahkosopimus-kotiin#sopimukset", "Porvoon Energia": "https://www.pbe.fi/fi/sahko/sahkosopimukset/", "Turku Energia": "https://www.turkuenergia.fi/kotitaloudet/sahko/sahkosopimukset-ja-hinnat" };

const lammitysAnalyysit = {
    "Sähkölämmitys": { text: "<b>Analyysi:</b> Sähkölämmitys on markkinan herkin hintapiikeille, koska kulutus nousee suoraan pakkasen mukaan.<br><br><b>Onko teillä sielä kyseessä suora sähkölämmitys vai varaava?</b>", answers: ["Suora sähkö", "Varaava sähkö"], extraOptions: ["Takka", "Ilmalämpöpumppu", "Lämminvesivaraaja"] },
    "Maalämpö": { text: "<b>Analyysi:</b> Maalämpö on tehokas, mutta pumppu haukkaa sähköä juuri silloin kun se on markkinalla kalleinta.<br><br><b>Oliko teillä sielä muuten minkäkokoinen varaaja käyttövedelle?</b>", answers: ["Pieni varaaja", "Iso varaaja"], extraOptions: ["Takka", "Ilmalämpöpumppu"] },
    "Kaukolämpö": { text: "<b>Analyysi:</b> Kaukolämmössä kodin lämmitys ei kuluta sähköä, mutta sähkölaitteiden ajoitus korostuu. <br><br><b>Löytyykö teiltä kotoa takkaa tai ilmalämpöpumppua sähkölaskua tasoittamaan?</b>", answers: [], extraOptions: ["Takka", "Ilmalämpöpumppu"] },
    "PILP": { text: "<b>Analyysi:</b> Poistoilmalämpöpumppu kytkee vastukset päälle usein kylmimmillä tunneilla. <br><br><b>Löytyykö teiltä kotoa takkaa sähkölaskua tasoittamaan?</b>", answers: [], extraOptions: ["Takka"] },
    "Ilmalämpöpumppu": { text: "<b>Analyysi:</b> ILP on loistava tapa ohjata kulutusta, mutta kovilla pakkasilla tarvidaan usein tukea. <br><br><b>Onko teillä sähköpatterit tai takka tukemassa, ja löytyykö varaaja?</b>", answers: [], extraOptions: ["Sähköpattereita", "Lämminvesivaraaja", "Takka"] },
    "Öljylämmitys": { text: "<b>Analyysi:</b> Öljyllä sähkövastus voi yllättää laskulla. <br><br><b>Löytyykö kattilasta sähkövastus?</b>", answers: ["Sähkövastus"], extraOptions: ["Takka", "Ilmalämpöpumppu"] },
    "Puukeskuslämmitys": { text: "<b>Analyysi:</b> Puukeskuslämmitys on loistava tapa ohjata kulutusta, mutta kova työ. <br><br><b>Oliko teillä sähkövastukset tai ilmalämpöpumppu mukana helpottamassa?</b>", answers: [], extraOptions: ["Sähkövastus", "Ilmalämpöpumppu"] },
    "Puulämmitys (tulisijat)": { text: "<b>Analyysi:</b> Takka on loistava vakuutus hintapiikkejä vastaan. <br><br><b>Löytyykö takan lisäksi ilmalämpöpumppuja tai sähköpattereita?</b>", answers: [], extraOptions: ["Ilmalämpöpumppu", "Sähköpatterit", "Lämminvesivaraaja"] }
};

const scriptData = {
    alku: { title: "ALOITUS", text: "Valitse puhelun fiiliksen mukaan sopiva aloitus alta:", options: [{ label: "1. Kunnioittava & Suora", next: "aloitus_1" }, { label: "2. Asiantunteva", next: "aloitus_2" }, { label: "3. Rento", next: "aloitus_3" }, { label: "4. Suora aloitus", next: "aloitus_suora" }] },
    
    aloitus_1: { title: "Aloitus 1", text: "Moi, [Nimesi] Fortumilta täällä, terve! <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Soitan lyhyesti sähkön hintavaihteluihin liittyen – tiedän, että olet varmasti kiireinen, joten mennään suoraan asiaan. Monella suomalaisella sähkölaskut ovat nyt pompanneet yllättäen ylöspäin, ja halusin soittaa tarkistaakseni, onko teillä kotiin tuleva hinta jo suojattu näiltä piikeiltä?", options: [{ label: "on suojattu", next: "reaktio_hyva" }, { label: "en tiedä", next: "reaktio_ei" }, { label: "ei ole vaikuttanut", next: "reaktio_hyva" }, { label: "asiakkaalla on kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "en vastaa", next: "ei_paattaja" }] },
    
    aloitus_2: { title: "Aloitus 2", text: "Moi, [Nimesi] Fortumilta, päivää. <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Soitan sähkömarkkinoiden poikkeustilanteen vuoksi. Viimeisen 30 päivän aikana pörssisähkön keskihinta on pyörinyt <b><span id='live-price-tag'>{{KESKIHINTA}}</span></b> tuntumassa, mikä on tullut monelle kalliiksi yllätykseksi.<br><br>Teemme nyt asiakkaillemme nopeita kulutusanalyyseja, joilla varmistetaan, ettei talven aikana tule turhia ylilyöntejä. Saat tästä parin minuutin puhelusta joka tapauksessa asiantuntijan vinkit laskun pienentämiseen. Joko olet ehtinyt katsomaan, millaisella keskihinnalla teidän viimeisin lasku toteutui?", options: [{ label: "On noussut / Korkea", next: "reaktio_kylla" }, { label: "En ole tarkastanut", next: "reaktio_ei" }, { label: "Asiakkaalla kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "En vastaa", next: "ei_paattaja" }] },
    
    aloitus_3: { title: "Rento aloitus", text: "Moi [Asiakas], [Nimesi] Fortumilta, terve. <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Sanon also ihan suoraan kättelyssä, että tämä on myyntipuhelu – eli jos haluat iskeä luurin korvaan, nyt on täydellinen hetki!<br><br>Mutta jos annat minulle 60 sekuntia, lupaan näyttää aivan uuden tavan taklata nämä sähkön hintapiikit niin, ettei niitä tarvitse enää miettiä. Miten on, millä tavalla tammi- tai helmikuun lasku on ottamassa lompakonpäälle?", options: [{ label: "Kallis lasku", next: "reaktio_kylla" }, { label: "En tiedä / En ole", next: "reaktio_ei" }, { label: "Ei ole vaikuttanut", next: "reaktio_hyva" }, { label: "Asiakkaalla kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "En vastaa", next: "ei_paattaja" }] },
    
    aloitus_suora: { title: "Suora aloitus", text: "No se on [Nimesi] Fortumilta, moikka! <b>Ihan tähän alkuun kerron, että meillä Fortumilla kaikki puhelut tallennetaan ja tietosuojaseloste löytyy osoitteesta fortum.fi/tietosuoja.</b> Soitan sähkösopimusasioissa, niin vastaatko teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "asiakkaalla on kiire", next: "kiire_reaktio" }, { label: "Ei nyt / ei ajankohtainen", next: "motivaatio_ei_nyt" }, { label: "en vastaa", next: "ei_paattaja" }] },
    
    kiire_reaktio: { title: "Kiire", text: "Ymmärrän, että on kiire! Sähköasiat on kuitenkin sellaisia, että ne kannattaa hoitaa kuntoon ennen kuin hinnat taas nousee. Menee tasan minuutti, kun katson onko teidän sopimus ajan tasalla. Onko teillä nyt määräaikainen vai pörssisähkö?", options: [{ label: "Määräaikainen", next: "kartoitus_kesto", saveSopimus: "Määräaikainen" }, { label: "Pörssi / TVO", next: "kartoitus_tarkennus", saveSopimus: "Pörssi" }, { label: "Soita myöhemmin", next: "soitto_ohjaus" }] },

    motivaatio_ei_nyt: { title: "Ei ajankohtainen", text: "Ymmärrän hyvin. Moni muukin on sanonut aluksi noin. Mutta kun olemme laskeneet auki, kuinka paljon nykyinen sopimus voi maksaa ylimääräistä vuodessa, mieli on muuttunut. Ihan vertailun vuoksi, onko teillä tällä hetkellä määräaikainen vai pörssisähkö?", options: [{ label: "Määräaikainen", next: "kartoitus_kesto", saveSopimus: "Määräaikainen" }, { label: "Pörssi / TVO", next: "kartoitus_tarkennus", saveSopimus: "Pörssi" }, { label: "En kerro / Lopeta", next: "ei_paattaja" }] },

    reaktio_kylla: { title: "Reagointi", text: "Aivan, et todellakaan ole ainoa. Se on ollut monelle aikamoinen yllätys. Lähdetään purkamaan tätä – vastaatko sä teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    reaktio_ei: { title: "Reagointi", text: "Ymmärrän täysin! Mutta juuri sieltä se isoin piikki voi nykyään iskeä. Katsotaan tää tilanne kerralla kuntoon – vastaatko sä muuten teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    reaktio_hyva: { title: "Reagointi", text: "No hienoa kuulla, asiat on siis siellä hyvällä mallilla! Katsotaan silti nopeasti voisitteko säästää nykyisestäkin laskusta. Vastaatko sä teidän talouden sähkösopimuksista?", options: [{ label: "Kyllä vastaa -> Kartoitukseen", next: "kartoitus_tiedot" }, { label: "Ei vastaa", next: "ei_paattaja" }] },
    
    ei_paattaja: { title: "Soittopyyntö", text: "Ymmärrän! Soittoni on kuitenkin tärkeä koko talouden kannalta, sillä nämä sähkön hintapiikit nostavat kuluja huomattavasti. Pääsisikö hän nyt ihan minuutiksi puhelimeen?", options: [{ label: "Päättäjä puhelimeen", next: "alku" }, { label: "Sain numeron", outcome: "uusi numero" }, { label: "Ei onnistunut", outcome: "ei tavoitettu" }] },
    
    kartoitus_tiedot: { title: "Sopimus", text: "Hienoa! Ihan ensimmäisenä, onko teillä hinta lukittu määräaikaisella, vai onko sielä pörssisähkö tai toistaiseksi voimassa oleva?", options: [{ label: "Määräaikainen", next: "kartoitus_kesto", saveSopimus: "Määräaikainen" }, { label: "Pörssi / TVO", next: "kartoitus_tarkennus", saveSopimus: "Pörssi" }] },
    
    kartoitus_yhtio: { title: "Yhtiö", text: "Minkä yhtiön kanssa teillä on tämä sopimus tällä hetkellä?", type: "yhtio-select" },
    kartoitus_kesto: { title: "Kesto", text: "Milloin sopimus päättyy?", options: [{ label: "Alle 3 kk -> Jatka", next: "kartoitus_yhtio", savePricing: ["Kesto", "Alle 3 kk"] }, { label: "3kk - 12 kk -> Soittopyyntö", next: "soitto_ohjaus", savePricing: ["Kesto", "3-12 kk"] }, { label: "Yli 12 kk -> Turvapalvelu / Muut", next: "muut_palvelut", savePricing: ["Kesto", "Yli 12 kk"] }] },
    soitto_ohjaus: { title: "Soittopyyntö", text: "Ymmärrän, eli sähkösopimusta on vielä jäljellä. **Sopisiko että merkkaan teille soittopyynnön 2kk ennen päättymistä?**", options: [{ label: "Sovi soitto 🎉", outcome: "soittopyyntö" }, { label: "Ei kiitos", outcome: "kieltäytyi soittopyynnöstä" }] },
    muut_palvelut: { title: "Muut palvelut", text: "Sopimusta on vielä pitkä pätkä. Kuitenkin, moni haluaa Fortumin Turvapalvelun laitteiden suojaksi. **Laitetaanko se heti voimaan?**", options: [{ label: "Turvapalvelu tuli! 🎉", outcome: "turvapalvelu" }, { label: "Ei kiitos", outcome: "ei kiinnostunut" }] },
    kartoitus_tarkennus: { title: "Tyyppi", text: "Okei, onko se pörssisähkö vai toistaiseksi voimassa oleva?", options: [{ label: "Pörssisähkö", next: "kartoitus_yhtio", saveSopimus: "Pörssisähkö" }, { label: "Toistaiseksi voimassa oleva", next: "kartoitus_yhtio", saveSopimus: "Toistaiseksi voimassa oleva" }] },
    
    kartoitus_avoin: { title: "Asumismuoto", text: "Hienoa! Ihan ensimmäisenä, millaista kotia teillä siellä oikein lämmitetään?", type: "asunto-select", asuntoOptions: ["Kerrostalo", "Rivitalo", "Paritalo", "Erillistalo", "Omakotitalo", "Mökki"] },
    kartoitus_lammitys: { title: "Lämmitys", text: "Millä se tupa pysyy lämpimänä?", type: "dynamic-lammitys" },
    kulutus_ohjaus: { title: "Ohjaus", text: "Oletteko muuten yhtään ohjanneet noita kulutuksia tai lämmitystä pörssihintojen mukaan?", options: [{ label: "Ohjataan paljon", next: "kulutus_henkilot", savePricing: ["Ohjaus", "Paljon"] }, { label: "Epäröintiä", next: "kulutus_henkilot", savePricing: ["Ohjaus", "Epäröintiä"] }, { label: "Ei yhtään", next: "kulutus_henkilot", savePricing: ["Ohjaus", "Ei yhtään"] }] },
    kulutus_henkilot: { title: "Kokoonpano", text: "Millainen kokoonpano teitä siinä asuu?", options: [{ label: "1 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "1 hlö"] }, { label: "2 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "2 hlö"] }, { label: "3 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "3 hlö"] }, { label: "4 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "4 hlö"] }, { label: "5 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "5 hlö"] }, { label: "6 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "6 hlö"] }, { label: "7 hlö", next: "kulutus_alku", saveKulutus: ["Taloudessa", "7 hlö"] }] },
    kulutus_alku: { title: "Laitteet", text: "Mihin asioihin teillä uskotaan kuluvan tällä hetkellä kaikista eniten sähköä?", type: "multi-laitteet" },
    kulutus_rytmi: { title: "Rytmi", text: "Millailen päivärytmi teillä on, eli mihin aikaan päivästä sähköä kuluu yleensä eniten?", options: [{ label: "Päivä (07-17)", next: "kartoitus_seuranta", saveKulutus: ["Rytmi", "Päivä"] }, { label: "Ilta (17-22)", next: "kartoitus_seuranta", saveKulutus: ["Rytmi", "Ilta"] }, { label: "Yö (22-07)", next: "kartoitus_seuranta", saveKulutus: ["Rytmi", "Yö"] }, { label: "Tasainen", next: "kartoitus_seuranta", saveKulutus: ["Rytmi", "Tasainen"] }] },
    kartoitus_seuranta: { title: "Seuranta", text: "Miten olette seuranneet sähkön hintoja?", options: [{ label: "Aktiivisesti", next: "kartoitus_hinnankehitys", savePricing: ["Seuranta", "Aktiivinen"] }, { label: "Vähän", next: "kartoitus_hinnankehitys", savePricing: ["Seuranta", "Vähän"] }, { label: "En ollenkaan", next: "kartoitus_hinnankehitys", savePricing: ["Seuranta", "Ei"] }] },
    kartoitus_hinnankehitys: { title: "Hinnankehitys", text: "Mihin suuntaan itse uskotte sähkön hinnan menevän?", options: [{ label: "Nousee", next: "kartoitus_preferenssi", savePricing: ["Hinnan suunta", "Nousee"] }, { label: "Laskee", next: "kartoitus_preferenssi", savePricing: ["Hinnan suunta", "Laskee"] }, { label: "Ei osaa sanoa", next: "kartoitus_preferenssi", savePricing: ["Hinnan suunta", "Ei osaa sanoa"] }] },
    kartoitus_preferenssi: { title: "Mieltymys", text: "{{PREFERENSSI_TEKSTI}}", options: [{ label: "Ennustettavuus & Huolettomuus", next: "laskenta_vaihe", savePricing: ["Preferenssi", "Huolettomuus"] }, { label: "Pörssihinnan edut ilman piikkejä", next: "laskenta_vaihe", savePricing: ["Preferenssi", "Pörssi-edut"] }] },
    laskenta_vaihe: { title: "Laskenta ja vertailu", text: "Tässä on tullut hei tosi hyviä asioita esille. Katsotaanpa ihan avoimesti teidän nykyisen yhtiön sivuilta, mitä tuo kyseinen sopimus siellä tänä päivänä maksaa, ja lasketaan tästä teille tarkka vertailu.", type: "laskenta-ohje", options: [{ label: "Laskelmat valmiina - Jatka valintaan ➔", next: "ratkaisun_valinta" }] },
    ratkaisun_valinta: { title: "Valinta", text: "Asiakas vahvisti tiedot oikeiksi. Kumpaa tarjoat?", options: [{ label: "Fortum Tarkka (Pörssi)", next: "pitch_porssi" }, { label: "Fortum Duo (Kulutusvaikutus)", next: "pitch_duo" }] },    
    pitch_porssi: { title: "Tarkka", text: "Kertomasi perusteella teille järkevin ratkaisu on Fortumin pörssisähköpaketti, <b>Fortum Tarkka</b>...", options: [
        { label: "Kauppa tuli! 🎉", outcome: "kauppa" },
        { label: "Ei tullut kauppoja", outcome: "ei kauppaa" }
    ] },
    pitch_duo: { title: "Duo", text: "Teille ehdottomasti paras ratkaisu on <b>Fortum Duo</b>...", options: [
        { label: "Kauppa tuli! 🎉", outcome: "kauppa" },
        { label: "Ei tullut kauppoja", outcome: "ei kauppaa" }
    ] }
};

// --- FUNKTIOT ---

function renderStep(stepId, isHistoryBypass = false) {
    const step = scriptData[stepId];
    if (!step) return;
    const container = document.getElementById('content');
    if (!isHistoryBypass && currentStep !== '' && currentStep !== stepId) stepHistory.push(currentStep);
    currentStep = stepId;
    if (stepId === 'pitch_duo') { document.getElementById('our-marg').value = "7,59"; calculateSavings(); }
    else if (stepId === 'pitch_porssi') { document.getElementById('our-marg').value = "0,59"; calculateSavings(); }
    
    let txt = (step.text || "").replace('{{KESKIHINTA}}', current30DayPrice);
    
    // Käsittele preferenssi-teksti
    if (stepId === 'kartoitus_preferenssi') {
        const suunta = pricingTiedot["Hinnan suunta"];
        let prefTeksti = "Haluatteko te tähän kohtaan mieluummin vakautta ja ennakoitavuutta, vai lähdetäänkö katsomaan näitä futuurihintoja kohti pörssisähköllä?";
        if (suunta === "Laskee") prefTeksti = "Jos katsotaan näitä futuurihintoja, niin nyt kannattaa ehdottomasti mennä kesää kohti pörssisähköllä. Mutta olisiko teistä kiva, jos saisitte siihen kuitenkin varmuuden, ettei tule mitään yllättäviä hintapiikkejä?";
        else if (suunta === "Nousee") prefTeksti = "Tavoitellaanko tässä kohtaa teille nimenomaan ennustettavuutta ja huolettomuutta, jotta vältytään näiltä yllätyksiltä?";
        txt = txt.replace('{{PREFERENSSI_TEKSTI}}', prefTeksti);
    }

    let html = `<span class="step-info">${step.title}</span>`;
    
    if (step.type === "yhtio-select") {
        if (voitettavaSopimus && voitettavaSopimus.includes("Pörssi")) {
            html += `<div class="speech-bubble" style="background:#fefce8; border-left-color: #facc15; margin-bottom: 15px;">Hei mites ton pörssisähkön kanssa, onko sulla ollut mitään suojaa noilta hinta piikeiltä?</div>
            <div class="button-group-row" style="margin-bottom: 25px;">
                <button class="answer-btn ${pricingTiedot['Pörssisuoja']==='Kyllä'?'confirmed':''}" onclick="tallennaPorssiSuoja('Kyllä')">Kyllä</button>
                <button class="answer-btn ${pricingTiedot['Pörssisuoja']==='Ei'?'confirmed':''}" onclick="tallennaPorssiSuoja('Ei')">Ei</button>
            </div>`;
        }
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        kilpailijat.forEach(y => { html += `<button class="yhtio-btn" onclick="tallennaYhtio('${y}')">${y}</button>`; });
        html += `</div>`;
    } else if (step.type === "asunto-select") {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        step.asuntoOptions.forEach(opt => { html += `<button class="answer-btn" onclick="valitseAsuntoTyyppi('${opt}', this)">${opt}</button>`; });
        html += `</div><div id="neliot-section" style="display:none; margin-top:20px;"><input type="range" id="neliot-slider" min="10" max="400" value="100" style="width:100%" oninput="document.getElementById('neliot-input').value=this.value"><div style="font-size:1.5rem; font-weight:bold;"><input type="number" id="neliot-input" value="100" style="width:80px" oninput="document.getElementById('neliot-slider').value=this.value"> m²</div><button class="primary-action-btn" onclick="vahvistaAsuntoJaNeliot()">Seuraava ➔</button></div>`;
    } else if (step.type === "dynamic-lammitys") {
        html += `<div id="analysis-responses-area"></div><div class="button-group-row">`;
        Object.keys(lammitysAnalyysit).forEach(k => { html += `<button id="btn-${k}" class="multi-btn ${valitutLammitykset[k]?'selected':''}" onclick="showAnalysisDirectly('${k}', true)">${k}</button>`; });
        html += `</div><button class="primary-action-btn" onclick="tarkistaOhjausTarve()">Jatka ➔</button>`;
    } else if (step.type === "multi-laitteet") {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        ["Ruoanlaitto", "Tiskikone", "Pyykinpesu", "Lattialämmitys", "Sauna"].forEach(l => { 
            let isSelected = kulutusTiedot[l] || (l === 'Sauna' && (kulutusTiedot['Sähkösauna'] || kulutusTiedot['Puusauna']));
            html += `<button class="multi-btn ${isSelected?'selected':''}" onclick="handleDeviceToggle('${l}')">${l}</button>`; 
        });
        html += `</div>`;
        if (kulutusTiedot['Sauna']) {
            html += `<div id="sauna-options" style="margin-top:15px; padding:15px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;"><span class="list-label" style="color:var(--primary-blue);">Valitse saunan tyyppi:</span><div class="button-group-row"><button class="answer-btn ${kulutusTiedot['Sähkösauna']?'confirmed':''}" onclick="valitseSaunaTyyppi('Sähkösauna')">Sähkösauna</button><button class="answer-btn ${kulutusTiedot['Puusauna']?'confirmed':''}" onclick="valitseSaunaTyyppi('Puusauna')">Puusauna</button></div></div>`;
        }
        const currentConsStr = document.getElementById('calc-cons')?.value || "";
        html += `<div style="margin-top:20px; padding:20px; background:var(--tip-blue); border:2px solid var(--tip-border); border-radius:12px;">
            <span class="list-label" style="color:var(--primary-blue); font-size: 0.8rem;">🔌 Vuosikulutus</span>
            <input type="range" id="cons-slider-step" min="1000" max="40000" step="500" value="${currentConsStr || 15000}" style="width:100%" oninput="syncConsumptionFromStep(this.value)">
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                <input type="number" id="cons-input-step" value="${currentConsStr || 15000}" style="width:120px; padding:8px; border:2px solid var(--tip-border); border-radius:8px; font-weight: bold; font-size: 1.1rem;" oninput="syncConsumptionFromStep(this.value)">
                <span style="font-weight: bold; color: var(--primary-blue);">kWh / vuosi</span>
            </div>
        </div>`;
        html += `<button class="primary-action-btn" onclick="renderStep('kulutus_rytmi')">Seuraava ➔</button>`;
    } else if (step.options) {
        html += `<div class="speech-bubble">${txt}</div><div class="button-group-row">`;
        step.options.forEach(o => {
            let act = `renderStep('${o.next}')`;
            if(o.saveSopimus) act = `tallennaSopimus('${o.saveSopimus}', '${o.next}')`;
            if(o.saveKulutus) act = `tallennaKulutus('${o.saveKulutus[0]}', '${o.saveKulutus[1]}', '${o.next}')`;
            if(o.savePricing) act = `tallennaPricing('${o.savePricing[0]}', '${o.savePricing[1]}', '${o.next}')`;
            if(o.outcome) act = `endCall('${o.outcome}')`;

            let btnClass = 'primary-action-btn';
            if (o.outcome === 'ei kauppaa') {
                btnClass = 'back-btn'; // Uudelleenkäytetään harmaata tyyliä
            }
            if (o.outcome === 'kauppa') {
                btnClass = 'primary-action-btn';
            }
            html += `<button class="${btnClass}" style="width:auto; flex-grow:1;" onclick="${act}">${o.label}</button>`;
        });
        html += `</div>`;
    } else { html += `<div class="speech-bubble">${txt}</div>`; }
    
    if (stepId.startsWith('pitch')) {
        html += `<div id="tasma-args-container"></div>`;
        paivitaTarpit();
    }

    if(stepId !== 'alku') html += `<div style="margin-top:20px;"><button class="back-btn" onclick="goBack()">← Takaisin</button><span class="reset-link" onclick="resetApp()">Palaa alkuun</span></div>`;
    
    container.innerHTML = html;
    paivitaLaskuWidget();
    window.scrollTo(0,0);
}

function tallennaSopimus(t, n) { voitettavaSopimus = t; updateSummaryView(); renderStep(n); }
function tallennaKulutus(o, v, n) { kulutusTiedot[o] = v; updateAnalysisBox(); updateSummaryView(); renderStep(n); }
function tallennaPricing(o, v, n) { pricingTiedot[o] = v; updateAnalysisBox(); updateSummaryView(); renderStep(n); }
function tallennaPorssiSuoja(v) { pricingTiedot['Pörssisuoja'] = v; updateSummaryView(); renderStep(currentStep, true); }

function valitseAsuntoTyyppi(opt, btn) { valittuAsumismuoto = opt; document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('confirmed')); btn.classList.add('confirmed'); document.getElementById('neliot-section').style.display = 'block'; }
function vahvistaAsuntoJaNeliot() { valitutNeliot = document.getElementById('neliot-input').value; updateSummaryView(); renderStep(valittuAsumismuoto === "Kerrostalo" ? 'kulutus_henkilot' : 'kartoitus_lammitys'); }
function tallennaYhtio(y) { document.getElementById('kilpailija-yhtio-input').value = y.includes("Ei kerro") ? "" : y; updateSummaryView(); renderStep('kartoitus_avoin'); }

function tarkistaOhjausTarve() {
    const hasTargetHeating = valitutLammitykset["Sähkölämmitys"] || valitutLammitykset["Maalämpö"] || valitutLammitykset["Ilmalämpöpumppu"] || valitutLammitykset["PILP"];
    if (voitettavaSopimus && voitettavaSopimus.includes("Pörssi") && hasTargetHeating) { renderStep('kulutus_ohjaus'); } else { renderStep('kulutus_henkilot'); }
}

function handleDeviceToggle(l) { kulutusTiedot[l] = !kulutusTiedot[l]; updateAnalysisBox(); updateSummaryView(); renderStep('kulutus_alku', true); }
function valitseSaunaTyyppi(type) { kulutusTiedot['Sähkösauna'] = (type === 'Sähkösauna'); kulutusTiedot['Puusauna'] = (type === 'Puusauna'); updateAnalysisBox(); updateSummaryView(); renderStep('kulutus_alku', true); }

function syncConsumptionFromStep(val) {
    const dashInput = document.getElementById('calc-cons');
    const stepSlider = document.getElementById('cons-slider-step');
    const stepInput = document.getElementById('cons-input-step');
    if (dashInput) dashInput.value = val;
    if (stepSlider) stepSlider.value = val;
    if (stepInput) stepInput.value = val;
    syncJanInput((parseFloat(val) * 0.15).toFixed(0));
    calculateSavings();
}

function syncJanInput(val) {
    const dashInput = document.getElementById('january-estimate-input');
    if (dashInput && dashInput.value !== val) { dashInput.value = val; }
    paivitaLaskuWidget();
}

function paivitaLaskuWidget() {
    const inputEl = document.getElementById('january-estimate-input');
    if (!inputEl) return;
    const localCons = parseFloat(inputEl.value) || 0;
    const costPorssi = (localCons * 19.44 / 100) + 11.96;
    const costTarkka = (localCons * 9.55 / 100) + 11.96;
    const costDuo = (localCons * 7.59 / 100) + 5.99;
    
    if (document.getElementById('lasku-porssi')) document.getElementById('lasku-porssi').innerText = costPorssi.toFixed(2).replace('.', ',') + ' €';
    if (document.getElementById('lasku-tarkka')) document.getElementById('lasku-tarkka').innerText = costTarkka.toFixed(2).replace('.', ',') + ' €';
    if (document.getElementById('lasku-duo')) document.getElementById('lasku-duo').innerText = costDuo.toFixed(2).replace('.', ',') + ' €';
}

function showAnalysisDirectly(key) {
    const data = lammitysAnalyysit[key];
    Object.keys(lammitysAnalyysit).forEach(k => {
        if (k !== key && !(data.extraOptions && data.extraOptions.includes(k))) { delete valitutLammitykset[k]; }
    });
    if (key !== 'Sähkölämmitys') delete valitutLammitykset['Varaaja_litrat'];
    if (!valitutLammitykset[key]) { valitutLammitykset[key] = true; }
    
    let h = `<div class="speech-bubble" style="background:#e0f2fe; border-left-color: var(--info); font-size: 1.1rem; margin-bottom: 15px;">${data.text}</div><div style="background:#fff; padding:15px; border:2px solid var(--primary-blue); border-radius:8px;">`;
    if (data.answers.length > 0) { h += `<div class="button-group-row">` + data.answers.map(ans => `<button class="answer-btn ${valitutLammitykset[key]===ans?'confirmed':''}" onclick="valitutLammitykset['${key}']='${ans}'; updateAnalysisBox(); updateSummaryView(); showAnalysisDirectly('${key}')">${ans}</button>`).join('') + `</div>`; }
    if (key === 'Sähkölämmitys' && valitutLammitykset[key] === 'Varaava sähkö') {
        h += `<div style="margin-top: 15px; padding: 12px; background: var(--light-blue); border-radius: 8px;">
                <label style="font-size: 0.75rem; font-weight: bold; color: var(--primary-blue); display: block; margin-bottom: 4px;">VARAAJAN KOKO (Litrat)</label>
                <input type="number" class="calc-input" placeholder="Esim. 1000" value="${valitutLammitykset['Varaaja_litrat'] || ''}" oninput="valitutLammitykset['Varaaja_litrat']=this.value; updateAnalysisBox(); updateSummaryView();" style="border-color: var(--primary-blue); font-weight: bold;">
              </div>`;
    }
    let fltrdOptions = data.extraOptions;
    if (key === 'Sähkölämmitys' && valitutLammitykset[key] === 'Varaava sähkö') { fltrdOptions = data.extraOptions.filter(opt => opt !== 'Lämminvesivaraaja'); }
    if (fltrdOptions.length > 0) { h += `<div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-top:10px;" class="button-group-row">` + fltrdOptions.map(opt => `<button class="answer-btn ${valitutLammitykset[opt]?'confirmed':''}" onclick="valitutLammitykset['${opt}']=!valitutLammitykset['${opt}']; updateAnalysisBox(); updateSummaryView(); showAnalysisDirectly('${key}')">+ ${opt}</button>`).join('') + `</div>`; }
    h += `</div>`;
    document.getElementById('analysis-responses-area').innerHTML = h;
    document.querySelectorAll('.multi-btn[id^="btn-"]').forEach(btn => btn.classList.remove('selected'));
    const mainBtn = document.getElementById('btn-'+key);
    if (mainBtn) mainBtn.classList.add('selected');
    updateAnalysisBox(); updateSummaryView();
}

function updateAnalysisBox() {
    const box = document.getElementById('combined-analysis-box'), valEl = document.getElementById('mini-impact-val'), bullEl = document.getElementById('impact-bullets');
    let est = 0, has = false, bulls = [];
    if (valitutLammitykset["Sähkölämmitys"] === "Suora sähkö") { bulls.push("⚡ Suora sähkölämmitys: <b>0,00 c/kWh</b>"); has = true; }
    if (valitutLammitykset["Sähkölämmitys"] === "Varaava sähkö") { est -= 2.0; bulls.push("💧 Varaava sähkölämmitys: <b>-2,00 c/kWh</b>"); has = true; } 
    else if (valitutLammitykset["Lämminvesivaraaja"]) { est -= 0.5; bulls.push("💧 Lämminvesivaraaja: <b>-0,50 c/kWh</b>"); has = true; }
    if (valitutLammitykset["Takka"] && valitutLammitykset["Ilmalämpöpumppu"]) { est -= 1.0; bulls.push("🔥❄️ Takka + ILP: <b>-1,00 c/kWh</b>"); has = true; }
    else if (valitutLammitykset["Ilmalämpöpumppu"]) { est -= 0.5; bulls.push("❄️ Ilmalämpöpumppu: <b>-0,50 c/kWh</b>"); has = true; }
    if (kulutusTiedot["Lattialämmitys"]) { est -= 0.5; bulls.push("🌡️ Lattialämmitys: <b>-0,50 c/kWh</b>"); has = true; }
    if (kulutusTiedot["Sähkösauna"]) { est -= 0.3; bulls.push("🧖‍♂️ Sähkösauna: <b>-0,30 c/kWh</b>"); has = true; }
    if (kulutusTiedot["Rytmi"] === "Päivä") { est += 0.3; bulls.push("🕒 Päiväpainotteinen: <b>+0,30 c/kWh</b>"); has = true; }
    else if (kulutusTiedot["Rytmi"] === "Yö") { est -= 0.3; bulls.push("🌙 Yöpainotteinen: <b>-0,30 c/kWh</b>"); has = true; }
    if (has) {
        valEl.innerText = est === 0 ? "0,00" : est.toFixed(2).replace('.', ',');
        document.getElementById('our-impact-val').value = est.toFixed(2).replace('.', ',');
        calculateSavings();
        bullEl.innerHTML = bulls.map(b => `<div style="background:white; padding:10px; border-radius:8px; border-left:4px solid var(--impact-border);">${b}</div>`).join('');
        box.style.display = 'block';
    } else { box.style.display = 'none'; }
}

function paivitaTarpit() {
    if (!currentStep.startsWith('pitch')) return;
    const container = document.getElementById('tasma-args-container');
    if (!container) return;
    const tasmaArgs = luoTasmaArgumentit(currentStep);
    if (tasmaArgs.length > 0) {
        let htm = `<div style="background: #f0fdf4; border: 2px solid #22c55e; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px;"><span class="arg-label" style="color: #166534; font-size: 1.05rem; border-bottom: 2px solid #bbf7d0; padding-bottom: 6px; margin-bottom: 12px; display: block;">🔥 Tärpit tälle asiakkaalle</span><ol style="margin: 0; padding-left: 20px; color: #15803d; font-size: 0.95rem; line-height: 1.6; font-weight: bold;">`;
        tasmaArgs.forEach(arg => { htm += `<li style="margin-bottom: 8px;"><span style="color: #334155; font-weight: normal;">${arg}</span></li>`; });
        htm += `</ol></div>`;
        container.innerHTML = htm;
    } else { container.innerHTML = ''; }
}

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
    const impactSavingsY = (currentConsVal * -parseInput(document.getElementById('our-impact-val')?.value) / 100);

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
    if (impactSavingsY > 0) {
        htm += `<div style="margin-top:10px; margin-bottom: 10px; background:#ecfdf5; padding:10px; border-radius:8px; border:2px dashed #10b981; text-align: center;">
            <span style="font-size:0.75rem; color:#047857; font-weight:bold; text-transform:uppercase;">💡 Kulutusvaikutuksen lisäsäästö</span>
            <div style="font-size:1.2rem; font-weight:900; color:#059669; margin-top:2px;">+ ${impactSavingsY.toFixed(2).replace('.', ',')} €/v</div>
        </div>`;
    }
    htm += `</div>`;
    resultDiv.innerHTML = htm;
    paivitaTarpit();
}

function updateSummaryView() {
    const yhtioInput = document.getElementById('kilpailija-yhtio-input').value;
    const linkContainer = document.getElementById('hinnasto-link-container');
    if (!yhtioInput) return;
    
    let sopimusTags = voitettavaSopimus ? `<span class="tag">⚡ ${voitettavaSopimus}</span>` : "";
    document.getElementById('sopimus-tags').innerHTML = sopimusTags;
}

function resetApp() {
    stepHistory = []; currentStep = ''; valittuAsumismuoto = ''; valitutNeliot = 100;
    valitutLammitykset = {}; kulutusTiedot = {}; pricingTiedot = {}; voitettavaSopimus = '';
    document.getElementById('kilpailija-yhtio-input').value = '';
    document.getElementById('calc-cons').value = '';
    document.getElementById('our-impact-val').value = '0,00';
    document.getElementById('combined-analysis-box').style.display = 'none';
    document.getElementById('kartoitus-display-container').style.display = 'none';
    document.getElementById('kulutus-display-container').style.display = 'none';
    
    const janEstInput = document.getElementById('january-estimate-input');
    if (janEstInput) janEstInput.value = '';
    
    updateSummaryView(); renderStep('alku', true);
}

function goBack() { 
    if (stepHistory.length > 0) renderStep(stepHistory.pop(), true); 
}

async function paivitaPorssisahkonKeskihinta() {
    try {
        const response = await fetch('/api/porssi-hinta');
        const data = await response.json();
        if (data.success) {
            current30DayPrice = data.price;
        }
    } catch (e) { current30DayPrice = "noin 19,65 c/kWh"; }
    const el = document.getElementById('live-price-tag');
    if (el) el.innerText = current30DayPrice;
}

async function paivitaTilastot() {
    try {
        const response = await fetch('/api/tilastot');
        const data = await response.json();
        if (data.success) {
            document.getElementById('total-calls').innerText = data.total_calls;

            const statsList = document.getElementById('contract-stats-list');
            if (statsList && data.contract_stats) {
                let html = '<span style="font-size:0.7rem; font-weight:bold; text-transform:uppercase; display:block; margin-bottom:5px;">Asiakkaiden nykyiset sopimukset:</span>';
                for (const [key, value] of Object.entries(data.contract_stats)) {
                    html += `<div style="display:flex; justify-content:space-between;"><span>${key}</span> <b>${value} kpl</b></div>`;
                }
                statsList.innerHTML = html;
            }
        }
    } catch (e) { console.error("Virhe tilastojen haussa:", e); }
}

function luoTasmaArgumentit(stepId) {
    const baseArgs = vastaArgumentitData.yleiset;
    const specificArgs = vastaArgumentitData[stepId] || [];
    const allArgs = [...baseArgs, ...specificArgs];
    return allArgs.sort(() => 0.5 - Math.random()).slice(0, 2);
}

function handleHangUp() {
    if (confirm('Haluatko varmasti merkitä, että asiakas löi luurin korvaan? Tämä tallentaa puhelun tiedot ja nollaa näkymän.')) {
        endCall('luuri korvaan');
    }
}

async function endCall(outcome) {
    // Rakenna informatiivinen polku tilastoja varten (konkretia)
    let aloitus = "Muu";
    if (stepHistory.includes('aloitus_1')) aloitus = "Kunnioittava";
    else if (stepHistory.includes('aloitus_2')) aloitus = "Asiantunteva";
    else if (stepHistory.includes('aloitus_3')) aloitus = "Rento";
    else if (stepHistory.includes('aloitus_suora')) aloitus = "Suora";

    let kartoitus = [];
    if (valittuAsumismuoto) kartoitus.push(valittuAsumismuoto);
    
    // Lämmitys (siistitty)
    let lammitys = Object.keys(valitutLammitykset)
        .filter(k => k !== 'Varaaja_litrat' && valitutLammitykset[k])
        .map(k => valitutLammitykset[k] === true ? k : valitutLammitykset[k])
        .join(' + ');
    if (lammitys) kartoitus.push(lammitys);

    // Laitteet ja kulutus
    let laitteet = Object.keys(kulutusTiedot).filter(k => kulutusTiedot[k] && k !== 'Rytmi').join(', ');
    if (laitteet) kartoitus.push(`Laitteet: ${laitteet}`);

    let kulutus = document.getElementById('calc-cons')?.value;
    if (kulutus) kartoitus.push(`Kulutus: ${kulutus} kWh`);

    let polkuString = `Aloitus: ${aloitus}`;
    if (kartoitus.length > 0) polkuString += ` → ${kartoitus.join(' | ')}`;
    if (currentStep === 'pitch_porssi') polkuString += ` → Tarjottu: Tarkka`;
    else if (currentStep === 'pitch_duo') polkuString += ` → Tarjottu: Duo`;
    else if (currentStep) polkuString += ` → Päättyi: ${currentStep}`;

    const puheluData = {
        sopimus: voitettavaSopimus || null,
        yhtio: document.getElementById('kilpailija-yhtio-input').value || null,
        asumismuoto: valittuAsumismuoto || null,
        neliot: parseInt(valitutNeliot) || null,
        lammitys: Object.keys(valitutLammitykset).filter(k=>valitutLammitykset[k] && k !== 'Varaaja_litrat').map(k => typeof valitutLammitykset[k] === 'string' ? `${k}: ${valitutLammitykset[k]}` : k).join(', ') + (valitutLammitykset['Varaaja_litrat'] ? ` (${valitutLammitykset['Varaaja_litrat']}L)` : '') || null,
        kulutus: parseFloat(document.getElementById('calc-cons').value.replace(',', '.')) || null,
        saastot: parseFloat(document.getElementById('calc-result').innerText.match(/Säästö: ([\d,\.]+) €/)?.[1].replace(',', '.')) || 0,
        muistiinpanot: document.getElementById('muistiinpanot').value || null,
        lopputulos: outcome,
        lopputulos_vaihe: currentStep,
        polku: polkuString,
        aloitus: aloitus
    };
    try {
        const response = await fetch('/api/end-call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(puheluData),
        });
        const result = await response.json();
        if (result.success) {
            if (outcome === 'kauppa') {
                alert('Kauppa tallennettu! Ladataan yhteenveto...');
                let text = `FORTUM YHTEENVETO\n----------------\n`;
                text += `Pvm: ${new Date().toLocaleString('fi-FI')}\n`;
                text += `Sopimus: ${puheluData.sopimus}\n`;
                text += `Yhtiö: ${puheluData.yhtio}\n`;
                text += `Asunto: ${puheluData.asumismuoto} (${puheluData.neliot}m²)\n`;
                text += `Lämmitys: ${puheluData.lammitys}\n`;
                text += `Kulutus: ${puheluData.kulutus} kWh\n`;
                text += `Säästöt: ${puheluData.saastot} €\n`;
                text += `Muistiinpanot: ${puheluData.muistiinpanot}\n`;

                const a = document.createElement("a"); 
                a.href = window.URL.createObjectURL(new Blob([text], {type:"text/plain"})); 
                a.download = "Yhteenveto.txt"; 
                a.click();
            } else {
                alert(`Puhelu tallennettu lopputuloksella: ${outcome}`);
            }
            resetApp();
        } else {
            alert('Virhe tallennuksessa: ' + result.message);
        }
    } catch (error) {
        console.error('Virhe tallennuksessa:', error);
        alert('Verkkovirhe tallennuksessa. Tarkista konsoli.');
    }
}

paivitaPorssisahkonKeskihinta(); 
paivitaTilastot(); // Päivitä tilastot sivun latautuessa
renderStep('alku');
