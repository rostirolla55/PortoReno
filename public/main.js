// ===========================================
// DATI: Punti di Interesse GPS (DA COMPILARE)
// ===========================================
const ARCO_LOCATIONS = [
    // Devi popolare questa lista con le coordinate reali dei tuoi archi.
    // L'ID deve corrispondere al nome del file HTML (es. 'arco119')
    // Esempio:
    // { id: 'arco119', lat: 44.4984, lon: 11.3392, distanceThreshold: 20 },
    {
        id: 'lastre', // o l'ID della pagina a cui vuoi reindirizzare
        lat: 44.49925278,
        lon: 11.34074444,
        distanceThreshold: 20 // Distanza in metri (es. 20m) 
    }
];
// ===========================================
// FINE DATI GPS
// ===========================================


// Funzione per determinare l'ID della pagina corrente
const getCurrentPageId = () => {
    const path = window.location.pathname;
    const fileName = path.substring(path.lastIndexOf('/') + 1);

    // 1. Rimuove il suffisso di lingua e l'estensione (es. 'index-fr.html' diventa 'index')
    let baseId = fileName.replace(/-[a-z]{2}\.html/i, '').replace('.html', '').toLowerCase();

    // 2. Se il file è vuoto o 'index', lo tratta come 'home'
    if (baseId === '' || baseId === 'index') {
        return 'home';
    }

    // 3. Restituisce l'ID base (es. 'pugliole', 'lastre', ecc.)
    return baseId;
};

// Funzione flessibile per aggiornare il contenuto solo se l'elemento esiste
const updateTextContent = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '';
    }
};

// ===========================================
// FUNZIONI UTILITY PER GPS
// ===========================================

// Calcola la distanza tra due coordinate (Formula di Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Raggio della terra in metri
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distanza in metri
};

// Funzione principale che verifica la vicinanza
const checkProximity = (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const userLang = document.documentElement.lang || 'it';

    for (const location of ARCO_LOCATIONS) {
        const distance = calculateDistance(userLat, userLon, location.lat, location.lon);

        if (distance <= location.distanceThreshold) {
            console.log(`Vicino a ${location.id}! Distanza: ${distance.toFixed(1)}m`);

            const currentPath = window.location.pathname;
            let targetPage = `${location.id}.html`;

            if (userLang !== 'it') {
                targetPage = `${location.id}-${userLang}.html`;
            }

            if (!currentPath.includes(targetPage)) {
                window.location.href = targetPage;
            }
            return;
        }
    }
};

// Funzione di gestione degli errori GPS
const handleGeolocationError = (error) => {
    console.warn(`ERRORE GPS: ${error.code}: ${error.message}`);
};

// Funzione per avviare il monitoraggio GPS
const startGeolocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(checkProximity, handleGeolocationError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
        console.log("Monitoraggio GPS avviato.");
    } else {
        console.error("Il tuo browser non supporta la geolocalizzazione.");
    }
};

// ===========================================
// FINE FUNZIONI UTILITY PER GPS
// ===========================================


// Gestione del menu a scomparsa e dell'evento 'ended'
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
    });

    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playAudio');

    if (audioPlayer && playButton) {
        audioPlayer.addEventListener('ended', () => {
            audioPlayer.currentTime = 0;
            // Usa il testo play salvato in data-
            playButton.textContent = playButton.dataset.playText || "Ascolta l'audio!";
            playButton.classList.remove('pause-style');
            playButton.classList.add('play-style');
        });
    }
});


