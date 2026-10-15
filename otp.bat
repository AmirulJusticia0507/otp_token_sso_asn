@echo off
REM Klik 2x -> langsung tampil kode OTP satriya (baca TOTP_SECRET / .totp-secret).
REM Isi secret sekali saja, pilih salah satu:
REM   setx TOTP_SECRET "BASE32_ANDA"
REM   atau buat file .totp-secret berisi 1 baris secret (sudah di-gitignore).
cd /d "%~dp0"
if "%1"=="watch" (
  node otp.mjs --watch
) else (
  node otp.mjs
  echo.
  pause
)
