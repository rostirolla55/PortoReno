/* GENERA_JSON_4_LINGUE.REX */
Parse ARG LangList TemplateDir NavJSON

/* ---------------------------------------------------- */
/* 1. CONFIGURAZIONE */
/* ---------------------------------------------------- */

/* Lista dei nomi delle pagine (chiavi JSON) */
PAGINE = "arco119 arco126b arco132a arco133a arco136b arco142a arco143c arco148 arco163 arco171b arco180 arco182 arco183 arco186b arco188b arco190 arco192c arco201a arco202a arco203b arco208b arco211b arco218b arco249a arco252a arco256 arco282a arco283a arco306b arco307a arco53c lapide1 lapide2 psontuoso"
Pagine. = 0 /* Inizializza l'array */
PAGES_COUNT = 0
Do i = 1 To WORDS(PAGINE)
    PAGES_COUNT = PAGES_COUNT + 1
    Pagine.PAGES_COUNT = WORD(PAGINE, i)
End

/* 🔥 NUOVE DEFINIZIONI PER LE 4 LINGUE: IT, EN, ES, FR */
Langs = .array~of("it", "en", "es", "fr")

/* ---------------------------------------------------- */
/* 2. DATI DI TEMPLATE E TRADUZIONI BOTTONI */
/* ---------------------------------------------------- */
audioButton.it.play = "Ascolta la storia"
audioButton.it.pause = "Metti in pausa"
audioButton.it.source = "Archivio Storico del Comune di Bologna."
audioButton.it.audio_path = "Assets/Audio/it"

audioButton.en.play = "Listen to the story"
audioButton.en.pause = "Pause"
audioButton.en.source = "Historical Archive of the Municipality of Bologna."
audioButton.en.audio_path = "Assets/Audio/en"

audioButton.es.play = "Escucha la historia"
audioButton.es.pause = "Pausa"
audioButton.es.source = "Archivo Histórico del Ayuntamiento de Bolonia."
audioButton.es.audio_path = "Assets/Audio/es"

audioButton.fr.play = "Écouter l'histoire"
audioButton.fr.pause = "Pause"
audioButton.fr.source = "Archives historiques de la municipalité de Bologne."
audioButton.fr.audio_path = "Assets/Audio/fr"


/* ---------------------------------------------------- */
/* 3. CICLO DI GENERAZIONE PER LINGUA */
/* ---------------------------------------------------- */
Do l = 1 To Langs~size
    lang = Langs[l]
    FileName = "data/translations/" || lang || "/texts.json" /* Il percorso corretto */
    
    Say "Generazione del file: " || FileName

    /* Apri il file per la scrittura. */
    Call Stream(FileName, "c", "open write")
    
    /* 1. Scrivi l'apertura del JSON */
    Call Stream(FileName, "s", "{")
    
    /* 2. Scrivi il blocco HOME (PLACEHOLDER - SOSTITUIRE MANUALMENTE!) */
    Call Stream(FileName, "s", '  "home": {')
    Call Stream(FileName, "s", '    "pageTitle": "Homepage Title ' || lang || '",')
    Call Stream(FileName, "s", '    "mainText": "Benvenuto nel nuovo progetto PorticiSanLuca (' || lang || ').",')
    Call Stream(FileName, "s", '    "audioSource": "' || audioButton.lang.audio_path || '/Home.mp3"')
    Call Stream(FileName, "s", '  },')

    /* 3. Scrivi il blocco NAV (PLACEHOLDER - SOSTITUIRE MANUALMENTE!) */
    Call Stream(FileName, "s", '  "nav": {')
    Call Stream(FileName, "s", '    "navHome": "Home ' || lang || '",')
    Call Stream(FileName, "s", '    "navLastre": "Lastre ' || lang || '",')
    Call Stream(FileName, "s", '    "navPugliole": "Pugliole ' || lang || '"')
    Call Stream(FileName, "s", '  },')

    
    /* 4. Ciclo per tutte le pagine POI */
    Do p = 1 To PAGES_COUNT
        key = Pagine.p
        comma = ","
        If p = PAGES_COUNT Then comma = "" /* Nessuna virgola dopo l'ultimo elemento */

        /* Determina il nome del file audio */
        audio_name = key
        If LEFT(key, 4) = "arco" Then audio_name = "Arco" || SUBSTR(key, 5) 
        If key = "lapide1" Then audio_name = "Lapide1"
        If key = "lapide2" Then audio_name = "Lapide2"
        If key = "psontuoso" Then audio_name = "PSontuoso"

        /* Inizio blocco POI */
        Call Stream(FileName, "s", '  "' || key || '": {')
        
        Call Stream(FileName, "s", '    "pageTitle": "' || key || ' - Portico di San Luca",')
        Call Stream(FileName, "s", '    "mainText": "Testo base per l\'arco o la lapide ' || key || '...",')
        Call Stream(FileName, "s", '    "mainText1": "",')
        Call Stream(FileName, "s", '    "mainText2": "",')
        Call Stream(FileName, "s", '    "mainText3": "",')
        Call Stream(FileName, "s", '    "mainText4": "",')
        Call Stream(FileName, "s", '    "mainText5": "",')
        
        /* Bottoni Audio */
        Call Stream(FileName, "s", '    "playAudioButton": "' || audioButton.lang.play || '",')
        Call Stream(FileName, "s", '    "pauseAudioButton": "' || audioButton.lang.pause || '",')
        
        /* Immagini (solo la prima) */
        Call Stream(FileName, "s", '    "imageSource1": "public/images/' || key || '.jpg",')
        Call Stream(FileName, "s", '    "imageSource2": "",')
        Call Stream(FileName, "s", '    "imageSource3": "",')
        Call Stream(FileName, "s", '    "imageSource4": "",')
        Call Stream(FileName, "s", '    "imageSource5": "",')
        
        /* Fonte e Data (in camelCase per JavaScript) */
        Call Stream(FileName, "s", '    "sourceText": "' || audioButton.lang.source || '",')
        Call Stream(FileName, "s", '    "creationDate": "2025-08-30",')
        Call Stream(FileName, "s", '    "lastUpdate": "2025-10-01",')
        
        /* Sorgente Audio */
        Call Stream(FileName, "s", '    "audioSource": "' || audioButton.lang.audio_path || '/' || audio_name || '.mp3"')

        /* Chiusura blocco POI */
        Call Stream(FileName, "s", '  }' || comma)
    End
    
    /* 5. Scrivi la chiusura del JSON */
    Call Stream(FileName, "s", "}")
    
    /* Chiudi il file */
    Call Stream(FileName, "c", "close")
    Say "File " || FileName || " generato con successo."
End

Exit 0