@echo off
REM Tahap 2: login Keycloak + exchange ke peladen-be.
REM   login <username> <password> <kode-6-digit-ATAU-secret>
REM Aman: password/secret tidak tampil di layar (kecuali --token-only, sengaja untuk piping).
cd /d "%~dp0"
node login.mjs %*
echo.
pause
