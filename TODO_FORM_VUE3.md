# TODO - Repo `otp_token_sso_asn` (scope: form OTP saja)

Sumber awal: `readme_panduan_cli_login_asn_diy.md` v1.2.
Keputusan user: repo ini HANYA untuk form/halaman kode OTP.
T-05 s/d T-11 (Kategori, Sub Kategori, User, Barang Masuk) milik proyek lain
(jmc inventory) — DIHENTIKAN di repo ini, jangan dikerjakan.

## Status

- [x] Tahap 1 CLI: `otp.mjs` viewer TOTP (Node, tanpa dep)
- [x] Tahap 2 CLI: `login.mjs` login Keycloak + exchange (Windows-native)
- [x] T-01.1 scaffold `web/` (Vue 3.5 + Vite 8 + Tailwind v4 + Pinia 4 + Router 5)
- [x] T-01.2 axios `withCredentials` + primitif zod/vee-validate
- [x] T-01.3 struktur `src/` + util Rupiah/grandTotal (dipakai ulang CurrencyInput)
- [x] T-02.1 `useAuthStore` (exchange/introspect/logout)
- [x] T-02.2 route guard Admin/Operator + redirect login
- [x] T-02.3 `AppLayout` sidebar+topbar+role badge
- [x] T-03.1 BaseInput/Select/Textarea/Toggle
- [x] T-03.2 CurrencyInput/DatePicker/FileUpload
- [x] T-03.3 Modal/DataTable/Pagination/EmptyState/Toast + usePagination/useToast
- [x] T-04 form Login SSO (username+password+TOTP via Direct Access Grant)
- [ ] T-OTP.1 halaman form Generate kode OTP (klik tombol -> kode muncul)

## T-OTP.1: halaman form Generate kode OTP

- [ ] `web/src/utils/totp.js`: TOTP browser (base32 + HMAC-SHA1 murni JS, tanpa dep),
      diuji vektor RFC 6238 di Node
- [ ] `web/src/pages/Home.vue`: form pilih akun (label saja, TANPA secret di kode)
      + tempel secret (in-memory, hilang saat reload) + tombol Generate ->
      kartu kode 6 digit + countdown 30 detik + tombol Copy + tombol Bersihkan
- [ ] Bersihkan nav `AppLayout` dari item inventori ("segera")
- [ ] Secret TIDAK PERNAH di-hardcode, di-log, atau di-commit (hanya di memori tab)

## Parkir (jangan kerjakan di repo ini)

- T-05 Master Kategori, T-06 Sub Kategori, T-07 Manajemen User,
  T-08/T-09 Barang Masuk, T-10 aksi, T-11 filter, T-12 QA inventori.
