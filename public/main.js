// ===========================================
// DATI: Punti di Interesse GPS (DA COMPILARE)
// ===========================================
const ARCO_LOCATIONS = [
    // Lapide_Grazia.jpg
    { id: 'Lapide_Grazia.jpg', lat: 44.5006638888889, lon: 11.3407694444444, distanceThreshold: 5 },
    // Pugliole_1.jpg
    { id: 'Pugliole_1.jpg', lat: 44.4990527777778, lon: 11.3394472222222, distanceThreshold: 5 },
    // Pugliole_2.jpg
    { id: 'Pugliole_2.jpg', lat: 44.4990527777778, lon: 11.3394472222222, distanceThreshold: 5 },// ViaPoleseVerticale_F.jpg
    // Pugliole.jpg
    { id: 'pugliole', lat: 44.5001944444444, lon: 11.3399861111111, distanceThreshold: 5 },
    // viaPolese_f.jpg
    { id: 'pugliole', lat: 44.5001944444444, lon: 11.3399861111111, distanceThreshold: 5 },
    // ViaSanCarlo19_f.jpg
    { id: 'carracci', lat: 44.5000722222222, lon: 11.3404333333333, distanceThreshold: 5 },
    // ViaSanCarlo45_f.jpg
    { id: 'carracci', lat: 44.5005194444444, lon: 11.3407111111111, distanceThreshold: 5 },
    // ViaSanCarlo45_f.jpg
    { id: 'lastre', lat: 44.49925278, lon: 11.34074444, distanceThreshold: 10 },
    // ViaSanCarlo42Dett_f.jpg
    { id: 'lastre', lat: 44.5004194444444, lon: 11.3406333333333, distanceThreshold: 10 },
    // ViaSanCarlo42_f.jpg
    { id: 'lastre', lat: 44.5004361111111, lon: 11.3406416666667, distanceThreshold: 10 },
    // Tanari_11.jpg
    { id: 'lastre', lat: 44.4992472222222, lon: 11.3407194444444, distanceThreshold: 10 },
    // Tanari_11.jpg
    { id: 'lastre', lat: 44.49925278, lon: 11.34074444, distanceThreshold: 10 }
];

// ===========================================
// VARIABILI GLOBALI (Dichiarate, non inizializzate subito)
// ===========================================
let audioPlayer;
let playButton;
let menuButton; // Riferimento al nuovo bottone
let menuContainer; // Riferimento al nuovo menu

// ===========================================
// FUNZIONI UTILITY
// ===========================================

// Restituisce l'ID base della pagina (es. 'home', 'pugliole') leggendolo dall'ID del body
const getCurrentPageId = () => {
    // Legge l'ID dal tag body (es. <body id="home">)
    const bodyId = document.body.id;
    if (bodyId) {
        return bodyId.toLowerCase();
    }
    // Fallback se l'ID non è impostato o è index, usa 'home'
    const path = window.location.pathname;
    let baseId = path.substring(path.lastIndexOf('/') + 1).replace(/-[a-z]{2}\.html/i, '').replace('.html', '').toLowerCase();
    return baseId || 'home';
};

// Aggiorna il testo solo se l'elemento esiste
const updateTextContent = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '';
    }
};

// Funzione helper per ottenere il nome del file di destinazione
const getDestinationPageName = (pageId, langCode) => {
    return `${pageId}-${langCode}.html`;
};

// Funzione helper per il reindirizzamento (Ora definita SOLO qui)
function redirectToPage(targetId, currentLang) {
    const targetPage = getDestinationPageName(targetId, currentLang);
    const currentPath = window.location.pathname;

    // Evita un reindirizzamento infinito
    if (!currentPath.includes(targetPage)) {
        // Nascondi il menu prima di reindirizzare
        hideContextualMenu();
        console.log(`GPS: Reindirizzamento a ${targetPage}`);
        window.location.href = targetPage;
    }
};

// ===========================================
// LOGICA CARICAMENTO CONTENUTI (Requisito 5, 7, 8, 9, 11)
// ===========================================

