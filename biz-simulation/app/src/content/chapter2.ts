import type { Decision } from '../engine/types'

// Babak 2 "Orang di tim". Draft content for review by a banking practitioner.
export const chapter2: Decision[] = [
  {
    id: 'd4',
    chapter: 2,
    title: 'Teller senior yang sering terlambat',
    dimensions: ['people', 'influence'],
    involvesPerson: true,
    variants: [
      {
        person: 'Ibu Ratna Susanti, Teller Senior (12 tahun masa kerja)',
        situation:
          'Dalam dua bulan terakhir Ibu Ratna terlambat sembilan kali, antrean pagi memanjang, dan dua nasabah menulis keluhan. Rekan-rekannya mulai menutup shift-nya tanpa diminta. Ia dikenal teliti dan disegani, dan beberapa staf diam-diam menyebut ia sedang menghadapi masalah keluarga. Kepala operasional meminta Anda bertindak tegas sebelum keluhan sampai ke kantor regional.',
        options: [
          {
            id: 'a',
            label:
              'Panggil secara pribadi, tanyakan kondisinya, dan sepakati penyesuaian jadwal sementara dengan target perbaikan yang jelas.',
            effects: { morale: 4, realization: -1 },
            setFlags: ['coached_staff'],
            signals: { people: 2, influence: 1 },
            style: { people_task: 2 },
            consequence:
              'Ibu Ratna menceritakan situasinya dan menyanggupi jadwal baru, sementara rekan-rekannya melihat ada ruang untuk bicara terus terang. Kepala operasional menganggap Anda terlalu lunak.',
          },
          {
            id: 'b',
            label: 'Berikan surat peringatan tertulis sesuai aturan disiplin.',
            effects: { morale: -5, compliance: -2 },
            setFlags: ['warned_staff'],
            signals: { people: -1, influence: 0 },
            style: { people_task: -2 },
            consequence:
              'Prosedur dijalankan dan kepala operasional merasa didukung. Dua rekan Ibu Ratna bertanya mengapa tidak ada yang menanyakan keadaannya lebih dulu, dan Ibu Ratna makin jarang berbicara.',
          },
          {
            id: 'c',
            label: 'Biarkan dulu sampai akhir kuartal supaya operasional menjelang tutup buku tidak terganggu.',
            effects: { morale: -3, realization: -1 },
            setFlags: ['ignored_staff_issue'],
            signals: { people: -2, influence: -1 },
            style: { bold_steady: -2 },
            consequence:
              'Operasional berjalan tanpa gejolak untuk sementara, tetapi keluhan nasabah bertambah dan rekan kerja mulai kesal.',
          },
          {
            id: 'd',
            label: 'Serahkan penanganan kepada kepala operasional dan minta dilaporkan hanya bila ada perkembangan.',
            effects: { morale: -1, compliance: 1 },
            setFlags: [],
            signals: { people: -1, influence: 1 },
            style: { people_task: -1 },
            consequence:
              'Kepala operasional bergerak cepat dengan pendekatan prosedural. Anda terhindar dari beban, namun Ibu Ratna tidak pernah merasa Anda memperhatikan.',
          },
        ],
      },
    ],
  },
  {
    id: 'd5',
    chapter: 2,
    title: 'Kepala unit berprestasi yang kasar pada staf',
    dimensions: ['people', 'integrity', 'influence'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['relaxed_verification'],
        person: 'Pak Hendra Wirawan, Kepala Unit Sukamaju',
        situation:
          'Unit Sukamaju kembali menjadi yang tertinggi dalam realisasi, dan kantor regional menyebutnya contoh sukses. Tiga staf mengadu ke HR bahwa Pak Hendra membentak mereka di depan nasabah dan mengancam memindahkan mereka bila angka turun. Seorang petugas survei menyebut ia pernah diminta "tidak terlalu teliti" agar target tercapai.',
        options: [
          {
            id: 'a',
            label:
              'Beri teguran keras secara tertutup, tetapkan target perilaku, dan minta pemeriksaan singkat atas praktik verifikasi unit tersebut.',
            effects: { morale: 5, realization: -3, compliance: -4, npl: -0.1 },
            setFlags: ['disciplined_star_lead'],
            signals: { people: 2, integrity: 2 },
            style: { people_task: 1, bold_steady: 1 },
            consequence:
              'Staf melihat pengaduan mereka ditanggapi dan pemeriksaan menemukan beberapa kekurangan dokumen yang sempat luput. Pak Hendra tersinggung dan realisasi unitnya melambat.',
          },
          {
            id: 'b',
            label: 'Lindungi dulu karena kontribusinya besar, dan bahas kekasarannya setelah target semester tercapai.',
            effects: { realization: 3, morale: -6, compliance: 5 },
            setFlags: ['protected_star_lead'],
            signals: { people: -2, integrity: -2 },
            style: { people_task: -2, growth_prudence: 1 },
            consequence:
              'Target semester tetap aman dan Pak Hendra tidak tersentuh. Dua staf mengajukan pindah dan yang lain berhenti melapor.',
          },
          {
            id: 'c',
            label: 'Pindahkan staf yang mengadu ke unit lain agar konflik mereda.',
            effects: { morale: -7, compliance: 4, realization: -1 },
            setFlags: ['protected_star_lead'],
            signals: { people: -2, integrity: -2, influence: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Ketegangan di unit mereda secara kasat mata, tetapi staf yang dipindahkan mengajukan keberatan tertulis ke HR karena merasa pengaduan mereka dibalas dengan mutasi.',
          },
          {
            id: 'd',
            label:
              'Bentuk tim kecil independen untuk memeriksa pengaduan dan praktik verifikasi, tanpa mengubah penilaian kinerja Pak Hendra sebelum hasilnya keluar.',
            effects: { morale: 2, realization: -1, compliance: -5 },
            setFlags: ['disciplined_star_lead'],
            signals: { integrity: 2, people: 1, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Proses pemeriksaan membuat staf merasa aman bicara dan temuan awal menutup beberapa celah. Pak Hendra merasa diperlakukan sebagai tersangka.',
          },
        ],
      },
      {
        person: 'Pak Bagas Prasetyo, Kepala Unit Karanganyar',
        situation:
          'Unit Karanganyar memiliki NPL terendah di cabang dan hubungan baik dengan perangkat desa. Namun tiga staf mengadu ke HR bahwa Pak Bagas membentak dan merendahkan mereka dalam rapat, dan unit itu kehilangan tiga staf dalam enam bulan terakhir. Kantor regional sering memuji hasil unit tersebut.',
        options: [
          {
            id: 'a',
            label: 'Beri teguran keras secara tertutup dan tetapkan target perilaku, dengan dukungan pendampingan kepemimpinan.',
            effects: { morale: 5, realization: -2, compliance: -2 },
            setFlags: ['disciplined_star_lead'],
            signals: { people: 2, integrity: 1 },
            style: { people_task: 1, bold_steady: 1 },
            consequence:
              'Staf melihat pengaduan ditanggapi dan suasana rapat membaik. Pak Bagas menerima pendampingan dengan tidak nyaman dan targetnya sedikit melambat.',
          },
          {
            id: 'b',
            label: 'Lindungi dulu karena kontribusinya besar, dan bahas kekasarannya setelah target semester tercapai.',
            effects: { realization: 3, morale: -6, compliance: 3 },
            setFlags: ['protected_star_lead'],
            signals: { people: -2, integrity: -1 },
            style: { people_task: -2, growth_prudence: 1 },
            consequence:
              'Unit tetap produktif sampai akhir semester, tetapi staf yang mengadu merasa diabaikan. Turnover berlanjut dan biaya rekrutmen mulai menumpuk.',
          },
          {
            id: 'c',
            label: 'Pindahkan staf yang mengadu ke unit lain agar konflik mereda.',
            effects: { morale: -7, compliance: 3, realization: -1 },
            setFlags: ['protected_star_lead'],
            signals: { people: -2, integrity: -2, influence: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Konflik langsung mereda, tetapi dua staf yang dipindahkan merasa dihukum atas pengaduan mereka. Staf lain mulai enggan berbicara.',
          },
          {
            id: 'd',
            label:
              'Bentuk tim kecil independen untuk memeriksa pengaduan, tanpa mengubah penilaian kinerja Pak Bagas sebelum hasilnya keluar.',
            effects: { morale: 2, realization: -1, compliance: -3 },
            setFlags: ['disciplined_star_lead'],
            signals: { integrity: 2, people: 1, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Proses yang adil membuat staf berani bicara dan menghasilkan rekomendasi konkret. Pak Bagas merasa diperlakukan sebagai tersangka walaupun penilaiannya tetap utuh.',
          },
        ],
      },
    ],
  },
  {
    id: 'd6',
    chapter: 2,
    title: 'Staf mengaku salah input transaksi',
    dimensions: ['integrity', 'learning', 'people'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['ignored_staff_issue'],
        person: 'Ibu Ratna Susanti, Teller Senior',
        situation:
          'Ibu Ratna mengaku salah memasukkan setoran tunai Rp48 juta ke rekening yang keliru. Dana sudah dikembalikan oleh pemilik rekening, tetapi selisihnya sempat tercatat dua hari dan belum ada yang tahu. Ia menambahkan bahwa beberapa minggu terakhir ia kelelahan merawat orang tuanya dan merasa tidak ada yang bertanya. Prosedur mewajibkan laporan insiden ke risk officer dan kantor regional.',
        options: [
          {
            id: 'a',
            label:
              'Laporkan insiden secara lengkap sesuai prosedur, dampingi Ibu Ratna, dan akui bahwa keluhan sebelumnya tidak Anda tindak lanjuti.',
            effects: { compliance: -4, morale: 4, regional: -2 },
            setFlags: ['coached_staff'],
            signals: { integrity: 2, learning: 2, people: 1 },
            style: { growth_prudence: -1, people_task: 1 },
            consequence:
              'Laporan lengkap menjaga catatan cabang dan Ibu Ratna merasa dihargai karena kejujurannya. Kantor regional mencatat kelemahan pengawasan, sekaligus melihat Anda berani mengakuinya.',
          },
          {
            id: 'b',
            label: 'Selesaikan secara internal dan catat sebagai koreksi biasa karena dananya sudah kembali.',
            effects: { compliance: 8, morale: 1, regional: 2 },
            setFlags: [],
            signals: { integrity: -2, learning: -2 },
            style: { bold_steady: 1, people_task: -1 },
            consequence:
              'Masalah tampak selesai dan angka kepatuhan tidak terlihat memburuk dulu. Risiko temuan audit naik karena insiden tidak tercatat di sistem pelaporan.',
          },
          {
            id: 'c',
            label: 'Lapor sesuai prosedur dan beri sanksi tegas pada Ibu Ratna sebagai pelajaran bagi tim.',
            effects: { compliance: -3, morale: -6, regional: 1 },
            setFlags: [],
            signals: { integrity: 1, people: -2, learning: -1 },
            style: { people_task: -2 },
            consequence:
              'Prosedur dijalankan dan kantor regional puas dengan ketegasan Anda. Tim melihat kejujuran dihukum dan insiden berikutnya mungkin tidak akan dilaporkan.',
          },
          {
            id: 'd',
            label: 'Lapor ke risk officer, tetapi tahan laporan ke kantor regional sampai audit rutin bulan depan.',
            effects: { compliance: 3, regional: -2, morale: 1 },
            setFlags: [],
            signals: { integrity: -1, learning: 0 },
            style: { bold_steady: -1 },
            consequence:
              'Risk officer mencatat insiden dan tekanan segera mereda. Penundaan laporan ke regional bisa terbaca sebagai upaya menutupi bila terungkap saat audit.',
          },
        ],
      },
      {
        person: 'Dimas Pratama, Teller (2 tahun masa kerja)',
        situation:
          'Dimas mengaku salah memasukkan setoran tunai Rp48 juta ke rekening yang keliru. Dana sudah dikembalikan oleh pemilik rekening, tetapi selisihnya sempat tercatat dua hari dan belum ada yang tahu. Prosedur mewajibkan laporan insiden ke risk officer dan kantor regional. Dimas terlihat sangat takut dan meminta agar kejadian ini tidak diperpanjang.',
        options: [
          {
            id: 'a',
            label:
              'Laporkan insiden secara lengkap sesuai prosedur, dampingi Dimas, dan akui kelemahan pengawasan di cabang.',
            effects: { compliance: -4, morale: 3, regional: -2 },
            setFlags: ['coached_staff'],
            signals: { integrity: 2, learning: 2, people: 1 },
            style: { growth_prudence: -1, people_task: 1 },
            consequence:
              'Laporan lengkap menjaga catatan cabang dan Dimas merasa dilindungi walaupun kesalahannya diakui. Kantor regional mencatat kelemahan pengawasan sekaligus transparansi Anda.',
          },
          {
            id: 'b',
            label: 'Selesaikan secara internal dan catat sebagai koreksi biasa karena dananya sudah kembali.',
            effects: { compliance: 8, morale: 1, regional: 2 },
            setFlags: [],
            signals: { integrity: -2, learning: -2 },
            style: { bold_steady: 1, people_task: -1 },
            consequence:
              'Masalah tampak selesai dan Dimas lega. Bila terungkap dalam audit, cabang menanggung kesalahan input sekaligus kelalaian tidak melapor.',
          },
          {
            id: 'c',
            label: 'Lapor sesuai prosedur dan beri sanksi tegas pada Dimas sebagai pelajaran bagi tim.',
            effects: { compliance: -3, morale: -6, regional: 1 },
            setFlags: [],
            signals: { integrity: 1, people: -2, learning: -1 },
            style: { people_task: -2 },
            consequence:
              'Prosedur dijalankan dan kantor regional puas dengan ketegasan Anda. Dua teller lain bertanya apakah kesalahan serupa sebaiknya dilaporkan atau disimpan sendiri.',
          },
          {
            id: 'd',
            label: 'Lapor ke risk officer, tetapi tahan laporan ke kantor regional sampai audit rutin bulan depan.',
            effects: { compliance: 3, regional: -2, morale: 1 },
            setFlags: [],
            signals: { integrity: -1, learning: 0 },
            style: { bold_steady: -1 },
            consequence:
              'Risk officer mencatat insiden dan tekanan segera mereda. Penundaan laporan ke regional bisa terbaca sebagai upaya menutupi bila terungkap saat audit.',
          },
        ],
      },
    ],
  },
]
