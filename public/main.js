// ===========================================
// CONFIGURAZIONE GLOBALE e VARIABILI
// ===========================================

// L'array ARCO_LOCATIONS deve essere completo qui.
// La nuova logica gestisce più POI che puntano allo stesso ID di pagina (es. 'lastre').
const ARCO_LOCATIONS = [
    // ViaPoleseVerticale_F.jpg
    { id: 'pugliole', lat: 44.5001944444444, lon: 11.3399861111111, distanceThreshold: 20 },
    // viaPolese_f.jpg
    { id: 'pugliole', lat: 44.5001944444444, lon: 11.3399861111111, distanceThreshold: 20 },
    // ViaSanCarlo19_f.jpg
    { id: 'aneddoti', lat: 44.5000722222222, lon: 11.3404333333333, distanceThreshold: 20 },
    // ViaSanCarlo45_f.jpg
    { id: 'aneddoti', lat: 44.5005194444444, lon: 11.3407111111111, distanceThreshold: 20 },
    // ViaSanCarlo45_f.jpg
    { id: 'lastre', lat: 44.49925278, lon: 11.34074444, distanceThreshold: 20 },
    // ViaSanCarlo42Dett_f.jpg
    { id: 'lastre', lat: 44.5004194444444, lon: 11.3406333333333, distanceThreshold: 20 },
    // ViaSanCarlo42_f.jpg
    { id: 'lastre', lat: 44.5004361111111, lon: 11.3406416666667, distanceThreshold: 20 },
    // Tanari_11.jpg
    { id: 'lastre', lat: 44.4992472222222, lon: 11.3407194444444, distanceThreshold: 20 },
    // Tanari_11.jpg
    { id: 'lastre', lat: 44.49925278, lon: 11.34074444, distanceThreshold: 20 }
];

// Funzione Helper per aggiornare il contenuto di un elemento tramite ID
const updateTextContent = (id, text) => {
    const element = document.getElementById(id);
    if (element && text) {
        element.textContent = text;
    }
};

// Funzione Helper per calcolare la distanza tra due punti GPS (formula Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Raggio della Terra in metri
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

// ===========================================
// FUNZIONI DI CARICAMENTO CONTENUTI (loadContent)
// ===========================================

