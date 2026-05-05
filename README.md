# ReadyLog / Note ReadyRoom

ReadyLog adalah aplikasi internal untuk membantu pencatatan operasional ReadyRoom.  
Aplikasi ini dibuat sebagai pengganti catatan manual seperti WPS/Excel agar data cabang, table operasional, dan laporan internal lebih rapi, cepat dicari, dan mudah dicetak.

## Tujuan

ReadyLog digunakan untuk mencatat kebutuhan internal seperti:

- Booking manual
- Operasional cabang
- PLN / token listrik
- Maintenance kamar
- Kas kecil
- Catatan tambahan cabang
- Laporan internal yang bisa dicetak ke PDF

## Fitur Saat Ini

- Tambah cabang
- Tambah table berdasarkan cabang
- Tambah data ke dalam table
- Edit data langsung di table
- Filter / pencarian data
- Pilih data tertentu
- Cetak PDF detail
- Summary total data
- Summary Cash, QRIS, dan TF
- Penyimpanan sementara menggunakan localStorage browser
- UI NeoBrutalism full color

## Catatan Penyimpanan Data

Untuk versi awal, data masih disimpan menggunakan `localStorage`.

Artinya:

- Data tersimpan di browser/perangkat yang sama
- Data belum tersinkron antar device
- Jika browser dibersihkan, data bisa hilang
- Untuk penggunaan operasional banyak user, aplikasi perlu disambungkan ke backend/database

## Rencana Pengembangan

- Login user dan role akses
- Backend database
- Sinkron data antar device
- Upload foto bukti
- Upload lampiran PDF
- Export PDF dengan lampiran gambar besar
- Riwayat edit data
- Hak akses karyawan, pengawas, dan boss
- Integrasi dengan sistem booking ReadyRoom

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- localStorage

## Cara Menjalankan Project

Install dependency:

```bash
npm install