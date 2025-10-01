// ===========================================
// DATI: Punti di Interesse GPS (DA COMPILARE)
// ===========================================
const ARCO_LOCATIONS = [
    { id: 'lastre', lat: 44.49925278, lon: 11.34074444, distanceThreshold: 20 }
];
// ===========================================
// VARIABILI GLOBALI
// ===========================================
const audioPlayer = document.getElementById('audioPlayer');
const playButton = document.getElementById('playAudio');


// ===========================================
// FUNZIONI UTILITY
// ===========================================

// Restituisce l'ID base della pagina (es. 'index', 'pugliole') leggendolo dall'ID del body
const getCurrentPageId = () => {
    // Legge l'ID dal tag body (es. <body id="pugliole">)
    const bodyId = document.body.id;
    if (bodyId) {
        return bodyId.toLowerCase();
    }
    // Fallback se l'ID non è impostato
    const path = window.location.pathname;
    let baseId = path.substring(path.lastIndexOf('/') + 1).replace(/-[a-z]{2}\.html/i, '').replace('.html', '').toLowerCase();
    return baseId || 'index'; 
};

// Aggiorna il testo solo se l'elemento esiste
const updateTextContent = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '';
    }
};

// ===========================================
// LOGICA CARICAMENTO CONTENUTI (Requisito 5, 7, 8, 9, 11)
// ===========================================

const loadContent = async (lang) => {

    // Aggiorna l'attributo lang dell'HTML per coerenza
    document.documentElement.lang = lang; 

    try {
        const pageId = getCurrentPageId(); // ID del body (es. 'index', 'pugliole')

        const response = await fetch(`data/translations/${lang}/texts.json`);

        if (!response.ok) {
            console.error(`File di traduzione non trovato per la lingua: ${lang}. Tentativo di fallback su 'it'.`);
            if (lang !== 'it') {
                loadContent('it');
                return;
            }
            throw new Error(`Impossibile caricare i dati per ${lang}.`);
        }

        const data = await response.json();
        const pageData = data[pageId];

        if (!pageData) {
            console.warn(`Dati non trovati per la chiave pagina: ${pageId} nel file JSON per la lingua: ${lang}.`);
            updateTextContent('pageTitle', `[ERRORE] Dati mancanti (${pageId}/${lang})`);
            return;
        }

        // AGGIORNAMENTO NAVIGAZIONE (Requisito 5)
        if (data.nav) {
            const suffix = `-${lang}.html`;
            
            // Aggiorna gli href del menu (usando i nuovi nomi file XX-lingua.html)
            document.getElementById('navHome').href = `index${suffix}`;
            document.getElementById('navAneddoti').href = `aneddoti${suffix}`;
            document.getElementById('navLastre').href = `lastre${suffix}`;
            document.getElementById('navPugliole').href = `pugliole${suffix}`;

            // Aggiorna il testo dei link
            updateTextContent('navHome', data.nav.navHome);
            updateTextContent('navAneddoti', data.nav.navAneddoti);
            updateTextContent('navLastre', data.nav.navLastre);
            updateTextContent('navPugliole', data.nav.navPugliole);
        }
        
        // AGGIORNAMENTO IMMAGINE DI FONDO TESTATA (Requisito 8)
        const headerImage = document.getElementById('headerImage');
        if (headerImage && pageData.headerImageSource) {
            headerImage.src = pageData.headerImageSource;
        }

        // AGGIORNAMENTO DEL CONTENUTO (Requisito 7: Testi principali)
        updateTextContent('pageTitle', pageData.pageTitle);
        updateTextContent('mainText', pageData.mainText);
        updateTextContent('mainText1', pageData.mainText1);
        updateTextContent('mainText2', pageData.mainText2);
        updateTextContent('mainText3', pageData.mainText3);
        updateTextContent('mainText4', pageData.mainText4);
        updateTextContent('mainText5', pageData.mainText5);


        // AGGIORNAMENTO AUDIO E BOTTONE (Requisito 3)
        if (audioPlayer && playButton && pageData.audioSource) {
            if (!audioPlayer.paused) {
                 audioPlayer.pause();
                 audioPlayer.currentTime = 0;
            }
            
            playButton.textContent = pageData.playAudioButton;
            playButton.dataset.playText = pageData.playAudioButton;
            playButton.dataset.pauseText = pageData.pauseAudioButton;
            
            audioPlayer.src = pageData.audioSource;
            audioPlayer.load();

            playButton.classList.remove('pause-style');
            playButton.classList.add('play-style');
        }

        // AGGIORNAMENTO IMMAGINI DINAMICHE (Requisito 9: Max 5 immagini)
        for (let i = 1; i <= 5; i++) {
            const imageElement = document.getElementById(`pageImage${i}`);
            const imageSource = pageData[`imageSource${i}`];

            if (imageElement) {
                imageElement.src = imageSource || '';
                imageElement.style.display = imageSource ? 'block' : 'none'; 
            }
        }

        console.log(`✅ Contenuto caricato con successo per la lingua: ${lang} e pagina: ${pageId}`);

    } catch (error) {
        console.error('Errore critico nel caricamento dei testi:', error);
        updateTextContent('pageTitle', `[ERRORE CRITICO] Caricamento fallito.`);
    }
};

