# otp_token_sso_asn

Helper CLI Windows-native untuk login SSO ASN (Keycloak `satriya` + TOTP) lalu exchange ke `peladen-be`.

Runtime: Node 18+ tanpa dependensi.

## Isi repo

- `totp.mjs` — library TOTP RFC 6238 (SHA1, 30 detik, 6 digit) + `decodeJwt`. Satu-satunya sumber logika TOTP.
- `otp.mjs` — tampilkan kode OTP saat ini. Secret tidak pernah dicetak.
- `login.mjs` — login Keycloak (Direct Access Grant + TOTP) lalu `POST /auth/exchange` ke backend. Sesi cookie tersimpan di `.dev-cookies`.
- `otp.bat` / `login.bat` — wrapper klik-dua-kali untuk Windows.
- `readme_panduan_cli_login_asn_diy.md` — dokumen arsitektur / analisis sistem (v1.2).
- `TODO_FORM_VUE3.md` — daftar task frontend Vue 3.
- `AGENTS.md` — aturan kerja repo ini.

## Prasyarat

- Node.js 18+ (`node --version`).
- Akun SSO ASN valid di realm `satriya`.
- Secret TOTP base32 atau URL `otpauth://...?secret=XXX`.

## Cara pakai cepat

Simpan secret sekali saja (pilih satu, jangan keduanya di repo):

```bat
setx TOTP_SECRET "BASE32_ANDA"
```

atau file `.totp-secret` berisi 1 baris secret (sudah di-`gitignore`).

Tampilkan OTP:

```bat
node otp.mjs
node otp.mjs --watch
otp.bat
otp.bat watch
```

Login + exchange:

```bat
node login.mjs <username> <password> <kode-6-digit-ATAU-secret>
login <username> <password> <kode-6-digit-ATAU-secret>
```

Varian:

```bat
node login.mjs <username> <password> --secret BASE32
node login.mjs <username> <password> <otp> --no-exchange
node login.mjs <username> <password> <otp> --token-only
node login.mjs --decode <jwt>
node login.mjs <username> <password> <otp> --nik <16-digit>
```

Bantuan:

```bat
node otp.mjs --help
node login.mjs --help
```

## Env yang didukung

- `TOTP_SECRET` / `OTP_SECRET` — secret OTP (`otp.mjs`, `login.mjs`).
- `LOGIN_USERNAME`, `LOGIN_PASSWORD` — agar kredensial tidak masuk history terminal.
- `CLIENT_SECRET` — wajib bila client bersifat confidential. Jangan hardcode.
- `REALM_URL` — default `https://sso.jogjaprov.go.id/realms/satriya`.
- `CLIENT_ID` — default `diy-gov`.
- `BACKEND_URL` — default `http://localhost:8108`.
- `COOKIE_JAR` — default `./.dev-cookies`.

Pakai rute terlindungi setelah login:

```bat
curl -b .dev-cookies http://localhost:8108/me
```

## Keamanan

- File ini tidak boleh ikut commit: `kredensial-lokal.md`, `.totp-secret`, `.dev-cookies` (sudah di `.gitignore`).
- Jangan tulis secret, PAT, NIP/NIK, atau password ke file tracked, log, maupun chat.
- Secret hanya lewat env atau file ignored.
- `login.mjs` tidak mencetak password/secret/token kecuali `--token-only` (sengaja untuk piping).
