# 🚀 PANDUAN LENGKAP MEMBANGUN APLIKASI DI VS CODE DENGAN SUPABASE

Panduan ini disusun untuk membantu Anda menjalankan, mengembangkan, dan menghubungkan aplikasi manajemen keuangan pribadi & rekan ini di komputer lokal menggunakan **Visual Studio Code** dan **Supabase (PostgreSQL Database)**.

---

## 📑 DAFTAR ISI
1. [Persyaratan Awal (Prerequisites)](#1-persyaratan-awal)
2. [Cara Mengunduh / Clone Proyek ke Komputer](#2-cara-mengunduh--clone-proyek)
3. [Membuka Proyek di VS Code & Install Dependencies](#3-membuka-di-vs-code--install-dependencies)
4. [Membuat Proyek Database di Supabase](#4-membuat-proyek-di-supabase)
5. [Eksekusi Skema Database SQL di Supabase](#5-eksekusi-skema-database-sql)
6. [Menghubungkan Supabase ke Proyek (Environment Variables)](#6-menghubungkan-supabase-ke-proyek)
7. [Menjalankan Aplikasi di Lokal](#7-menjalankan-aplikasi-di-lokal)
8. [Struktur File Penting Proyek](#8-struktur-file-penting-proyek)
9. [Deploy ke Vercel / Netlify](#9-deploy-ke-vercel--netlify)

---

## 1. PERSYARATAN AWAL

Pastikan komputer atau laptop Anda telah terpasang:
1. **Node.js**: Unduh versi LTS (rekomendasi versi 18 atau 20) di [https://nodejs.org](https://nodejs.org).
2. **Git**: Unduh di [https://git-scm.com](https://git-scm.com).
3. **Visual Studio Code**: Unduh di [https://code.visualstudio.com](https://code.visualstudio.com).
4. **Akun Supabase (Gratis)**: Daftar akun di [https://supabase.com](https://supabase.com).

---

## 2. CARA MENGUNDUH / CLONE PROYEK

### Opsi A: Melalui Repository GitHub Anda
Jika Anda sudah menghubungkan proyek ini ke GitHub (misal: `github.com/adityabaskara3679-byte/Adit-lutfia`):
1. Buka Terminal di komputer Anda atau Command Prompt.
2. Jalankan perintah:
   ```bash
   git clone https://github.com/adityabaskara3679-byte/Adit-lutfia.git
   cd Adit-lutfia
   ```

### Opsi B: Mengunduh File ZIP dari GitHub
1. Buka halaman repositori GitHub Anda di browser.
2. Klik tombol hijau bertuliskan **Code** -> pilih **Download ZIP**.
3. Ekstrak (unzip) file tersebut ke folder kerja Anda.

---

## 3. MEMBUKA DI VS CODE & INSTALL DEPENDENCIES

1. Buka aplikasi **VS Code**.
2. Pilih menu **File** -> **Open Folder...** -> pilih folder proyek Anda.
3. Buka Terminal terintegrasi di VS Code dengan menekan shortcut `Ctrl + \`` (atau menu **Terminal** -> **New Terminal**).
4. Jalankan perintah instalasi paket:
   ```bash
   npm install
   ```
   *(Semua pustaka seperti React 19, Tailwind CSS v4, Lucide Icons, dan @supabase/supabase-js akan otomatis terpasang)*.

---

## 4. MEMBUAT PROYEK DI SUPABASE

1. Masuk ke [Dashboard Supabase](https://supabase.com/dashboard).
2. Klik tombol **New Project**.
3. Masukkan:
   - **Name**: `mitra-keuangan` (atau nama pilihan Anda).
   - **Database Password**: Buat password yang kuat dan catat.
   - **Region**: Pilih yang terdekat dengan Indonesia (misal: `Singapore` / `ap-southeast-1`).
4. Klik **Create new project** dan tunggu sekitar 1-2 menit hingga status database menjadi *Active*.

---

## 5. EKSEKUSI SKEMA DATABASE SQL

Di dalam folder proyek ini, sudah disediakan file `supabase_schema.sql` yang berisi seluruh struktur tabel, Row Level Security (RLS), dan trigger otomatis.

1. Buka file `supabase_schema.sql` di VS Code.
2. Salin seluruh isi teks file tersebut (`Ctrl + A` lalu `Ctrl + C`).
3. Kembali ke Dashboard Supabase Anda di browser.
4. Pada navigasi sidebar kiri Supabase, klik ikon **SQL Editor**.
5. Klik **New query** (atau tanda `+`).
6. Tempel (Paste) seluruh skrip SQL tadi ke editor.
7. Klik tombol hijau **Run** di kanan bawah.
8. Status akan menampilkan **Success**. Tabel-tabel berikut otomatis dibuat:
   - `profiles`: Data profil pengguna terintegrasi dengan Auth.
   - `accounts`: Dompet/rekening bank/e-wallet pengguna.
   - `categories`: Kategori pemasukan & pengeluaran.
   - `transactions`: Semua pencatatan pemasukan, pengeluaran, & transfer.
   - `budgets`: Batas anggaran bulanan per kategori.
   - `savings_goals` & `savings_deposits`: Target tabungan & histori setoran.
   - `debts` & `debt_installments`: Catatan utang & piutang beserta riwayat cicilan.
   - `friendships`: Fitur kolaborasi rekan/pasangan dengan izin privasi.

---

## 6. MENGHUBUNGKAN SUPABASE KE PROYEK

1. Di Dashboard Supabase, buka menu **Project Settings** (ikon gear di kiri bawah) -> pilih tab **API**.
2. Salin 2 nilai kunci berikut:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **Project API Keys (anon / public)** (token panjang)
3. Di VS Code, buat file baru di root folder dengan nama `.env.local` (atau duplikasi dari `.env.example`).
4. Masukkan kedua nilai tersebut:
   ```env
   VITE_SUPABASE_URL=https://proyek-anda.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. File `src/lib/supabase.ts` di proyek Anda sudah otomatis membaca variabel lingkungan ini.

---

## 7. MENJALANKAN APLIKASI DI LOKAL

Di terminal VS Code, jalankan perintah:
```bash
npm run dev
```
Buka browser Anda dan kunjungi alamat:
👉 **http://localhost:3000**

Aplikasi Anda kini berjalan secara live di komputer lokal Anda!

---

## 8. STRUKTUR FILE PENTING PROYEK

```
├── .env.example              # Template kunci lingkungan & Supabase
├── .env.local                # File rahasia URL & Anon Key Supabase Anda
├── package.json              # Daftar pustaka & skrip proyek
├── supabase_schema.sql       # Skrip DDL Database PostgreSQL & RLS
├── PANDUAN_VSCODE_SUPABASE.md # Dokumen panduan ini
├── src/
│   ├── components/           # Komponen antarmuka pengguna
│   │   ├── auth/             # Modal login & proteksi PIN (AppLockGate)
│   │   ├── dashboard/        # Dashboard kartu ringkasan & KPI
│   │   ├── transactions/     # Pencatatan transaksi & modal tambah/edit
│   │   ├── budget/           # Manajemen batas anggaran bulanan
│   │   ├── savings/          # Target tabungan & setoran
│   │   ├── debts/            # Utang & piutang beserta cicilan
│   │   ├── partner/          # Fitur keuangan bersama & izin rekan
│   │   ├── reports/          # Laporan grafis, filter periode & ekspor
│   │   ├── layout/           # Navbar, Sidebar, BottomNav (mobile first)
│   │   └── profile/          # Pengaturan profil, PIN & backup data
│   ├── context/
│   │   ├── AuthContext.tsx   # Otentikasi & manajemen sesi
│   │   └── ThemeContext.tsx  # Mode Gelap / Terang
│   ├── lib/
│   │   ├── supabase.ts       # Inisialisasi Supabase Client
│   │   └── storage.ts        # Penyimpanan data lokal
│   └── types/
│       └── finance.ts        # Definisi TypeScript seluruh entitas data
```

---

## 9. DEPLOY KE VERCEL / NETLIFY

Jika Anda ingin aplikasi ini dapat diakses secara online oleh siapa saja lewat internet:

1. Push perubahan kode Anda ke GitHub:
   ```bash
   git add .
   git commit -m "Integrasi Supabase & pembaruan sistem"
   git push origin main
   ```
2. Buka [Vercel](https://vercel.com) -> pilih proyek Anda.
3. Masuk ke **Settings** -> **Environment Variables**.
4. Tambahkan dua variabel yang sama seperti di `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Lakukan **Redeploy**. Aplikasi Anda langsung aktif online 24/7 dengan database Supabase Cloud!
