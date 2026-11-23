# Simulasi Kepala Cabang (prototipe)

Prototipe simulasi kepemimpinan untuk manajer perbankan. Peserta berperan sebagai Kepala Cabang bank fiktif ("Bank Sinar Nusantara"), menjalani 15 keputusan dalam 5 babak, lalu menerima laporan kesiapan calon leader beserta tipe kepemimpinannya.

**Status: mode contoh.** Penilaian dihitung dengan aturan sederhana dari pilihan peserta. Alasan tertulis peserta dikutip di laporan sebagai bukti, tetapi belum dibaca oleh AI. Hasil penilaian AI sungguhan baru ada setelah penilai AI disambungkan (lihat bagian terakhir).

**Hasil tidak disimpan.** Begitu halaman ditutup atau dimuat ulang, jawaban hilang. Peserta bisa menyimpan laporan lewat tombol "Cetak / simpan PDF".

## Menjalankan di komputer Anda

Perlu Node.js (sudah terpasang di komputer ini). Buka Terminal, masuk ke folder `app` di dalam folder proyek, lalu:

```bash
npm install
```

Perintah di atas hanya perlu dijalankan sekali. Setelah itu, untuk membuka aplikasinya:

```bash
npm run dev
```

Terminal akan menampilkan alamat seperti `http://localhost:5173`. Buka alamat itu di browser. Untuk berhenti, tekan `Ctrl + C` di Terminal.

## Memeriksa bahwa semuanya masih benar

```bash
npm test
```

Jika semua berjalan baik, di bagian akhir muncul tulisan `passed` tanpa `failed`. Jalankan ini setiap kali Anda mengubah skenario. Pemeriksaan ini akan menolak, antara lain: jumlah keputusan yang bukan 15, nama bank asli, alur cerita yang tidak mungkin tercapai, dan angka yang tidak diisi.

## Mengedit skenario

Seluruh cerita ada di folder `src/content/`, satu berkas per babak (`chapter1.ts` sampai `chapter5.ts`). Nama bank, cabang, dan teks briefing ada di `profile.ts`.

Aman diubah tanpa risiko merusak program:
- `situation`: cerita situasi yang dibaca peserta.
- `person`: nama dan jabatan tokoh dalam situasi.
- `label`: teks pilihan tindakan.
- `consequence`: akibat yang dibaca peserta setelah memilih.
- `title`: judul keputusan.

Ubah dengan hati-hati, lalu jalankan `npm test`:
- `effects`: perubahan angka cabang (NPL, dana pihak ketiga, realisasi kredit, moral tim, hubungan dengan regional, risiko kepatuhan).
- `signals` dan `style`: bobot penilaian dan kecenderungan gaya. Nilainya dari -2 sampai 2, dan menentukan skor dimensi serta tipe kepemimpinan di laporan.
- `setFlags` dan `requiresFlags`: "catatan tersembunyi" yang membuat keputusan sebelumnya memengaruhi cerita berikutnya. Nama bendera harus persis sama di kedua tempat.

Aturan isi: tanpa nama bank asli, dan tanpa kata "lulus", "gagal", "terbaik", atau "terburuk" di teks yang kita tulis, karena laporan harus terbaca sebagai assessment dan bukan sebagai peringkat atau ujian.

**Penting:** seluruh isi skenario saat ini adalah **draf**, disusun dari pengetahuan umum perbankan ritel. Sebelum dipakai atau ditunjukkan ke klien, mintalah orang yang paham operasional kantor cabang bank membacanya. Lembar tinjauan untuk babak 1–4 ada di folder `docs/`. Tokoh dunia di laporan (misalnya Satya Nadella atau Warren Buffett) hanya analogi gaya berdasarkan persepsi publik, juga perlu Anda tinjau.

## Cara kerja singkat

- **Angka cabang** berubah menurut aturan tetap di berkas skenario, jadi bisa dijelaskan ke klien. AI tidak menentukan angka.
- **Keputusan sebelumnya memengaruhi berikutnya** lewat "catatan tersembunyi". Contohnya, melonggarkan verifikasi di babak 1 mengubah cerita temuan audit di babak 4.
- **Laporan** terdiri dari ringkasan, tingkat kesiapan (Emerging, Developing, Ready, Board-Ready), tipe kepemimpinan utama dan pendamping dari 16 tipe, skor tujuh dimensi dengan kutipan jawaban peserta, momen penentu beserta alternatifnya, kekuatan, dan area pengembangan. Tipe kepemimpinan adalah gambaran gaya dari satu simulasi, bukan diagnosis psikologis atau peringkat.

## Menyambungkan AI sungguhan nanti

Penilai dipilih di satu tempat, yaitu `src/scoring/active.ts`. Saat ini isinya penilai contoh. Untuk menyambungkan AI, buat penilai baru yang memenuhi bentuk `Scorer` di `src/scoring/scorer.ts`, lalu ganti satu baris di `active.ts`. Bagian lain aplikasi tidak perlu diubah. Akan dibutuhkan kunci akses (API key) dari penyedia AI, dan penanganan bila AI gagal menjawab sehingga peserta melihat pesan yang sopan.
