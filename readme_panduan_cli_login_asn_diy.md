# Dokumen Analisis Sistem & Arsitektur Software

**Aplikasi Pengelolaan Barang — PT JMC Indonesia / DIY-Gov Integration**

| Atribut       | Keterangan                                               |
| :------------ | :------------------------------------------------------- |
| Versi Dokumen | v1.2 (Identity-Service Integrated)                       |
| Tanggal       | 15 Oktober 2026                                          |
| Status        | Final Review                                             |
| Ruang Lingkup | SSO Auth, Backend, Frontend, Database, Access Governance |

---

## Daftar Isi

1. [Spesifikasi Tech Stack &amp; SSO Architecture](#1-spesifikasi-tech-stack--sso-architecture)
2. [Arsitektur Autentikasi &amp; Token Exchange (Identity-Service)](#2-arsitektur-autentikasi--token-exchange-identity-service)
3. [Matriks Hak Akses (RBAC) &amp; Scope Audit](#3-matriks-hak-akses-rbac--scope-audit)
4. [Skema Database PostgreSQL](#4-skema-database-postgresql)
5. [Formula Logika Bisnis, Validasi &amp; Security Guidelines](#5-formula-logika-bisnis-validasi--security-guidelines)

---

## 1. Spesifikasi Tech Stack & SSO Architecture

| Lapisan          | Teknologi                                 | Keterangan                                         |
| :--------------- | :---------------------------------------- | :------------------------------------------------- |
| Backend          | Node.js (Express.js / NestJS)             | REST API (`peladen-be` / Application Backend)    |
| ORM              | Prisma / Sequelize                        | Akses PostgreSQL                                   |
| Frontend         | Vue.js 3 + Vite                           | Composition API (`peladen-fe` / Single Page App) |
| State & Routing  | Pinia, Vue Router                         | Manajemen state & navigasi                         |
| Styling          | Tailwind CSS                              | Utility-first CSS                                  |
| Database         | PostgreSQL                                | Database relasional utama                          |
| SSO Provider     | Keycloak (`satriya` / `simulasi-sso`) | Identity Provider (NIP / NIK / 2FA TOTP)           |
| Session Identity | `identity-service`                      | Opaque Session Token (32 byte, HTTP-only Cookie)   |
| File Storage     | Multer                                    | Local disk / cloud storage                         |
| Excel Export     | `exceljs` / `xlsx`                    | Export `.xlsx`                                   |

---

## 2. Arsitektur Autentikasi & Token Exchange (Identity-Service)

Aplikasi mengadopsi standar arsitektur **DIY-Gov Identity-Service**. Frontend tidak diperbolehkan menyimpan atau mengelola token JWT maupun secret.

```text
[ Browser / Frontend ]
       │
       │ 1. Direct Access Grant / PKCE
       ▼
  [ Keycloak ] ────( Access Token Keycloak )────┐
                                                │
       ┌────────────────────────────────────────┘
       │
       │ 2. POST /auth/exchange
       │    (X-User-Assertion: Keycloak Token)
       ▼
 [ Backend App ] ───( Authorization: Bearer Service Token )───► [ Identity-Service ]
       │                                                                │
       │ 4. Set-Cookie: session=opaque_token (HttpOnly)                 │ 3. Generasi
       └◄───────────────────────────────────────────────────────────────┘    Opaque Session

2.1 Alur Autentikasi (Base Flow)Frontend Authentication: User melakukan autentikasi ke Keycloak (realms/satriya untuk ASN) membawa username, password, dan TOTP jika diaktifkan.Token Exchange (POST /auth/exchange):Frontend mengirimkan Keycloak Access Token ke Backend melalui header X-User-Assertion.Backend memanggil identity-service menggunakan Service Token (realm: diy-gov-services dengan scope aud-identity).identity-service memverifikasi aturan login client, memperkaya profil (SIMPEG/HR-service/People-service), lalu merilis Opaque Session Token 32-byte.Session Cookie Management:Backend menyimpan session token sebagai cookie HttpOnly (session, Max-Age=900 / 15 menit) dan refresh_token (Max-Age=2592000 / 3 hari).Token Keycloak dibuang dari memori.Introspeksi Sesi (GET /introspect):Setiap request berikutnya diproteksi middleware backend yang memanggil identity-service/introspect membawa session token untuk mendapatkan Kontrak Identitas resmi.3. Matriks Hak Akses (RBAC) & Scope AuditKeterangan: ✅ = Diizinkan, ❌ = Tidak diizinkan.Modul / FiturAdmin (asn-diy / diskominfo.aptika)Operator (asn-diy / staff.opd)Aturan Bisnis, Scope & Validasi KunciLogin / SSO Auth✅✅Pertukaran token via POST /auth/exchange. Verifikasi status residency & status akun.Barang Masuk (Read & Filter)✅✅Pagination 10 item/halaman. Filter Kategori, Sub Kategori, Tahun. Scope: scope_profile.Barang Masuk (Create / Edit)✅✅Admin: dapat memilih Operator via dropdown.Operator: operator_id dikunci otomatis via Kontrak Identitas /introspect.Validasi: total seluruh item ≤ price_limit Sub Kategori.Cetak Surat Masuk✅✅Cetak / export PDF surat masuk per transaksi.Toggle Verifikasi✅✅Toggle status verifikasi. Audit log mencatat X-Actor nama pengguna.Export Excel✅✅Unduh .xlsx sesuai filter & query pencarian aktif.Master Data: Kategori✅❌CRUD via modal popup. Kode unik, maks. 10 karakter.Master Data: Sub Kategori✅❌CRUD via modal popup. Wajib pilih Kategori + Batas Harga (masking Rupiah).Manajemen User / Akses✅❌Pengelolaan peran lokal dan permohonan akses data via Portal Peladen.4. Skema Database PostgreSQLRelasi utama:Plaintextusers 1───* incoming_goods *───1 categories
                              *───1 sub_categories
incoming_goods 1───* incoming_good_items
sub_categories *───1 categories
4.1 Tabel usersSQLCREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nip VARCHAR(18) UNIQUE NOT NULL, -- NIP ASN dari SIMPEG / identity-service
    username VARCHAR(100) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Operator')),
    unor_id VARCHAR(50),
    unor_instansi_id VARCHAR(50),
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4.2 Tabel categoriesSQLCREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4.3 Tabel sub_categoriesSQLCREATE TABLE sub_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price_limit NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4.4 Tabel incoming_goodsSQLCREATE TABLE incoming_goods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operator_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    sub_category_id UUID NOT NULL REFERENCES sub_categories(id),
    source VARCHAR(200) NOT NULL,
    letter_number VARCHAR(100),
    attachment_path VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    grand_total NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4.5 Tabel incoming_good_itemsSQLCREATE TABLE incoming_good_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incoming_good_id UUID NOT NULL REFERENCES incoming_goods(id) ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(40) NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL,
    expired_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
5. Formula Logika Bisnis, Validasi & Security Guidelines5.1 Kalkulasi Total & Validasi Batas HargaUntuk setiap baris item ke-$i$:$$\text{total\_price}[i] = \text{price}[i] \times \text{quantity}[i]$$$$\text{Grand Total} = \sum_{i=1}^{n} \text{total\_price}[i]$$Syarat simpan data:$$\text{Grand Total} \le \text{SubCategory.price\_limit}$$Jika dilanggar, backend mengembalikan status HTTP 422 Unprocessable Entity:JSON{
  "status": 422,
  "message": "Total harga barang melebihi batas harga sub kategori."
}
5.2 Aturan Penguncian Operator & Keamanan Token (Thumb Rules)Penguncian Identity Operator: Jika sesi teridentifikasi ber-role Operator, backend wajib menimpa operator_id menggunakan ID dari hasil introspeksi sesi (GET /introspect) untuk mencegah impersonation.Secret Only in Backend: Client Secret (diy-gov-services) hanya disimpan di environment backend, dilarang dimasukkan dalam kode frontend, repositori Git, atau log.One Token, One Purpose: Setiap pemanggilan inter-service wajib meminta scope spesifik (aud-identity, aud-people, aud-peladen) secara eksplisit.Audit Trail: Seluruh aktivitas administratif dan perubahan status data wajib mencatat nama aktor (X-Actor) berdasarkan identitas resmi pengguna dari SSO.
```



function Get-TOTP {
    param ([string]$Base32Secret)

    $alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
    $bytes = [System.Collections.Generic.List[byte]]::new()
    $buffer = 0
    $bitsLeft = 0

    foreach ($c in $Base32Secret.ToUpper().ToCharArray()) {
        $val = $alphabet.IndexOf($c)
        if ($val -lt 0) { continue }

        $buffer = (($buffer -band 0xFFFFFF) -shl 5) -bor $val
        $bitsLeft += 5

        if ($bitsLeft -ge 8) {
            $bitsLeft -= 8
            $byteVal = ($buffer -shr $bitsLeft) -band 0xFF
            $bytes.Add([byte]$byteVal)
        }
    }

    $unixEpoch = [DateTime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
    $time = [long][Math]::Floor(((Get-Date).ToUniversalTime() - $unixEpoch).TotalSeconds / 30)

    $timeBytes = [BitConverter]::GetBytes($time)
    if ([BitConverter]::IsLittleEndian) { [Array]::Reverse($timeBytes) }

    $hmac = [System.Security.Cryptography.HMACSHA1]::new($bytes.ToArray())
    $hash = $hmac.ComputeHash($timeBytes)

    $offset = $hash[$hash.Length - 1] -band 0xF
    $binary = (($hash[$offset] -band 0x7F) -shl 24) -bor
              (($hash[$offset + 1] -band 0xFF) -shl 16) -bor
              (($hash[$offset + 2] -band 0xFF) -shl 8) -bor
               ($hash[$offset + 3] -band 0xFF)

    return ($binary % 1000000).ToString("D6")
}

# Contoh Pemanggilan

$TOTP = Get-TOTP -Base32Secret "NSYGJSSAKZBFO3KWGFFTXZZVJMYEGVK"
Write-Host "Kode OTP: $TOTP"
