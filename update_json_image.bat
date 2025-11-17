@echo off
SETLOCAL

:: Controlla se almeno 2 parametri sono stati forniti: ID Pagina + 1 Immagine
IF "%~2"=="" (
    ECHO.
    ECHO ERRORE: Parametri insufficienti.
    ECHO Uso: %~n0 ^<id_pagina^> ^<file_img_1^> [^<file_img_2^> ... ^<file_img_5^>]
    ECHO Esempio: %~n0 arcoxy arcoxy01.jpg arcoxy02.jpg arcoxy03.jpg
    GOTO :EOF
)

ECHO.
ECHO --- Aggiornamento dei percorsi immagine per %1 ---

:: Passa tutti i parametri allo script Python
python update_json_image.py %*

ECHO.
ECHO Operazione di aggiornamento immagini completata per tutte le lingue.

ENDLOCAL