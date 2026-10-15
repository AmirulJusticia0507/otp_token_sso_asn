# TODO - Form Modern Vue.js 3 (Pengelolaan Barang PT JMC / DIY-Gov)

Sumber: `readme_panduan_cli_login_asn_diy.md` v1.2 (Identity-Service Integrated).
Fokus: Form modern Vue 3 + Vite (Composition API) + Pinia + Vue Router + Tailwind CSS.

## 0. Analisa Singkat Dokumen

- **Stack FE:** Vue 3 + Vite, Composition API, Pinia, Vue Router, Tailwind CSS.
- **Auth:** Keycloak `satriya` (NIP/NIK + 2FA TOTP) -> `POST /auth/exchange` (`X-User-Assertion`) -> `identity-service` (`diy-gov-services`, `aud-identity`) -> Cookie HttpOnly `session` (15 mnt) + `refresh_token` (3 hari). FE dilarang simpan JWT/secret. Cek sesi via `GET /introspect`.
- **RBAC:**
  - Admin + Operator: Login, Barang Masuk Read/Filter (pagination 10/page, filter Kategori/Sub/Tahun), Create/Edit, Cetak PDF, Toggle Verifikasi (audit `X-Actor`), Export Excel.
  - Admin only: Master Kategori, Master Sub Kategori, Manajemen User.
- **Aturan bisnis inti:**
  - `total_price[i] = price[i] * quantity[i]`
  - `Grand Total = sum(total_price) <= sub_categories.price_limit`, langgar = `422 "Total harga barang melebihi batas harga sub kategori."`
  - `operator_id`: Operator dikunci dari `/introspect`, Admin pilih via dropdown.
- **DB:** `users`, `categories (code unik max 10)`, `sub_categories (category_id + price_limit)`, `incoming_goods`, `incoming_good_items`.
- **Gap dokumen:** Section 2.1/3/5 menumpuk 1 baris, Manajemen User terpotong, belum ada kontrak API detail, aturan `attachment_path` (Multer), format `letter_number`, `unit`, `expired_date`.

---

## 1. Setup Proyek (T-01)

- [ ] T-01.1 Inisialisasi `peladen-fe` (Vite + Vue 3 + Vue Router + Pinia + Tailwind CSS)
- [ ] T-01.2 Setup validasi form (VeeValidate + Zod) dan HTTP client (Axios, `withCredentials: true` untuk cookie HttpOnly)
- [ ] T-01.3 Setup struktur folder: `assets/`, `components/`, `composables/`, `layouts/`, `pages/`, `stores/`, `router/`, `services/api.js`, `utils/currency.js`

## 2. Auth & Layout (T-02 s/d T-04)

- [ ] T-02.1 Store `useAuthStore` (login, exchange, introspect, refresh, logout, Kontrak Identitas)
- [ ] T-02.2 Route guard Vue Router (Admin vs Operator, redirect login)
- [ ] T-02.3 Layout modern (Sidebar + Topbar + identitas user + badge role + state sesi)
- [ ] T-04.1 Form Login SSO (username/password/TOTP, error residency/status akun, tanpa simpan token di localStorage)

## 3. Komponen Reusable (T-03)

- [ ] T-03.1 `BaseInput`, `BaseSelect`, `BaseTextarea`, `BaseCheckbox/Toggle`
- [ ] T-03.2 `CurrencyInput` (masking Rupiah untuk `price`, `price_limit`, `grand_total`)
- [ ] T-03.3 `DatePicker`, `FileUpload` (lampiran surat masuk), `Modal`, `DataTable + Pagination (10/page)`, `EmptyState`, `Toast`

## 4. Form Master Data - Admin Only (T-05 s/d T-07)

- [ ] T-05 Form Kategori (CRUD modal, `code` unik max 10 karakter, `name` wajib)
  - [ ] Validasi: kode unik, max 10 char, pesan error BE/FE sinkron
- [ ] T-06 Form Sub Kategori (CRUD modal, wajib `category_id` + `price_limit` masking Rupiah)
  - [ ] Validasi: kategori wajib, batas harga > 0
- [ ] T-07 Form Manajemen User (CRUD + lock, field: `nip` 18, `username`, `nama`, `email`, `role` Admin/Operator, `unor_id`, `unor_instansi_id`, `is_locked`)
  - [ ] Validasi: NIP/username/email unik, role enum, audit `X-Actor`

## 5. Form Utama: Barang Masuk Create/Edit (T-08 + T-09) - Prioritas

- [ ] T-08.1 Header form: `transaction_date`, `category_id`, `sub_category_id` (+ info live `price_limit`), `source`, `letter_number`, `attachment`, `operator_id`
- [ ] T-08.2 Aturan `operator_id`: jika Operator -> readonly/kunci dari `useAuthStore`/introspect; jika Admin -> dropdown pilih Operator
- [ ] T-09.1 Tabel item dinamis: `item_code`, `item_name`, `price`, `quantity`, `unit`, `expired_date`, auto `total_price = price * qty`, tambah/hapus baris
- [ ] T-09.2 Live `Grand Total` + progress bar vs `price_limit`, indikator sisa limit, block submit + tampilkan pesan `422` jika `Grand Total > price_limit`
- [ ] T-09.3 Mode Create vs Edit (prefill by `id`, draft kotor/batal, konfirmasi navigasi)

## 6. Aksi & Daftar Barang Masuk (T-10 + T-11)

- [ ] T-10.1 Toggle Verifikasi (optimistic UI + audit `X-Actor`)
- [ ] T-10.2 Cetak Surat Masuk (PDF per transaksi)
- [ ] T-10.3 Export Excel (`.xlsx` via `exceljs`/`xlsx`, ikut filter & query aktif)
- [ ] T-11.1 Filter: Kategori, Sub Kategori, Tahun + search + pagination 10/page (`scope_profile`)

## 7. QA & Security (T-12)

- [ ] T-12.1 Handle error: `422` over-limit, `401/403` sesi/role, `409` kode unik, network error
- [ ] T-12.2 Security FE: tidak ada secret/service token di FE, cookie HttpOnly only, scope eksplisit (`aud-identity`, `aud-people`, `aud-peladen`)
- [ ] T-12.3 UX: loading/empty/error state, responsif mobile, aksesibilitas label/focus, konfirmasi hapus
- [ ] T-12.4 Verifikasi manual: alur Admin end-to-end + alur Operator (kunci `operator_id` + over-limit blocked)

---

## Urutan Eksekusi Disarankan

1. T-01 -> T-02 -> T-03 (fondasi)
2. T-08 + T-09 (form inti Barang Masuk)
3. T-05 + T-06 (master pendukung dropdown)
4. T-04 + T-07 + T-10 + T-11 (lengkapi RBAC & aksi)
5. T-12 (QA)
