# Build spec: Prototipe Simulasi Kepala Cabang Bank (Executive Decision Lab)

Type: app

## Goal

Memberi manajer perbankan sebuah simulasi 15 keputusan sebagai Kepala Cabang yang konsekuensinya berantai, lalu menghasilkan laporan penilaian yang terasa nyata dan spesifik untuk orang itu.

## Success looks like

Dalam uji internal, setiap penguji menyelesaikan 15 keputusan sampai laporan akhir; mayoritas penguji menyebut situasi dan angka terasa seperti pekerjaan kepala cabang sungguhan, dan laporannya dinilai sesuai dengan cara mereka memutuskan.

## Users

Awalnya pemilik produk dan rekan kerja (uji internal), kemudian dibagikan ke pengguna perbankan. Pemainnya level manager; paham perbankan tingkat menengah hingga tinggi.

## Must have

| # | Must have | Accept test |
|---|---|---|
| 1 | Briefing tugas dan profil kantor fiktif bergaya bank besar dengan unit mikro/KUR di bawahnya, tanpa merek asli | Buka halaman awal: terlihat briefing peran, nama fiktif, dan tidak ada merek bank asli di layar mana pun. |
| 2 | Dashboard kondisi cabang yang ikut berubah setelah tiap keputusan (misal NPL, dana pihak ketiga, target kredit, moral tim, hubungan dengan regional, risiko kepatuhan) | Catat angka awal, ambil keputusan 1, lihat angka berubah dan ada ringkasan sebab-akibat singkat; ulangi dengan jawaban berbeda dan angkanya berbeda. |
| 3 | 15 keputusan dalam 5 babak x 3 keputusan, tiap keputusan berformat pilihan lalu penjelasan alasan (campuran) | Mainkan sampai akhir: tepat 15 keputusan, tiap keputusan meminta pilihan dan alasan tertulis, tombol lanjut tidak aktif jika alasan kosong. |
| 4 | Konsekuensi berantai: keputusan sebelumnya mengubah situasi, tokoh, atau angka pada keputusan berikutnya | Mainkan dua kali dengan pola berbeda (agresif vs hati-hati) di babak 1; teks situasi di babak 3 dan 4 berbeda secara nyata dan menyebut akibat dari pilihan sebelumnya. |
| 5 | Aspek interpersonal diukur lewat keputusan tertulis yang melibatkan anak buah, nasabah, atasan regional, atau regulator | Minimal 5 dari 15 keputusan melibatkan orang tertentu dan menilai cara peserta menanganinya; peserta hanya menulis, tidak ada fitur percakapan. |
| 6 | Penilaian kesiapan calon leader pada tujuh dimensi (ketajaman bisnis dan risiko, pemikiran strategis, memimpin orang, pengaruh dan komunikasi, integritas dan keberanian moral, ketangguhan, ketangkasan belajar dan akuntabilitas), dengan alasan per dimensi | Selesai bermain: tiap dimensi punya skor dan satu alasan yang mengutip jawaban peserta sendiri. |
| 7 | Tingkat kesiapan (Emerging, Developing, Ready, Board-Ready) dan tipe kepemimpinan utama serta pendamping dari 16 tipe, dengan tokoh dunia sebagai analogi gaya, kekuatan, dan titik buta | Mainkan dua kali dengan pola jawaban berlawanan: tingkat kesiapan atau tipe utama berbeda; tiap tipe menampilkan nama tokoh, kekuatan, titik buta, dan catatan bahwa ini gambaran gaya, bukan diagnosis. |
| 8 | Laporan akhir spesifik per peserta, tampil di layar, bergaya laporan assessment (bukan skor game) | Dua peserta dengan jawaban berbeda mendapat laporan yang isi, tipe, dan kutipan buktinya berbeda; ada ringkasan, timeline keputusan, dampak ke angka cabang, skor dimensi, momen penentu, kekuatan, dan area pengembangan. |
| 9 | Seluruh teks dalam Bahasa Indonesia profesional dengan istilah perbankan yang tepat | Baca seluruh layar dan laporan: tidak ada istilah Inggris yang tidak perlu, tidak ada istilah perbankan yang keliru menurut reviewer yang paham bank. |

