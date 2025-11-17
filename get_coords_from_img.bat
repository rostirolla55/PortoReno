@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Questo script esegue extract_gps.py sull'immagine chiave
:: e cattura l'output per popolare le variabili d'ambiente LAT e LON.
:: Deve essere eseguito dalla radice del progetto PorticiSanLuca.

ECHO.
ECHO =========================================================
ECHO 📸 ESTRAZIONE COORDINATE GPS DA IMMAGINE CHIAVE
ECHO =========================================================

:: --- CONFIGURAZIONE: Devi cambiare 'arcoxy.jpg' con il nome corretto ---
SET "IMAGE_FILE_PATH=public\images\arcoxy.jpg"
:: ------------------------------------------------------------------------

IF NOT EXIST "%IMAGE_FILE_PATH%" (
    ECHO ERRORE: Immagine chiave non trovata in: %IMAGE_FILE_PATH%
    ECHO Assicurati che arcoxy.jpg sia stato copiato in public\images.
    GOTO :EOF
)

ECHO 1. Esecuzione di extract_gps.py...
:: Esegue lo script Python e reindirizza l'output (LAT=X.XXX, LON=Y.YYY) in un file temporaneo
python extract_gps.py "%IMAGE_FILE_PATH%" > temp_coords.txt 

IF ERRORLEVEL 1 (
    ECHO ERRORE durante l'estrazione. Controlla il file immagine e lo script Python.
::    DEL temp_coords.txt 2>NUL
    GOTO :EOF
)

ECHO 2. Cattura delle coordinate...
SET "LATITUDE_EXTRACTED="
SET "LONGITUDE_EXTRACTED="

:: Legge le righe del file temporaneo e assegna i valori alle variabili
FOR /F "tokens=1,2 delims==" %%A IN (temp_coords.txt) DO (
    IF "%%A"=="LAT" SET "LATITUDE_EXTRACTED=%%B"
    IF "%%A"=="LON" SET "LONGITUDE_EXTRACTED=%%B"
)

:: Pulizia
DEL temp_coords.txt 2>NUL

IF DEFINED LATITUDE_EXTRACTED (
    ECHO.
    ECHO ✅ Coordinate estratte con successo:
    ECHO    LAT: !LATITUDE_EXTRACTED!
    ECHO    LON: !LONGITUDE_EXTRACTED!
    ECHO.
    ECHO Copia e incolla questi valori nello script add_arcoxy.bat.
) ELSE (
    ECHO ERRORE: Impossibile estrarre i valori LAT/LON. Controlla i dati EXIF della foto.
)

ENDLOCAL