const loadContent = async (lang) => {
    document.documentElement.lang = lang;

    try {
        const pageId = getCurrentPageId();

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

            // Rendi visibile anche in caso di errore dati, ma lascia l'errore in console
            document.body.classList.add('content-loaded');
            return;
        }

        // AGGIORNAMENTO NAVIGAZIONE (Requisito 5)
        if (data.nav) {
            const suffix = `-${lang}.html`;

            // Aggiorna gli href del menu (usando i nuovi nomi file XX-lingua.html)
            document.getElementById('navHome').href = `index${suffix}`;
            document.getElementById('navCarracci').href = `carracci${suffix}`;
            document.getElementById('navLastre').href = `lastre${suffix}`;
            document.getElementById('navPugliole').href = `pugliole${suffix}`;

            // Aggiorna il testo dei link
            updateTextContent('navHome', data.nav.navHome);
            updateTextContent('navCarracci', data.nav.navCarracci);
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

        // 🔥 AGGIORNAMENTO INFORMAZIONI SULLA FONTE E DATA
        if (pageData.sourceText) {
            // Usiamo il testo come etichetta e valore
            updateTextContent('infoSource', `Fonte: ${pageData.sourceText}`);
        }

        if (pageData.creationDate) {
            updateTextContent('infoCreatedDate', pageData.creationDate);
        }

        if (pageData.lastUpdate) {
            updateTextContent('infoUpdatedDate', pageData.lastUpdate);
        }

        // AGGIORNAMENTO AUDIO E BOTTONE (Requisito 3)
        if (audioPlayer && playButton && pageData.audioSource) {
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            }

            // Imposta i testi del bottone
            playButton.textContent = pageData.playAudioButton;
            playButton.dataset.playText = pageData.playAudioButton;
            playButton.dataset.pauseText = pageData.pauseAudioButton;

            // Imposta la sorgente audio
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

        // 🔥 CORREZIONE FOUT: Rendi visibile il corpo della pagina
        document.body.classList.add('content-loaded');

    } catch (error) {
        console.error('Errore critico nel caricamento dei testi:', error);
        updateTextContent('pageTitle', `[ERRORE CRITICO] Caricamento fallito.`);

        // 🔥 CORREZIONE FOUT: Rendi comunque visibile il corpo per non lasciare la pagina vuota
        document.body.classList.add('content-loaded');
    }
};
// ===========================================
// FUNZIONI DI GESTIONE EVENTI AUDIO
// ===========================================

const handleAudioClick = function () {
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
};

const handleAudioEnded = function () {
    const currentPlayText = playButton.dataset.playText || "Ascolta";
    audioPlayer.currentTime = 0;
    playButton.textContent = currentPlayText;
    playButton.classList.replace('pause-style', 'play-style');
};


// ===========================================
// LOGICA AUDIO E GPS
// ===========================================

