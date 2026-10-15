# AGENTS.md — Aturan Kerja Repo `otp_token_sso_asn`

## 1. Batas repo

- Kerja HANYA di repo ini. `C:\laragon\www\peladen-fe` (dan repo lain) bersifat
  read-only untuk referensi/analisa — JANGAN diubah tanpa perintah eksplisit user.
- Bahasa komunikasi: Indonesia, singkat dan faktual.

## 2. Aturan wajib: tiap task TODO langsung commit + push

- Sumber task: `TODO_FORM_VUE3.md` (kode T-01.1, T-08.1, dst).
- Alur per SATU task, tanpa menunggu perintah user:
  1. Kerjakan task sampai selesai.
  2. Verifikasi lewat eksekusi (contoh: vektor uji RFC 6238 untuk TOTP,
     `--help`/`--decode`/jalur gagal untuk CLI). Klaim "selesai" wajib ada bukti run.
  3. Langsung `git add -A`, commit, dan `git push origin main`.
- Format pesan commit: `<kode-task>: <ringkasan>` — contoh: `T-09.2: live grand total vs price_limit`.
- Dilarang menumpuk banyak task dalam satu commit.
- Kalau push gagal (konflik/offline), laporkan ke user, jangan diam.

## 3. Pengaman secret (wajib sebelum SETIAP commit)

- File ini TIDAK BOLEH ikut commit/push: `kredensial-lokal.md`,
  `.totp-secret`, `.dev-cookies` (semuanya sudah di `.gitignore`).
- Cek wajib sebelum commit: `git add -A --dry-run` dan `git status --short`.
  Jika file sensitif muncul, batalkan dan perbaiki `.gitignore` dulu.
- Jangan pernah `git add -f` file yang di-ignore.
- Jangan menulis TOTP secret, PAT, NIP/NIK, atau password ke file tracked,
  log, maupun chat. Secret hanya lewat env (`TOTP_SECRET`, `CLIENT_SECRET`)
  atau file ignored.

## 4. Standar kode helper CLI

- Runtime: Node 18+ tanpa dependensi (Windows-native, tanpa bash/oathtool).
- `totp.mjs` = satu-satunya sumber logika TOTP; script lain import dari sini.
- Secret tidak pernah dicetak ke stdout/stderr/log (kecuali `--token-only`
  yang memang untuk piping token).