// Funzione principale per impostare la lingua
const setLanguage = async (lang) => {

    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playAudio');

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    // 🚀 FIX CRUCIALE: Salva e imposta la lingua immediatamente, prima del fetch
    localStorage.setItem('userLanguage', lang);
    document.documentElement.lang = lang;

    try {
        const pageId = getCurrentPageId();

        // fetch su JSON (Qui può avvenire l'errore se il file non esiste o è vuoto)
        const response = await fetch(`data/translations/${lang}/texts.json`);

        if (!response.ok) {
            // Se il file JSON non è raggiungibile (es. 404), lanciamo un errore
            throw new Error(`File di traduzione non trovato per la lingua: ${lang}`);
        }

        // Recuperiamo TUTTI i dati del JSON
        const data = await response.json();

        // Estraiamo i dati specifici della pagina corrente (es. 'home' o 'arco119')
        const pageData = data[pageId];

        // ===============================================
        // 🔥 NUOVO BLOCCO: AGGIORNA LA NAVIGAZIONE (MENU)
        // ===============================================
        if (data.nav) {
            updateTextContent('navHome', data.nav.navHome);
            updateTextContent('navAneddoti', data.nav.navAneddoti);
            updateTextContent('navLastre', data.nav.navLastre);
            updateTextContent('navPugliole', data.nav.navPugliole);
            // AGGIUNGI QUI LE ALTRE VOCI DEL MENU SE NECESSARIO
        }
        // ===============================================

        if (!pageData) {
            // ⚠️ L'ERRORE VERO: Se il JSON è vuoto o manca l'ID della pagina, 'data' è nullo
            console.error(`Dati non trovati per la pagina: ${pageId} nella lingua: ${lang}. Verifica il file texts.json.`);
            updateTextContent('pageTitle', `[ERRORE] Testi ${lang} non trovati per questa pagina.`);
            return;
        }

        // AGGIORNAMENTO DEL CONTENUTO (Questi sono i tuoi aggiornamenti)
        // Usiamo pageData perché contiene solo i dati della pagina corrente
        updateTextContent('pageTitle', pageData.pageTitle);
        updateTextContent('mainText', pageData.mainText);
        updateTextContent('mainText1', pageData.mainText1);
        updateTextContent('mainText2', pageData.mainText2);
        updateTextContent('mainText3', pageData.mainText3);
        updateTextContent('mainText4', pageData.mainText4);
        updateTextContent('mainText5', pageData.mainText5);

        updateTextContent('playAudio', pageData.playAudioButton);

        // ===============================================
        // 🔥 NUOVO BLOCCO: AGGIORNAMENTO IMMAGINI DINAMICHE (FINO A 5)
        // ===============================================

        // Funzione helper per evitare la duplicazione del codice
        const updateImage = (index, pageData) => {
            // Costruisce gli ID dinamici: 'pageImage1', 'imageSource1', ecc.
            const imageId = `pageImage${index}`;
            const sourceKey = `imageSource${index}`;

            const imageElement = document.getElementById(imageId);
            const imageSource = pageData[sourceKey]; // Legge dal JSON: pageData.imageSource1

            if (imageElement) {
                // Assegna la sorgente (o stringa vuota)
                imageElement.src = imageSource || '';

                // Gestione della visibilità: Se la sorgente nel JSON NON è vuota, mostra (block), altrimenti nascondi (none).
                imageElement.style.display = imageSource ? 'block' : 'none';
            }
        };

        // Esegui la funzione helper per ogni slot da 1 a 5
        updateImage(1, pageData);
        updateImage(2, pageData);
        updateImage(3, pageData);
        updateImage(4, pageData);
        updateImage(5, pageData);

        // ===============================================
        // FINE BLOCCO IMMAGINI
        // ===============================================


        if (audioPlayer) {
            audioPlayer.src = pageData.audioSource;
        }

        if (playButton) {
            // SALVA I TESTI PLAY/PAUSE
            playButton.dataset.playText = pageData.playAudioButton;
            playButton.dataset.pauseText = pageData.pauseAudioButton;

            // APPLICA LO STILE INIZIALE CORRETTO (BLU)
            playButton.classList.remove('pause-style');
            playButton.classList.add('play-style');
        }

        console.log(`Lingua impostata su: ${lang}`);

    } catch (error) {
        // Gestisce gli errori di rete o parsing JSON
        console.error('Errore critico nel caricamento dei testi:', error);
        updateTextContent('pageTitle', `[ERRORE DI CARICAMENTO] Lingua ${lang} fallita. Controlla i file JSON.`);
    }
};


// Funzione per gestire la riproduzione e pausa dell'audio (invariato)
const toggleAudio = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playAudio');

    playButton.addEventListener('click', function() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        // Aggiunge lo stile di PAUSA (rosso) e rimuove lo stile di PLAY (blu)
        playButton.classList.add('pause-style');
        playButton.classList.remove('play-style');
    } else {
        audioPlayer.pause();
        // Aggiunge lo stile di PLAY (blu) e rimuove lo stile di PAUSA (rosso)
        playButton.classList.add('play-style');
        playButton.classList.remove('pause-style');
    }
});
};

// Imposta la lingua di default al caricamento della pagina
window.onload = () => {
    const playButton = document.getElementById('playAudio');

    if (playButton) {
        playButton.addEventListener('click', toggleAudio);
    }

    // Carica la lingua salvata, altrimenti usa 'it'
    const savedLang = localStorage.getItem('userLanguage') || 'it';
    setLanguage(savedLang);

    // AVVIA IL MONITORAGGIO GPS
    startGeolocation();
};