const loadContent = (lang) => {
    const pageId = document.body.id;
    const jsonPath = `data/translations/${lang}/texts.json`;

    try {
        fetch(jsonPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Errore HTTP ${response.status} durante il caricamento di ${jsonPath}`);
                }
                return response.json();
            })
            .then(data => {
                const pageData = data[pageId];
                if (!pageData) {
                    console.error(`Dati non trovati per la pagina ID: ${pageId} nella lingua: ${lang}`);
                    return;
                }

                // 1. AGGIORNAMENTO NAVIGAZIONE (Requisito 5)
                if (data.nav) {
                    const suffix = `-${lang}.html`;

                    // Aggiorna gli href del menu (assicurati che gli ID esistano nell'HTML!)
                    const navHome = document.getElementById('navHome');
                    if(navHome) navHome.href = `index${suffix}`;
                    const navAneddoti = document.getElementById('navAneddoti');
                    if(navAneddoti) navAneddoti.href = `aneddoti${suffix}`;
                    const navLastre = document.getElementById('navLastre');
                    if(navLastre) navLastre.href = `lastre${suffix}`;
                    const navPugliole = document.getElementById('navPugliole');
                    if(navPugliole) navPugliole.href = `pugliole${suffix}`;
                    // Ho aggiunto un controllo "if(element)" per maggiore robustezza.

                    // Aggiorna il testo dei link
                    updateTextContent('navHome', data.nav.navHome);
                    updateTextContent('navAneddoti', data.nav.navAneddoti);
                    updateTextContent('navLastre', data.nav.navLastre);
                    updateTextContent('navPugliole', data.nav.navPugliole);
                }

                // 2. AGGIORNAMENTO DEL CONTENUTO DELLA PAGINA (Requisito 7: Testi principali)
                updateTextContent('pageTitle', pageData.pageTitle);
                updateTextContent('mainText', pageData.mainText);
                updateTextContent('mainText1', pageData.mainText1);
                updateTextContent('mainText2', pageData.mainText2);
                updateTextContent('mainText3', pageData.mainText3);
                updateTextContent('mainText4', pageData.mainText4);
                updateTextContent('mainText5', pageData.mainText5);
                // ... aggiungi qui tutti i placeholder di testo che hai nel body ...

                // 3. AGGIORNAMENTO DEL BOTTONE AUDIO (Requisito 3)
                updateTextContent('playAudio', pageData.playAudioButton);

                // 4. AGGIORNAMENTO IMMAGINI (Requisito 8 & 9)
                const headerImage = document.getElementById('headerImage');
                if (headerImage && pageData.headerImageSource) {
                    headerImage.src = pageData.headerImageSource;
                }
                
                // Aggiornamento Immagine dinamica 1 (a metà testo)
                const pageImage1 = document.getElementById('pageImage1');
                if (pageImage1) {
                    if (pageData.imageSource1) {
                        pageImage1.src = pageData.imageSource1;
                        pageImage1.style.display = 'block'; // Mostra l'immagine
                    } else {
                        pageImage1.style.display = 'none'; // Nasconde se non c'è sorgente
                    }
                }
                // ... gestisci qui pageImage2, pageImage3, ecc. ...

                // 5. AGGIORNAMENTO INFORMAZIONI SU FONTE E DATA (Requisito extra)
                if (pageData.sourceText) {
                    updateTextContent('infoSource', `Fonte: ${pageData.sourceText}`);
                }
                if (pageData.creationDate) {
                    updateTextContent('infoCreatedDate', pageData.creationDate); 
                }
                if (pageData.lastUpdate) {
                    updateTextContent('infoUpdatedDate', pageData.lastUpdate); 
                }

                // 6. CARICAMENTO SORGENTE AUDIO (Requisito 3)
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer && pageData.audioSource) {
                    audioPlayer.src = pageData.audioSource;
                    audioPlayer.load();
                }

                // 7. INVIA LA LINGUA CORRENTE A GOOGLE ANALYTICS (chiamata qui dopo che i dati sono caricati)
                if (typeof gtag === 'function') {
                    const currentHTMLlang = document.documentElement.lang || 'it'; 
                    gtag('set', {'lingua_pagina': currentHTMLlang});
                    
                    gtag('event', 'page_view', {
                        'page_title': document.title,
                        'page_location': window.location.href,
                        'lingua_pagina': currentHTMLlang
                    });
                }


            })
            .catch(error => {
                console.error("Errore Critico caricamento fallito:", error);
                // Potresti mostrare un messaggio di errore all'utente qui
            });

    } catch (error) {
        console.error("Errore Critico nel caricamento dei testi:", error);
    }
};

// ===========================================
// FUNZIONI DI CONTROLLO AUDIO (Audio Control)
// ===========================================

const setupAudioControl = () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const playButton = document.getElementById('playAudio');

    if (audioPlayer && playButton) {
        playButton.addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                const currentLang = document.documentElement.lang || 'it';
                fetch(`data/translations/${currentLang}/texts.json`)
                    .then(r => r.json())
                    .then(data => {
                        playButton.textContent = data[document.body.id].pauseAudioButton || 'Metti in pausa';
                    });
            } else {
                audioPlayer.pause();
                const currentLang = document.documentElement.lang || 'it';
                fetch(`data/translations/${currentLang}/texts.json`)
                    .then(r => r.json())
                    .then(data => {
                        playButton.textContent = data[document.body.id].playAudioButton || 'Ascolta';
                    });
            }
        });

        // Ripristina il testo del bottone alla fine dell'audio
        audioPlayer.addEventListener('ended', () => {
             const currentLang = document.documentElement.lang || 'it';
             fetch(`data/translations/${currentLang}/texts.json`)
                 .then(r => r.json())
                 .then(data => {
                     playButton.textContent = data[document.body.id].playAudioButton || 'Ascolta';
                 });
        });
    }
};

// ===========================================
// FUNZIONI DI GEOLOCALIZZAZIONE (GPS)
// ===========================================

const checkProximity = (position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const currentLang = document.documentElement.lang || 'it';
    
    const currentPageId = document.body.id;
    const isOnHomePage = (currentPageId === 'index' || currentPageId === 'home');
    
    // 🔥 FILTRO 1: REINDIRIZZA SOLO DALLA HOME (garantisce libertà di navigazione)
    if (!isOnHomePage) {
        return; 
    }

    let closestLocation = null;
    let minDistance = Infinity;

    // 1. SCORRI TUTTI I POI E TROVA QUELLO PIÙ VICINO (E CONFORME ALLA SOGLIA)
    // Questa logica risolve il problema delle duplicazioni e garantisce la massima precisione.
    for (const location of ARCO_LOCATIONS) {
        const distance = calculateDistance(userLat, userLon, location.lat, location.lon);

        if (distance <= location.distanceThreshold) {
            // Se è più vicino della distanza minima trovata finora, aggiorna
            if (distance < minDistance) {
                minDistance = distance;
                closestLocation = location;
            }
        }
    }
    
    // 2. REINDIRIZZAMENTO AL POI PIÙ VICINO (SE TROVATO)
    if (closestLocation) {
        const targetPageId = closestLocation.id;
        const targetPage = `${targetPageId}-${currentLang}.html`;
        const currentPath = window.location.pathname;

        console.log(`GPS: Trovato POI più vicino: ${targetPageId} a ${minDistance.toFixed(1)}m`);

        // Evita un reindirizzamento infinito
        if (!currentPath.includes(targetPage)) {
            console.log(`GPS: Reindirizzamento dalla Home a ${targetPage}`);
            window.location.href = targetPage;
        }
    }
};

const startGeolocation = () => {
    if ('geolocation' in navigator) {
        const watchID = navigator.geolocation.watchPosition(checkProximity, 
            (error) => {
                console.error("Errore GPS:", error.message);
            }, 
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
        console.log("GPS: Monitoraggio avviato.");
    } else {
        console.log("GPS: Geolocalizzazione non supportata dal browser.");
    }
};

// ===========================================
// AVVIO ALL'AVVIO DELLA PAGINA (DOMContentLoaded)
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Avvia il monitoraggio GPS
    // Lo avviamo prima, ma la funzione checkProximity si attiverà solo quando il GPS trova una posizione.
    startGeolocation();
    
    // 2. Carica i contenuti nella lingua corretta
    // Ho spostato l'invio di GA dentro loadContent.then() per sicurezza.
    const currentHTMLlang = document.documentElement.lang || 'it'; 
    loadContent(currentHTMLlang);

    // 3. Setup del controllo audio
    setupAudioControl();
    
});