// Gestione Play/Pause (Requisito 3)
const setupAudioControl = () => {
    if (audioPlayer && playButton) {

        // Rimuovi listener precedenti (più robusto)
        playButton.removeEventListener('click', handleAudioClick);
        audioPlayer.removeEventListener('ended', handleAudioEnded);

        // Aggiungi listener usando le funzioni nominate
        playButton.addEventListener('click', handleAudioClick);
        audioPlayer.addEventListener('ended', handleAudioEnded);
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

// ===========================================
// FUNZIONI MENU CONTESTUALE GPS 🔥 NUOVE AGGIUNTE 🔥
// ===========================================

// 1. Nasconde il bottone e chiude il menu contestuale
const hideContextualMenu = () => {
    if (menuButton) {
        menuButton.style.display = 'none';
        menuButton.onclick = null; // Rimuove il listener di click
    }
    if (menuContainer) {
        menuContainer.classList.remove('active');
    }
};

// 2. Mostra il bottone e popola il menu contestuale con i POI vicini
const renderContextualMenu = (locations, currentLang) => {
    if (!menuButton || !menuContainer) {
        console.error("Mancano gli elementi HTML per il menu contestuale.");
        return;
    }

    // 1. Popola il menu
    let htmlContent = '';

    locations.forEach(location => {
        // Usiamo l'ID e la distanza (in metri) per il testo
        // Nota: se volessi i nomi tradotti, dovresti caricare il JSON qui

        // Reindirizzamento tramite la funzione globale redirectToPage
        htmlContent += `
            <li>
                <a href="#" onclick="redirectToPage('${location.id}', '${currentLang}'); return false;">
                    Vai a: ${location.id} (${location.distance} m)
                </a>
            </li>
        `;
    });

    // Inserisci il contenuto nella lista del menu
    const ul = menuContainer.querySelector('ul');
    if (ul) {
        ul.innerHTML = htmlContent;
    }

    // 2. Rendi visibile il bottone e gestisci l'apertura del menu
    menuButton.style.display = 'block';

    // Toggle menu: Se il bottone è cliccato, mostra/nascondi il contenitore
    menuButton.onclick = () => {
        menuContainer.classList.toggle('active');
    };
};

// ===========================================
// FUNZIONI DI GEOLOCALIZZAZIONE (GPS) - Versione Stabile
// ===========================================

const checkProximity = (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const currentLang = document.documentElement.lang || 'it';

    const currentPageId = document.body.id;
    const isOnHomePage = (currentPageId === 'index' || currentPageId === 'home');

    // Filtro critico: interveniamo solo dalla Home page
    if (!isOnHomePage) {
        // Assicurati che il menu sia nascosto se l'utente si sposta dalla home
        hideContextualMenu();
        return;
    }

    let nearbyLocations = []; // Array per collezionare TUTTI i POI vicini

    // 1. SCORRI TUTTI I POI PER TROVARE QUELLI NEL RAGGIO CONSENTITO
    for (const location of ARCO_LOCATIONS) {
        const distance = calculateDistance(userLat, userLon, location.lat, location.lon);

        if (distance <= 20) { // Usiamo 20 metri come soglia massima
            // Aggiungiamo i dati necessari (ID pagina e distanza)
            nearbyLocations.push({
                id: location.id,
                distance: distance.toFixed(1)
            });
        }
    }

    // 2. ELIMINA I DUPLICATI E ORDINA PER DISTANZA
    const uniqueLocations = nearbyLocations.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        }
        return acc;
    }, []).sort((a, b) => a.distance - b.distance); // Ordina dal più vicino al più lontano


    // 3. DECISIONE SUL DISPLAY
    if (uniqueLocations.length === 0) {
        // Nessun POI vicino
        console.log("GPS: Nessun POI significativo nelle vicinanze.");
        hideContextualMenu();
    } else if (uniqueLocations.length === 1) {
        // UN SOLO POI VICINO: Reindirizzamento immediato
        console.log(`GPS: Trovato un solo POI: ${uniqueLocations[0].id}. Reindirizzamento automatico.`);
        hideContextualMenu(); // Nascondi il bottone prima di reindirizzare
        redirectToPage(uniqueLocations[0].id, currentLang);

    } else {
        // DUE O PIÙ POI VICINI: Mostra il menu di selezione
        console.log(`GPS: Trovati ${uniqueLocations.length} POI concorrenti. Mostro menu.`);
        renderContextualMenu(uniqueLocations, currentLang);
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

    // 🔥 ASSEGNAZIONE SICURA DELLE VARIABILI GLOBALI (INCLUSI I NUOVI ELEMENTI)
    audioPlayer = document.getElementById('audioPlayer');
    playButton = document.getElementById('playAudio');
    menuButton = document.getElementById('show-contextual-menu'); // Bottone GPS
    menuContainer = document.getElementById('contextual-menu-container'); // Menu contenitore


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

    // 🔥 NUOVO BLOCCO: Invia la lingua corrente a Google Analytics
    if (typeof gtag === 'function') {
        gtag('set', { 'lingua_pagina': currentHTMLlang });

        // Invia un evento di visualizzazione di pagina con il dato della lingua associato
        gtag('event', 'page_view', {
            'page_title': document.title,
            'page_location': window.location.href,
            'lingua_pagina': currentHTMLlang // Parametro da tracciare!
        });
    }
});