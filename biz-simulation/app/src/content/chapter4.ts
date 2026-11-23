import type { Decision } from '../engine/types'

// Babak 4 "Audit dan regulator". Draft content for review by a banking practitioner.
export const chapter4: Decision[] = [
  {
    id: 'd10',
    chapter: 4,
    title: 'Temuan audit internal pada berkas pencairan',
    dimensions: ['integrity', 'learning', 'influence'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['relaxed_verification'],
        person: 'Ibu Maya Anggraeni, Auditor Internal Kantor Regional',
        situation:
          'Ibu Maya menyampaikan hasil audit: dari 60 berkas KUR yang diambil sebagai sampel, 22 dicairkan tanpa survei lapangan yang terdokumentasi, semuanya di unit yang memakai verifikasi lewat foto dan telepon. Temuan akan dinilai sebagai kelemahan pengendalian internal tingkat tinggi kecuali cabang menyampaikan tanggapan sebelum rapat pembahasan akhir pekan depan. Pak Hendra Wirawan menyarankan agar tanggapan cabang menyebut pelonggaran itu sebagai inisiatif unit.',
        options: [
          {
            id: 'a',
            label: 'Akui temuan di rapat pembahasan, nyatakan bahwa pelonggaran itu keputusan Anda, dan ajukan perbaikan prosedur dengan tenggat dan penanggung jawab.',
            effects: { compliance: -6, regional: 1, realization: -2, morale: -1 },
            setFlags: ['fixed_root_cause'],
            signals: { integrity: 2, learning: 2, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Ibu Maya mencatat sikap Anda dan menurunkan sebagian temuan menjadi rekomendasi. Pak Hendra mengeluh unitnya dijadikan contoh buruk, dan survei lapangan kembali berjalan lebih lambat.',
          },
          {
            id: 'b',
            label: 'Tanggapi bahwa pelonggaran dilakukan unit tanpa arahan cabang dan minta temuan diturunkan tingkatnya.',
            effects: { compliance: 6, regional: -2, morale: -3 },
            setFlags: ['deflected_audit'],
            signals: { integrity: -2, learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Ibu Maya meminta bukti persetujuan tertulis dan menemukan surat persetujuan pelonggaran di arsip cabang. Dua kepala unit menyampaikan keberatan karena merasa dikorbankan.',
          },
          {
            id: 'c',
            label: 'Lengkapi dokumen survei yang kurang lewat kunjungan ulang tanpa mengubah prosedur, lalu laporkan temuan sudah diperbaiki.',
            effects: { compliance: 2, morale: -2, realization: -1 },
            setFlags: [],
            signals: { integrity: -1, learning: -1 },
            style: { bold_steady: -1, people_task: -1 },
            consequence:
              'Petugas survei bekerja lembur dua minggu, dan sebagian kunjungan ulang menemukan kondisi usaha yang berbeda dari saat pengajuan. Ibu Maya menandai bahwa survei yang dilengkapi belakangan tidak dapat dihitung sebagai survei awal.',
          },
          {
            id: 'd',
            label: 'Temui kepala audit secara informal lebih dulu untuk meminta temuan dikemas lebih lunak dalam laporan akhir.',
            effects: { compliance: 4, regional: -1 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, influence: -1 },
            style: { bold_steady: 1 },
            consequence:
              'Kepala audit menolak mengubah isi temuan tetapi menyetujui bahwa tanggapan cabang dimuat lengkap. Ibu Maya mengetahui pertemuan itu dan mencatatnya dalam berkas audit.',
          },
        ],
      },
      {
        requiresFlags: ['pushed_growth'],
        person: 'Ibu Maya Anggraeni, Auditor Internal Kantor Regional',
        situation:
          'Ibu Maya menyampaikan hasil audit atas pencairan akhir kuartal: dari 60 berkas yang diambil sebagai sampel, 15 dicairkan sebelum survei akhir selesai dan kelengkapan agunannya baru dipenuhi setelah dana keluar. Pak Hendra menyatakan seluruh berkas itu sekarang sudah lengkap. Rapat pembahasan akhir dijadwalkan pekan depan.',
        options: [
          {
            id: 'a',
            label: 'Akui di rapat pembahasan bahwa dorongan pencairan akhir bulan berasal dari Anda, dan ajukan perbaikan prosedur dengan tenggat dan penanggung jawab.',
            effects: { compliance: -5, regional: 1, realization: -2, morale: -1 },
            setFlags: ['fixed_root_cause'],
            signals: { integrity: 2, learning: 2, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Ibu Maya mencatat pengakuan Anda dan menjadikan temuan itu rekomendasi dengan tenggat perbaikan. Tim pemasaran merasa target kuartal dipertanyakan dan realisasi bulan berikutnya melambat.',
          },
          {
            id: 'b',
            label: 'Tanggapi bahwa unit mencairkan atas inisiatif sendiri dan minta temuan diturunkan tingkatnya.',
            effects: { compliance: 5, regional: -2, morale: -3 },
            setFlags: ['deflected_audit'],
            signals: { integrity: -2, learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Ibu Maya menunjukkan pesan instruksi pencairan akhir bulan di grup manajemen cabang. Kepala unit yang terlibat menyampaikan keberatan karena merasa dikorbankan.',
          },
          {
            id: 'c',
            label: 'Lengkapi dokumen survei yang kurang lewat kunjungan ulang tanpa mengubah prosedur, lalu laporkan temuan sudah diperbaiki.',
            effects: { compliance: 2, morale: -2, realization: -1 },
            setFlags: [],
            signals: { integrity: -1, learning: -1 },
            style: { bold_steady: -1, people_task: -1 },
            consequence:
              'Petugas survei bekerja lembur dua minggu untuk melengkapi berkas yang sudah tercairkan. Ibu Maya menandai bahwa survei yang dilengkapi belakangan tidak dapat dihitung sebagai survei awal.',
          },
          {
            id: 'd',
            label: 'Temui kepala audit secara informal lebih dulu untuk meminta temuan dikemas lebih lunak dalam laporan akhir.',
            effects: { compliance: 4, regional: -1 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, influence: -1 },
            style: { bold_steady: 1 },
            consequence:
              'Kepala audit menolak mengubah isi temuan tetapi menyetujui bahwa tanggapan cabang dimuat lengkap. Ibu Maya mengetahui pertemuan itu dan mencatatnya dalam berkas audit.',
          },
        ],
      },
      {
        person: 'Ibu Maya Anggraeni, Auditor Internal Kantor Regional',
        situation:
          'Ibu Maya menyampaikan temuan audit rutin: dari 60 berkas kredit yang diambil sebagai sampel, 11 memiliki kekurangan dokumentasi agunan, seperti sertifikat yang belum dilegalisir dan taksasi yang belum ditandatangani, dan dua berkas melewati batas kewenangan persetujuan cabang. Temuan dinilai tingkat menengah. Rapat pembahasan akhir dijadwalkan pekan depan.',
        options: [
          {
            id: 'a',
            label: 'Akui temuan di rapat pembahasan, telusuri penyebab di tiap unit, dan ajukan perbaikan prosedur dengan tenggat dan penanggung jawab.',
            effects: { compliance: -4, regional: 1, realization: -1, morale: -1 },
            setFlags: ['fixed_root_cause'],
            signals: { integrity: 2, learning: 2, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Penelusuran menemukan bahwa dua unit memakai daftar periksa lama, dan keduanya diganti dalam dua minggu. Ibu Maya menutup temuan itu dengan rekomendasi pemantauan tiga bulan.',
          },
          {
            id: 'b',
            label: 'Tanggapi bahwa kekurangan itu kesalahan administrasi unit dan minta temuan diturunkan tingkatnya.',
            effects: { compliance: 4, regional: -1, morale: -3 },
            setFlags: ['deflected_audit'],
            signals: { integrity: -2, learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Ibu Maya meminta daftar penanggung jawab tiap berkas dan menemukan bahwa dua berkas disetujui langsung oleh cabang. Kepala unit yang disebut menyampaikan keberatan secara tertulis.',
          },
          {
            id: 'c',
            label: 'Lengkapi dokumen yang kurang secepatnya tanpa mengubah prosedur, lalu laporkan temuan sudah diperbaiki.',
            effects: { compliance: 2, morale: -2, realization: -1 },
            setFlags: [],
            signals: { integrity: -1, learning: -1 },
            style: { bold_steady: -1, people_task: -1 },
            consequence:
              'Dokumen yang kurang terlengkapi dalam sepuluh hari, tetapi penyebab kekurangannya tidak dibahas. Dua bulan kemudian kekurangan serupa muncul di berkas baru.',
          },
          {
            id: 'd',
            label: 'Temui kepala audit secara informal lebih dulu untuk meminta temuan dikemas lebih lunak dalam laporan akhir.',
            effects: { compliance: 3, regional: -1 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, influence: -1 },
            style: { bold_steady: 1 },
            consequence:
              'Kepala audit menolak mengubah isi temuan tetapi menyetujui bahwa tanggapan cabang dimuat lengkap. Ibu Maya mengetahui pertemuan itu dan mencatatnya dalam berkas audit.',
          },
        ],
      },
    ],
  },
  {
    id: 'd11',
    chapter: 4,
    title: 'Regulator meminta klarifikasi',
    dimensions: ['integrity', 'resilience', 'influence'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['deflected_audit'],
        person: 'Pak Yudhistira Santoso, Pemeriksa OJK',
        situation:
          'Pak Yudhistira meminta klarifikasi tertulis dalam lima hari kerja tentang pengendalian pencairan KUR di cabang, termasuk dokumen persetujuan dan hasil audit internal. Ia sudah menerima ringkasan audit termasuk tanggapan cabang yang menyebut unit sebagai penyebab, dan menanyakan siapa yang sebenarnya menyetujui prosedur pencairan.',
        options: [
          {
            id: 'a',
            label: 'Serahkan seluruh dokumen yang diminta, jelaskan peran Anda secara terbuka, dan lampirkan rencana perbaikan yang sudah berjalan.',
            effects: { compliance: -4, regional: -1, realization: -1 },
            setFlags: ['reported_transparently'],
            signals: { integrity: 2, resilience: 1, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Pak Yudhistira mencatat perbedaan antara tanggapan audit sebelumnya dan klarifikasi Anda, lalu meminta penjelasan tambahan. Pemeriksaan diperpanjang dua minggu, dan rencana perbaikan Anda diterima sebagai dasar tindak lanjut.',
          },
          {
            id: 'b',
            label: 'Minta perpanjangan batas waktu dua minggu untuk menyusun klarifikasi lengkap bersama tim hukum dan kepatuhan regional.',
            effects: { regional: 1, realization: -1, compliance: 1 },
            setFlags: [],
            signals: { resilience: 1, influence: 1 },
            style: { bold_steady: -1, growth_prudence: -1 },
            consequence:
              'OJK memberi perpanjangan satu minggu, bukan dua. Tim hukum regional menyusun jawaban yang rapi, tetapi memerlukan beberapa dokumen cabang yang belum tersusun.',
          },
          {
            id: 'c',
            label: 'Jawab hanya hal yang ditanyakan secara tertulis, tanpa menyebut temuan audit atau keluhan nasabah yang tidak diminta.',
            effects: { compliance: 5, regional: -2 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, resilience: -1 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Pak Yudhistira memperoleh temuan audit dari sumber lain dan menanyakan mengapa tidak dilampirkan. Pemeriksaan diperluas ke dua unit lagi.',
          },
          {
            id: 'd',
            label: 'Serahkan jawaban kepada kepala kepatuhan kantor regional dan hadir hanya bila diminta.',
            effects: { regional: 1, compliance: 2, morale: -1 },
            setFlags: [],
            signals: { influence: -1, resilience: -1 },
            style: { bold_steady: -2, people_task: -1 },
            consequence:
              'Kepala kepatuhan regional menjawab dengan bahasa umum yang tidak menyentuh praktik di cabang. Pak Yudhistira meminta Anda hadir langsung pada pertemuan berikutnya.',
          },
        ],
      },
      {
        person: 'Pak Yudhistira Santoso, Pemeriksa OJK',
        situation:
          'Pak Yudhistira meminta klarifikasi tertulis dalam lima hari kerja tentang pengendalian pencairan KUR di cabang, termasuk dokumen persetujuan, hasil audit internal, dan tindak lanjutnya. Ia menyebut pertemuan ini bagian dari pemeriksaan rutin, tetapi menanyakan secara khusus keluhan nasabah yang pernah masuk ke cabang.',
        options: [
          {
            id: 'a',
            label: 'Serahkan seluruh dokumen yang diminta, jelaskan peran Anda secara terbuka, dan lampirkan rencana perbaikan yang sudah berjalan.',
            effects: { compliance: -4, regional: -1, realization: -1 },
            setFlags: ['reported_transparently'],
            signals: { integrity: 2, resilience: 1, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Pak Yudhistira menerima dokumen lengkap dan mengajukan dua pertanyaan tindak lanjut. Pemeriksaan ditutup dengan catatan perbaikan yang dipantau selama enam bulan.',
          },
          {
            id: 'b',
            label: 'Minta perpanjangan batas waktu dua minggu untuk menyusun klarifikasi lengkap bersama tim hukum dan kepatuhan regional.',
            effects: { regional: 1, realization: -1, compliance: 1 },
            setFlags: [],
            signals: { resilience: 1, influence: 1 },
            style: { bold_steady: -1, growth_prudence: -1 },
            consequence:
              'OJK memberi perpanjangan satu minggu, bukan dua. Tim hukum regional menyusun jawaban yang rapi, tetapi memerlukan beberapa dokumen cabang yang belum tersusun.',
          },
          {
            id: 'c',
            label: 'Jawab hanya hal yang ditanyakan secara tertulis, tanpa menyebut temuan audit atau keluhan nasabah yang tidak diminta.',
            effects: { compliance: 5, regional: -2 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, resilience: -1 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Pak Yudhistira memperoleh temuan audit dari sumber lain dan menanyakan mengapa tidak dilampirkan. Pemeriksaan diperluas ke dua unit lagi.',
          },
          {
            id: 'd',
            label: 'Serahkan jawaban kepada kepala kepatuhan kantor regional dan hadir hanya bila diminta.',
            effects: { regional: 1, compliance: 2, morale: -1 },
            setFlags: [],
            signals: { influence: -1, resilience: -1 },
            style: { bold_steady: -2, people_task: -1 },
            consequence:
              'Kepala kepatuhan regional menjawab dengan bahasa umum yang tidak menyentuh praktik di cabang. Pak Yudhistira meminta Anda hadir langsung pada pertemuan berikutnya.',
          },
        ],
      },
    ],
  },
  {
    id: 'd12',
    chapter: 4,
    title: 'Laporan semester ke kantor regional',
    dimensions: ['influence', 'integrity', 'learning'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['softened_report'],
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius meminta laporan semester tentang kualitas kredit, hasil audit, dan tindak lanjutnya untuk rapat komite wilayah. Dalam tanggapan audit dan klarifikasi sebelumnya, cabang menyampaikan versi yang lebih ringan daripada keadaan sebenarnya. Auditor regional sudah memegang ringkasan yang lebih lengkap, sehingga selisih angka akan terlihat bila laporan baru kembali dibuat ringan.',
        options: [
          {
            id: 'a',
            label: 'Susun laporan lengkap, koreksi penyampaian sebelumnya, dan jelaskan kepada Pak Antonius lebih dulu sebelum rapat.',
            effects: { compliance: -4, regional: -2, realization: -1 },
            setFlags: ['reported_transparently'],
            signals: { integrity: 2, learning: 2, influence: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Pak Antonius terkejut dengan koreksi itu, tetapi memanggil Anda lebih dulu sebelum membawanya ke komite. Rapat komite menetapkan cabang dalam pemantauan khusus selama dua kuartal.',
          },
          {
            id: 'b',
            label: 'Pertahankan versi ringan yang konsisten dengan penyampaian sebelumnya dan soroti perbaikan yang sudah berjalan.',
            effects: { compliance: 6, regional: 2 },
            setFlags: ['softened_report'],
            signals: { integrity: -2, learning: -2 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Rapat komite berjalan tanpa pertanyaan sulit. Auditor regional mencocokkan laporan dengan ringkasannya dan mengirim permintaan klarifikasi tertulis kepada Anda.',
          },
          {
            id: 'c',
            label: 'Kirim draf laporan lebih dulu kepada rekan Anda di kantor regional untuk menguji reaksi, lalu putuskan versi akhirnya.',
            effects: { regional: 1, compliance: 2, realization: -1 },
            setFlags: [],
            signals: { influence: 2 },
            style: { bold_steady: -1 },
            consequence:
              'Rekan itu menyarankan melunakkan dua paragraf dan memperingatkan bahwa auditor regional cenderung meminta rincian. Versi akhir Anda lebih seimbang, tetapi sebagian pengakuan atas kesalahan di awal tidak tercantum.',
          },
          {
            id: 'd',
            label: 'Laporkan angka kualitas kredit saja dan lampirkan hasil audit sebagai dokumen terpisah tanpa pembahasan.',
            effects: { compliance: 3, regional: -1 },
            setFlags: [],
            signals: { influence: -1, integrity: -1 },
            style: { bold_steady: -1, people_task: -1 },
            consequence:
              'Komite wilayah tidak membaca lampiran dan menyimpulkan cabang tidak memiliki masalah pengendalian. Auditor regional mengirim pertanyaan karena lampiran itu tidak dibahas.',
          },
        ],
      },
      {
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius meminta laporan semester tentang kualitas kredit, hasil audit, dan tindak lanjutnya untuk rapat komite wilayah. Data cabang menunjukkan NPL membaik di tiga unit dan memburuk di satu unit, dan ada perbaikan prosedur yang belum selesai. Ia berharap laporan menekankan capaian dan risiko yang masih terbuka.',
        options: [
          {
            id: 'a',
            label: 'Susun laporan lengkap berisi capaian, risiko yang belum selesai, dan jadwal perbaikan, lalu sampaikan langsung kepada Pak Antonius.',
            effects: { compliance: -3, regional: 3, realization: -1 },
            setFlags: ['reported_transparently'],
            signals: { integrity: 2, influence: 1, learning: 1 },
            style: { bold_steady: 1 },
            consequence:
              'Pak Antonius menanyakan jadwal perbaikan unit yang memburuk dan meminta laporan kemajuan bulanan. Rapat komite memakai format laporan Anda sebagai acuan untuk cabang lain.',
          },
          {
            id: 'b',
            label: 'Soroti capaian dan perbaikan, dan sebut risiko yang belum selesai secara singkat agar rapat fokus pada hasil.',
            effects: { compliance: 4, regional: 2 },
            setFlags: ['softened_report'],
            signals: { integrity: -1, influence: 1 },
            style: { growth_prudence: 1, bold_steady: -1 },
            consequence:
              'Rapat komite berjalan lancar dan cabang dinilai berkinerja baik. Dua bulan kemudian unit yang memburuk mencatat tunggakan baru yang belum pernah dibahas di rapat itu.',
          },
          {
            id: 'c',
            label: 'Minta lima menit di rapat komite untuk menyampaikan langsung risiko yang belum selesai dan meminta dukungan sumber daya.',
            effects: { regional: 1, realization: -1, compliance: 1 },
            setFlags: [],
            signals: { influence: 2, learning: 1 },
            style: { bold_steady: 1 },
            consequence:
              'Komite menyetujui satu tambahan petugas survei untuk unit yang memburuk dan menurunkan target kredit baru unit itu. Beberapa peserta rapat menilai Anda terlalu banyak membuka kelemahan.',
          },
          {
            id: 'd',
            label: 'Kirim laporan tertulis tanpa presentasi dan tunggu pertanyaan dari komite.',
            effects: { compliance: 2, regional: -1 },
            setFlags: [],
            signals: { influence: -1, learning: -1 },
            style: { bold_steady: -2 },
            consequence:
              'Komite tidak mengajukan pertanyaan dan laporan diarsipkan. Unit yang memburuk tidak mendapat tambahan dukungan sebelum kuartal berikutnya.',
          },
        ],
      },
    ],
  },
]