// ===========================================
// LOGICA AUDIO E GPS
// ===========================================

// Gestione Play/Pause (Requisito 3)
const setupAudioControl = () => {
    if (audioPlayer && playButton) {
        playButton.addEventListener('click', function() {
            const currentPlayText = playButton.dataset.playText || "Ascolta";
            const currentPauseText = playButton.dataset.pauseText || "Pausa";

            if (audioPlayer.paused) {
                audioPlayer.play();
                playButton.textContent = currentPauseText; 
                playButton.classList.replace('play-style', 'pause-style');
            } else {
                audioPlayer.pause();
                playButton.textContent = currentPlayText;
                playButton.classList.replace('pause-style', 'play-style');
            }
        });

        // Requisito 3: Ritorna ad "ascolta" quando l'audio finisce
        audioPlayer.addEventListener('ended', function() {
            const currentPlayText = playButton.dataset.playText || "Ascolta";
            audioPlayer.currentTime = 0; 
            playButton.textContent = currentPlayText;
            playButton.classList.replace('pause-style', 'play-style');
        });
    }
};

// Funzioni GPS (Requisito 6.3)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
};

const checkProximity = (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const currentLang = document.documentElement.lang || 'it'; 

    for (const location of ARCO_LOCATIONS) {
        const distance = calculateDistance(userLat, userLon, location.lat, location.lon);

        if (distance <= location.distanceThreshold) {
            console.log(`GPS: Vicino a ${location.id}! Distanza: ${distance.toFixed(1)}m`);

            const currentPath = window.location.pathname;
            const targetPage = `${location.id}-${currentLang}.html`; // Coerenza nome file

            if (!currentPath.includes(targetPage)) {
                window.location.href = targetPage;
            }
            return;
        }
    }
};

const startGeolocation = () => {
    if (navigator.geolocation && ARCO_LOCATIONS.length > 0) {
        navigator.geolocation.watchPosition(checkProximity, 
            (error) => console.warn(`ERRORE GPS: ${error.code}: ${error.message}`), 
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        console.log("GPS: Monitoraggio avviato.");
    }
};


// ===========================================
// INIZIALIZZAZIONE
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Gestione Menu Hamburger (Requisito 5)
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            menuToggle.classList.toggle('active'); 
        });
    }

    setupAudioControl(); 
    startGeolocation(); 

    // Carica i contenuti nella lingua dell'HTML
    const currentHTMLlang = document.documentElement.lang;
    loadContent(currentHTMLlang);
});