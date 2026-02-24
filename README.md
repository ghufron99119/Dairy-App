# Dairy-App 📓✨

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.15-f040b8?logo=framer)](https://www.framer.com/motion/)

**Dairy-App** adalah aplikasi berbasis web manajemen pribadi (Personal Dashboard) modern yang dirancang untuk membantu Anda mengatur aktivitas sehari-hari, jadwal, pencatatan keuangan, dan daftar tugas (checklist) dengan antarmuka pengguna yang interaktif dan responsif. Aplikasi ini dibangun menggunakan teknologi terbaru untuk memastikan performa maksimal dan pengalaman pengguna yang mulus.

---

## 🚀 Fitur Utama

Dairy-App menyediakan berbagai modul terintegrasi untuk produktivitas Anda:

1. **🔐 Sistem Autentikasi yang Aman**
   - Mendukung login dan registrasi menggunakan integrasi **Supabase Auth** (seperti Google Sign-In atau email/password).
   - Sesi dijaga dengan aman menggunakan middleware Next.js.
   
2. **📊 Dashboard Interaktif**
   - Ringkasan aktivitas dan metrik produktivitas Anda secara real-time.
   - Dilengkapi dengan grafik visualisasi data yang elegan menggunakan **Recharts**.

3. **✅ Manajemen Checklist (To-Do List)**
   - Buat, edit, dan hapus tugas dengan mudah.
   - Tandai tugas yang sudah selesai untuk melacak kemajuan produktivitas harian Anda.

4. **💰 Pencatatan Keuangan (Finance Tracking)**
   - Catat pemasukan dan pengeluaran harian.
   - Pantau arus kas dengan menggunakan grafik yang memudahkan Anda memahami pola pengeluaran.

5. **📅 Penjadwalan (Schedule Management)**
   - Kalender interaktif untuk merencanakan dan melacak agenda atau aktivitas Anda.
   - Pengingat visual untuk jadwal yang akan datang.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi ini dibangun di atas *modern tech stack* untuk skalabilitas, keamanan, dan performa tinggi:

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (untuk transisi dan animasi), [Lucide React](https://lucide.dev/) (untuk ikonografi)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Authentication)
- **Data Visualization:** [Recharts](https://recharts.org/)

---

## 🔄 Alur Kerja (User Workflow)

Berikut adalah alur penggunaan aplikasi secara umum:

1. **Autentikasi:** 
   Pengguna baru atau pengguna lama diarahkan ke halaman login. Setelah berhasil diotentikasi dan masuk melalui Supabase Auth, pengguna diarahkan secara otomatis ke Dashboard.
2. **Dashboard Overview:** 
   Dari `/dashboard`, pengguna mendapatkan pantauan langsung (summary overview) mengenai status keuangan harian/bulanan, progress tugas yang ada, serta jadwal atau event terdekat.
3. **Menjelajahi Menu (Navigasi Modul):** 
   Melalui panel navigasi/sidebar, pengguna dapat secara spesifik berinteraksi dengan:
   - **`/checklist`**: Menulis tugas baru, memberikan status selesai/belum, dan menghapus tugas yang sudah tidak relevan.
   - **`/finance`**: Menginput transaksi masuk atau keluar untuk melacak arus kas keuangan secara presisi.
   - **`/schedule`**: Mencatat semua rencana dan agenda personal di kalender aplikasi terintegrasi.
4. **Log Out:** 
   Pengguna dapat mengakhiri sesi kapan saja dengan mengeklik tombol logout di menu atau pengaturan profil.

---

## ⚙️ Persyaratan Sistem (Prasyarat)

Sebelum menjalankan project ini di komputer Anda, pastikan Anda telah memasang:

- [Node.js](https://nodejs.org/) (Versi 18.x atau lebih baru)
- *Package Manager* seperti npm, yarn, pnpm, atau bun
- Proyek [Supabase](https://supabase.com/) (untuk database relasional dan otentikasi)

---

## 💻 Instalasi dan Setup Lokal

Ikuti langkah-langkah di bawah ini untuk mengkloning dan menjalankan aplikasi:

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/username_anda/Dairy-App.git
   cd Dairy-App
   ```

2. **Instalasi Dependencies:**
   ```bash
   npm install
   # atau yarn / pnpm / bun install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file baru `.env.local` di *root* direktori project dan isi dengan kredensial Supabase Anda. Anda dapat merujuk pada `supabase-schema*.sql` untuk migrasi tabel database.
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

5. **Akses ke Aplikasi:**
   Sekarang Anda bisa membuka browser Anda dan melihat aplikasinya pada `http://localhost:3000`.

---

## 📁 Struktur Direktori Utama

```text
Dairy-App/
├── src/
│   ├── app/
│   │   ├── (auth)/        # Rute untuk otentikasi pengguna
│   │   ├── (dashboard)/   # Rute utama yang diproteksi di dalam dashboard
│   │   │   ├── checklist/ # Manajemen Daftar Pekerjaan/Tugas
│   │   │   ├── dashboard/ # Halaman Utama Metrik & Ringkasan
│   │   │   ├── finance/   # Metrik dan Pencatatan Keuangan
│   │   │   └── schedule/  # Kalender dan Rencana Kegiatan
│   │   ├── globals.css    # Gaya global proyek 
│   │   └── layout.tsx     # Layout dasar halaman Next.js
│   ├── components/        # Komponen global (Button, Navbar, Stats, dll.)
│   └── lib/               # Folder utils (contoh: klien Supabase)
├── public/                # Asset publik seperti favicon dan gambar dasar
├── tailwind.config.ts     # Konfigurasi utility framework Tailwind
├── supabase-*.sql         # File schema inisialisasi Database Supabase
└── package.json           # File konfigurasi npm/dependency
```

---

## 🤝 Kontribusi

Ingin membantu agar Dairy-App lebih baik? Kami sangat mengapresiasi setiap masukan dan kontribusi Anda!

1. Fork repository ini
2. Buat git branch khusus fitur Anda (`git checkout -b feature/NamaFitur`)
3. Simpan perubahan Anda (`git commit -m 'Membuat fitur keren'`)
4. Unggah ke branch Anda (`git push origin feature/NamaFitur`)
5. Buka Pull Request di repository utama.

---

## 📄 Lisensi

Repositori ini berada di bawah opsi open-source (Lisensi MIT). Anda bebas mengunduh dan memodifikasinya sesuai keperluan proyek dan preferensi Anda.

---
*Dibuat dengan bantuan ❤️ dan keunggulan Next.js untuk produktivitas paripurna.*
