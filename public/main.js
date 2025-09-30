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


// ===========================================
// VARIABILI GLOBALI (Per l'audio)
// ===========================================
const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playAudio');


// ===========================================
// FUNZIONI UTILITY
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


// ===========================================
// 3. FUNZIONE setLanguage (CORRETTA)
// ===========================================

const setLanguage = async (lang) => {

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }

    // FIX CRUCIALE: Salva e imposta la lingua immediatamente, prima del fetch
    localStorage.setItem('userLanguage', lang);
    document.documentElement.lang = lang;

    try {
        const pageId = getCurrentPageId();

        // fetch su JSON (Assicurati che il percorso 'data/translations/' sia corretto)
        const response = await fetch(`data/translations/${lang}/texts.json`);

        if (!response.ok) {
            throw new Error(`File di traduzione non trovato per la lingua: ${lang}`);
        }

        const data = await response.json();
        const pageData = data[pageId];

        // AGGIORNAMENTO NAVIGAZIONE (MENU)
        if (data.nav) {
            updateTextContent('navHome', data.nav.navHome);
            updateTextContent('navAneddoti', data.nav.navAneddoti);
            updateTextContent('navLastre', data.nav.navLastre);
            updateTextContent('navPugliole', data.nav.navPugliole);
        }

        if (!pageData) {
            console.error(`Dati non trovati per la pagina: ${pageId} nella lingua: ${lang}. Verifica il file texts.json.`);
            updateTextContent('pageTitle', `[ERRORE] Testi ${lang} non trovati per questa pagina.`);
            return;
        }

        // AGGIORNAMENTO DEL CONTENUTO (Testi principali)
        updateTextContent('pageTitle', pageData.pageTitle);
        updateTextContent('mainText', pageData.mainText);
        updateTextContent('mainText1', pageData.mainText1);
        updateTextContent('mainText2', pageData.mainText2);
        updateTextContent('mainText3', pageData.mainText3);
        updateTextContent('mainText4', pageData.mainText4);
        updateTextContent('mainText5', pageData.mainText5);

        // AGGIORNAMENTO AUDIO E BOTTONE
        if (audioPlayer && playButton) {
            // Aggiorna l'elemento del bottone audio con il testo tradotto
            playButton.textContent = pageData.playAudioButton;
            
            // SALVA I TESTI PLAY/PAUSE NEI data-attributes per la logica toggleAudio
            playButton.dataset.playText = pageData.playAudioButton;
            playButton.dataset.pauseText = pageData.pauseAudioButton;
            
            // APPLICA LO STILE INIZIALE CORRETTO (BLU)
            playButton.classList.remove('pause-style');
            playButton.classList.add('play-style');
            
            audioPlayer.src = pageData.audioSource;
            audioPlayer.load();
        }

        // AGGIORNAMENTO IMMAGINI DINAMICHE
        const updateImage = (index, pageData) => {
            const imageId = `pageImage${index}`;
            const sourceKey = `imageSource${index}`;

            const imageElement = document.getElementById(imageId);
            const imageSource = pageData[sourceKey];

            if (imageElement) {
                imageElement.src = imageSource || '';
                imageElement.style.display = imageSource ? 'block' : 'none';
            }
        };

        updateImage(1, pageData);
        updateImage(2, pageData);
        updateImage(3, pageData);
        updateImage(4, pageData);
        updateImage(5, pageData);

        console.log(`Lingua impostata su: ${lang}`);

    } catch (error) {
        console.error('Errore critico nel caricamento dei testi:', error);
        updateTextContent('pageTitle', `[ERRORE DI CARICAMENTO] Lingua ${lang} fallita. Controlla i file JSON.`);
    }
};


// ===========================================
// 4. GESTIONE PLAY/PAUSE AUDIO (CORRETTA)
// ===========================================

const setupAudioControl = () => {
    if (audioPlayer && playButton) {
        // Logica per il click Play/Pause (toggle)
        playButton.addEventListener('click', function() {
            // I testi sono letti dai data-attributes impostati in setLanguage
            const currentPlayText = playButton.dataset.playText || "Ascolta l'audio";
            const currentPauseText = playButton.dataset.pauseText || "Metti in pausa";

            if (audioPlayer.paused) {
                audioPlayer.play();
                
                // Cambia a PAUSA (Arancione)
                playButton.textContent = currentPauseText; 
                playButton.classList.add('pause-style');
                playButton.classList.remove('play-style');
            } else {
                audioPlayer.pause();
                
                // Cambia a PLAY (Blu)
                playButton.textContent = currentPlayText;
                playButton.classList.add('play-style');
                playButton.classList.remove('pause-style');
            }
        });

        // Logica per quando l'audio finisce (ritorna a PLAY/Blu)
        audioPlayer.addEventListener('ended', function() {
            const currentPlayText = playButton.dataset.playText || "Ascolta l'audio";
            
            // Riposiziona l'audio all'inizio per poterlo riavviare
            audioPlayer.currentTime = 0; 
            
            playButton.textContent = currentPlayText;
            playButton.classList.add('play-style');
            playButton.classList.remove('pause-style');
        });
    }
};


// ===========================================
// 5. INIZIALIZZAZIONE (window.onload)
// ===========================================

// Gestione del menu a scomparsa e dell'evento 'ended'
document.addEventListener('DOMContentLoaded', () => {
    // 🔥 NUOVA LOGICA MENU HAMBURGER
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuToggle.classList.toggle('active'); // Per l'animazione 'X'
        });
    }
    // FINE LOGICA MENU HAMBURGER


    // Chiama la configurazione audio una sola volta al caricamento del DOM
    setupAudioControl(); 

    // Avvia il monitoraggio GPS
    startGeolocation(); 

    // Carica la lingua salvata, altrimenti usa 'it'
    const savedLang = localStorage.getItem('userLanguage') || 'it';
    setLanguage(savedLang);
    
});