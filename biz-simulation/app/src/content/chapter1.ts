import type { Decision } from '../engine/types'

// Babak 1 "Target kredit vs kehati-hatian". Draft content for review by a banking practitioner.
export const chapter1: Decision[] = [
  {
    id: 'd1',
    chapter: 1,
    title: 'Dorongan target akhir bulan',
    dimensions: ['business', 'strategic'],
    involvesPerson: false,
    variants: [
      {
        situation:
          'Hari ke-22 bulan penutupan kuartal. Realisasi kredit cabang baru 78% dari target, sementara kantor regional meminta laporan akhir bulan menunjukkan minimal 90%. Di tiga unit mikro tersimpan 41 berkas KUR yang sudah disetujui prinsip, tetapi survei akhir dan kelengkapan agunannya belum selesai. Tim pemasaran berharap semuanya bisa dicairkan sebelum tutup buku.',
        options: [
          {
            id: 'a',
            label:
              'Minta semua unit mencairkan seluruh berkas yang sudah disetujui prinsip sebelum tutup buku, dokumen kekurangan dilengkapi menyusul.',
            effects: { realization: 9, npl: 0.4, morale: -3, compliance: 7 },
            setFlags: ['pushed_growth'],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 2, people_task: -1, bold_steady: 1 },
            consequence:
              'Realisasi melonjak mendekati target, tetapi sebagian pencairan tanpa survei akhir menambah risiko kredit bermasalah di unit. Beberapa petugas survei bertanya apakah standar survei masih berlaku.',
          },
          {
            id: 'b',
            label:
              'Cairkan hanya berkas yang lengkap dan jelaskan kepada kantor regional bahwa sisanya selesai awal bulan depan.',
            effects: { realization: 3, regional: -6, morale: 3, compliance: -3, npl: -0.1 },
            setFlags: ['held_line'],
            signals: { business: 2, strategic: 1 },
            style: { growth_prudence: -2, bold_steady: -1 },
            consequence:
              'Realisasi naik terbatas dan kantor regional mencatat cabang Anda belum mencapai target bulan ini. Portofolio tetap bersih dan petugas survei tidak ditekan memotong langkah.',
          },
          {
            id: 'c',
            label:
              'Kerahkan staf pemasaran membantu survei dan melengkapi dokumen di unit yang berkasnya hampir selesai, lalu cairkan sebanyak yang lolos verifikasi.',
            effects: { realization: 6, morale: -2, compliance: -1, regional: 2, npl: 0.1 },
            setFlags: [],
            signals: { business: 1, strategic: 2 },
            style: { bold_steady: 1, people_task: -1 },
            consequence:
              'Sebagian besar berkas yang siap tercairkan dan kualitasnya relatif terjaga. Staf pemasaran kelelahan karena beban tambahan menjelang tutup buku.',
          },
          {
            id: 'd',
            label:
              'Minta kantor regional menggeser tenggat satu bulan dengan rencana percepatan bertahap yang terukur.',
            effects: { realization: 1, regional: -3, morale: 2 },
            setFlags: [],
            signals: { strategic: 1, business: 1 },
            style: { growth_prudence: -1, bold_steady: 1 },
            consequence:
              'Kantor regional menerima rencana Anda dengan catatan, dan tekanan target mereda sementara. Capaian bulan ini tetap tertinggal dibanding cabang sejenis.',
          },
        ],
      },
    ],
  },
  {
    id: 'd2',
    chapter: 1,
    title: 'Permintaan melonggarkan verifikasi lapangan',
    dimensions: ['business', 'integrity', 'people'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['pushed_growth'],
        person: 'Pak Hendra Wirawan, Kepala Unit Sukamaju',
        situation:
          'Setelah dorongan pencairan akhir bulan, Pak Hendra melaporkan unitnya mencairkan 18 berkas tanpa survei akhir. Kini ia meminta agar kelonggaran itu dijadikan prosedur tetap untuk pinjaman di bawah Rp50 juta, "supaya tim tidak lagi serba salah". Dua petugas survei di unitnya mengaku tidak nyaman, tetapi belum membuat laporan resmi.',
        options: [
          {
            id: 'a',
            label: 'Setujui sebagai prosedur tetap agar tim tidak lagi berada dalam posisi serba salah.',
            effects: { realization: 6, npl: 0.5, compliance: 9, morale: 1 },
            setFlags: ['relaxed_verification', 'trusted_unit_head'],
            signals: { business: -2, integrity: -2 },
            style: { growth_prudence: 2, bold_steady: 1 },
            consequence:
              'Unit Sukamaju mencairkan jauh lebih cepat dan target mendekat. Celah dokumentasi melebar dan risiko temuan audit ikut naik.',
          },
          {
            id: 'b',
            label:
              'Hentikan pelonggaran, minta audit internal ringan atas 18 berkas itu, dan lindungi petugas survei yang berani bicara.',
            effects: { npl: -0.1, compliance: -5, morale: -1, realization: -3, regional: -1 },
            setFlags: [],
            signals: { integrity: 2, business: 1, people: 1 },
            style: { growth_prudence: -2, bold_steady: 1 },
            consequence:
              'Audit ringan menemukan beberapa berkas yang perlu dilengkapi dan dibereskan. Pak Hendra kecewa, tetapi petugas survei merasa didukung.',
          },
          {
            id: 'c',
            label: 'Setujui hanya untuk pinjaman di bawah Rp25 juta dan verifikasi ulang 18 berkas yang sudah tercairkan.',
            effects: { realization: 2, compliance: 1, npl: 0.1, morale: -1 },
            setFlags: ['relaxed_verification'],
            signals: { business: 1, integrity: 0, people: 1 },
            style: { growth_prudence: 0, people_task: 1 },
            consequence:
              'Pak Hendra mendapat sebagian yang diminta dan unitnya tetap bergerak. Batas Rp25 juta menimbulkan perdebatan baru mengenai di mana garis seharusnya ditarik.',
          },
          {
            id: 'd',
            label: 'Laporkan temuan ini ke kantor regional sebelum memutuskan, dan minta pedoman resmi.',
            effects: { regional: 3, realization: -2, compliance: -2, morale: -2 },
            setFlags: [],
            signals: { integrity: 2, business: 1 },
            style: { bold_steady: -1, growth_prudence: -1 },
            consequence:
              'Kantor regional menghargai transparansi Anda, tetapi pedoman baru memakan waktu dan unit menunggu tanpa kepastian. Sebagian tim menganggap Anda ragu-ragu.',
          },
        ],
      },
      {
        person: 'Pak Hendra Wirawan, Kepala Unit Sukamaju',
        situation:
          'Pak Hendra, Kepala Unit Sukamaju dengan penyaluran KUR terbesar di cabang, meminta persetujuan agar survei lapangan untuk pinjaman di bawah Rp50 juta cukup diganti verifikasi lewat foto dan telepon. Menurutnya 60% pemohon tinggal di desa yang jauh dan pesaing sudah mencairkan dalam dua hari. Ia menjanjikan realisasi unitnya naik 15% bulan depan.',
        options: [
          {
            id: 'a',
            label: 'Setujui sebagai prosedur tetap dengan sampel verifikasi lapangan 10%.',
            effects: { realization: 7, npl: 0.3, morale: 2, compliance: 6 },
            setFlags: ['relaxed_verification', 'trusted_unit_head'],
            signals: { business: -1, integrity: -1, people: 1 },
            style: { growth_prudence: 2, bold_steady: 1 },
            consequence:
              'Pencairan di Sukamaju dipercepat dan Pak Hendra merasa dipercaya. Pemeriksaan sampel 10% menyisakan celah yang bisa dipersoalkan auditor.',
          },
          {
            id: 'b',
            label: 'Tolak pelonggaran, tetapi tambah dua petugas survei sementara untuk unit tersebut.',
            effects: { realization: 1, morale: -1, npl: -0.1, compliance: -3 },
            setFlags: [],
            signals: { business: 2, integrity: 1, people: 1 },
            style: { growth_prudence: -1, people_task: 1 },
            consequence:
              'Waktu survei di Sukamaju berkurang tanpa mengubah standar, meski kecepatannya belum menyamai pesaing. Tiga unit lain kekurangan petugas dan mengeluh karena bebannya bertambah.',
          },
          {
            id: 'c',
            label:
              'Setujui uji coba tiga bulan hanya untuk pinjaman di bawah Rp25 juta, dengan evaluasi bulanan oleh tim risiko.',
            effects: { realization: 4, npl: 0.1, compliance: 2, morale: 1 },
            setFlags: ['relaxed_verification'],
            signals: { business: 1, integrity: 0, people: 1 },
            style: { growth_prudence: 1, bold_steady: 1 },
            consequence:
              'Uji coba memberi bukti nyata sebelum keputusan permanen, dan pencairan sedikit lebih cepat. Tim risiko bertambah pekerjaan evaluasi bulanan.',
          },
          {
            id: 'd',
            label: 'Tolak dan minta Pak Hendra menemukan cara mempercepat survei tanpa mengubah standar.',
            effects: { realization: -1, morale: -4, npl: -0.1 },
            setFlags: [],
            signals: { business: 1, integrity: 2, people: -1 },
            style: { growth_prudence: -2, people_task: -1, bold_steady: -1 },
            consequence:
              'Standar tidak berubah dan kualitas portofolio terjaga. Pak Hendra merasa tidak didengar dan semangat unitnya turun.',
          },
        ],
      },
    ],
  },
  {
    id: 'd3',
    chapter: 1,
    title: 'Bunga pesaing untuk debitur besar',
    dimensions: ['business', 'strategic'],
    involvesPerson: false,
    variants: [
      {
        requiresFlags: ['relaxed_verification'],
        situation:
          'Ibu Lestari Hartono, pemilik jaringan toko bangunan dengan fasilitas modal kerja Rp12 miliar, menyampaikan bahwa bank pesaing menawarkan bunga 1,2 poin persentase lebih rendah dan meminta jawaban dalam seminggu. Nasabah ini menyumbang sekitar 4% pendapatan bunga cabang dan lancar. Di saat yang sama, tim risiko mencatat beberapa debitur KUR yang dicairkan dengan verifikasi ringan mulai menunggak, sehingga margin cabang tertekan.',
        options: [
          {
            id: 'a',
            label: 'Samakan bunga pesaing untuk mempertahankan nasabah.',
            effects: { dpk: 25, realization: 3, compliance: 2, regional: -3, npl: 0.1 },
            setFlags: ['price_matched'],
            signals: { business: -2, strategic: -1 },
            style: { growth_prudence: 1 },
            consequence:
              'Nasabah bertahan dan dana tetap di cabang, tetapi margin yang sudah tipis menjadi lebih tipis. Kantor regional menanyakan alasan konsesi bunga di tengah naiknya tunggakan.',
          },
          {
            id: 'b',
            label: 'Tawarkan penurunan bunga sebagian dengan syarat penempatan dana dan payroll karyawan di cabang.',
            effects: { dpk: 60, realization: 2, regional: 2, morale: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 2 },
            style: { bold_steady: 1, growth_prudence: 0 },
            consequence:
              'Ibu Lestari menimbang tawaran paket tersebut dan setuju sebagian. Dana pihak ketiga cabang bertambah dan hubungan menjadi lebih dalam, tetapi tim operasional harus memindahkan payroll karyawan Ibu Lestari dalam waktu singkat dan beban kerja mereka bertambah.',
          },
          {
            id: 'c',
            label: 'Pertahankan bunga dan tonjolkan kecepatan layanan serta hubungan jangka panjang.',
            effects: { dpk: -35, realization: -2, regional: -2, morale: 1 },
            setFlags: [],
            signals: { business: 1, strategic: 0 },
            style: { growth_prudence: -1, bold_steady: -1 },
            consequence:
              'Sebagian fasilitas dialihkan ke pesaing. Margin cabang terlindungi, tetapi tim melihat nasabah penting hilang tanpa perlawanan.',
          },
          {
            id: 'd',
            label: 'Ajukan permohonan bunga khusus ke kantor regional atas nama nasabah strategis.',
            effects: { dpk: 20, regional: -1, realization: 1 },
            setFlags: [],
            signals: { strategic: 1, business: 0 },
            style: { bold_steady: -1 },
            consequence:
              'Proses persetujuan memakan waktu, dan Ibu Lestari mulai menunggu-nunggu. Kantor regional menilai Anda menyerahkan keputusan yang bisa Anda ambil sendiri.',
          },
        ],
      },
      {
        situation:
          'Ibu Lestari Hartono, pemilik jaringan toko bangunan dengan fasilitas modal kerja Rp12 miliar di cabang Anda, menyampaikan bahwa bank pesaing menawarkan bunga 1,2 poin persentase lebih rendah. Ia belum mengancam, tetapi meminta jawaban dalam seminggu. Nasabah ini menyumbang sekitar 4% pendapatan bunga cabang, kolektibilitasnya lancar, dan menempatkan dana operasional cukup besar.',
        options: [
          {
            id: 'a',
            label: 'Samakan bunga pesaing untuk mempertahankan nasabah.',
            effects: { dpk: 25, realization: 3, compliance: 1, regional: -2 },
            setFlags: ['price_matched'],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 1 },
            consequence:
              'Nasabah bertahan dan dana tetap di cabang, tetapi preseden penurunan bunga bisa memicu permintaan serupa dari debitur lain. Margin cabang berkurang.',
          },
          {
            id: 'b',
            label: 'Tawarkan penurunan bunga sebagian dengan syarat penempatan dana dan payroll karyawan di cabang.',
            effects: { dpk: 60, realization: 2, regional: 2, morale: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 2 },
            style: { bold_steady: 1 },
            consequence:
              'Paket yang menambah dana pihak ketiga membuat hubungan lebih terikat dan menguntungkan kedua pihak. Pemindahan payroll karyawan Ibu Lestari menambah beban kerja tim operasional untuk beberapa minggu, tetapi pesaing akan sulit menyamai layanan payroll yang terintegrasi.',
          },
          {
            id: 'c',
            label: 'Pertahankan bunga dan tonjolkan kecepatan layanan serta hubungan jangka panjang.',
            effects: { dpk: -35, realization: -2, regional: -2, morale: 1 },
            setFlags: [],
            signals: { business: 1, strategic: 0 },
            style: { growth_prudence: -1, bold_steady: -1 },
            consequence:
              'Ibu Lestari memindahkan sebagian fasilitas ke pesaing, tetapi cabang tidak membuka perang bunga. Sebagian tim mempertanyakan keputusan itu.',
          },
          {
            id: 'd',
            label: 'Ajukan permohonan bunga khusus ke kantor regional atas nama nasabah strategis.',
            effects: { dpk: 20, regional: -1, realization: 1 },
            setFlags: [],
            signals: { strategic: 1, business: 0 },
            style: { bold_steady: -1 },
            consequence:
              'Kantor regional menyetujui sebagian dengan prosedur yang lambat. Hubungan dengan Ibu Lestari bertahan, namun Anda terlihat belum memegang kewenangan penuh.',
          },
        ],
      },
    ],
  },
]