## Nice to have

- Unduh laporan sebagai PDF
- Penyimpanan hasil agar bisa dibandingkan antarpeserta
- Pengacakan urutan kasus agar dua sesi tidak persis sama

## Out of scope

- Login dan akun pengguna
- Dashboard admin dan undangan peserta
- Dialog bolak-balik dengan karakter AI
- Aplikasi HP atau aplikasi desktop
- Sektor usaha lain, serta jabatan lain selain kepala cabang
- Sambungan ke sistem internal pengguna atau HRIS
- Multiplayer

## Constraints

- Berjalan di browser laptop; mudah dipindah ke web nanti
- Tidak ada biaya di awal; lapisan AI dibuat bisa diganti penyedia
- Tidak menyebut merek bank nyata
- Pemilik produk tidak berlatar teknis; semua langkah harus dijelaskan sederhana

## Reject if

- Laporan terasa generik: bisa ditukar antarpeserta tanpa ada yang sadar
- Situasi atau angka tidak menggambarkan pekerjaan kepala cabang sungguhan
- Istilah atau proses perbankan keliru
- Skor tidak bisa dijelaskan dengan kutipan jawaban peserta
- Terasa seperti ujian pilihan ganda atau game, bukan assessment
- Keputusan awal tidak berdampak pada keputusan berikutnya
- Nama bank nyata muncul di mana pun

## Open risks

- Penilaian AI tingkat gratis mungkin kurang konsisten; perlu uji ulang dengan jawaban yang sama dua kali
- Realisme bergantung pada review ahli perbankan yang belum ada
- Bank pengguna mungkin meminta penyimpanan data dan keamanan sebelum pakai sungguhan

## Correct me before I build

| # | I am assuming | Risk |
|---|---|---|
| 1 | Lapisan AI dibuat bisa ditukar. Untuk mulai tanpa biaya, kita pakai penyedia AI dengan tingkat gratis atau mode contoh dulu; kualitas penilaian bisa di bawah model berbayar dan harus diuji sebelum dibagikan ke pihak lain. | high |
| 2 | Angka kondisi cabang dihitung dengan aturan tetap yang transparan; AI hanya menulis narasi situasi dan menilai jawaban, bukan menentukan angka. | high |
| 3 | Cabang yang disimulasikan adalah cabang kota menengah dengan beberapa unit mikro/KUR di bawahnya, sekitar puluhan karyawan; angka acuan disusun dari pengetahuan umum perbankan ritel Indonesia dan perlu direview orang yang paham bank. | high |
| 4 | Belum ada ahli perbankan yang me-review skenario; draf skenario dan angka disusun Claude, lalu dicek pemilik produk dan rekan sebelum dimainkan. | high |
| 5 | Dimensi penilaian berorientasi kesiapan calon leader (bukan kecakapan teknis semata): tujuh dimensi termasuk ketangkasan belajar dan akuntabilitas. Tipe kepemimpinan mengukur gaya, terpisah dari tingkat kesiapan. | med |
| 6 | Kecocokan tokoh dunia dengan tiap tipe adalah persepsi publik atas gaya mereka, bukan fakta yang diverifikasi; pemilik produk meninjau daftar tokoh sebelum dibagikan ke pihak lain. | high |
| 7 | Hasil tidak disimpan setelah laporan ditutup; peserta dapat menyalin atau mencetak laporan dari browser. | med |
| 8 | Satu orang bermain satu sesi tanpa akun; 45 sampai 75 menit. | med |
| 9 | Tampilan sederhana, netral, dan profesional seperti dokumen assessment; tanpa gamifikasi. | med |
| 10 | Tidak ada tenggat keras; versi pertama lengkap dari awal sampai laporan tetapi tampilannya polos. | low |
| 11 | Pemilik produk satu-satunya penyetuju sebelum dibagikan ke pihak lain. | low |

Reply yes to build, or tell me which line to change. Anything under Correct me is a guess, not a fact.
