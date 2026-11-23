import type { Decision } from '../engine/types'

// Babak 3 "Nasabah dan debitur". Draft content for review by a banking practitioner.
export const chapter3: Decision[] = [
  {
    id: 'd7',
    chapter: 3,
    title: 'Debitur besar mulai menunggak',
    dimensions: ['business', 'strategic'],
    involvesPerson: false,
    variants: [
      {
        requiresFlags: ['relaxed_verification'],
        situation:
          'PT Agro Sentosa Makmur, penggilingan padi dengan kredit investasi dan modal kerja Rp5 miliar, menunggak angsuran dua bulan berturut-turut. Direkturnya, Pak Surya Kusuma, menyebut pembeli utamanya menunda pembayaran dan harga gabah naik. Saat meninjau berkasnya, analis kredit menemukan kunjungan usaha tahunan debitur ini terlewat dan pengikatan agunan gudang belum terdaftar sempurna di notaris, karena waktu tim analis cabang bulan lalu tersedot oleh berkas KUR yang dipercepat.',
        options: [
          {
            id: 'a',
            label: 'Setujui restrukturisasi tenor 18 bulan dengan masa tenggang enam bulan, tanpa menunggu pengikatan agunan dibereskan.',
            effects: { npl: 0.2, compliance: 5, regional: 1, dpk: 10 },
            setFlags: ['restructured_client'],
            signals: { business: -2, strategic: 1 },
            style: { people_task: 1, bold_steady: -1 },
            consequence:
              'Debitur kembali mengangsur pada bulan berikutnya dan rekening operasionalnya tetap di cabang. Tim hukum mencatat agunan gudang belum terikat sempurna, sehingga posisi bank lemah bila debitur kembali menunggak.',
          },
          {
            id: 'b',
            label: 'Kirim surat peringatan resmi dan mulai proses eksekusi atas agunan yang tersedia.',
            effects: { npl: 0.5, realization: -2, regional: -2, compliance: 3, dpk: -20 },
            setFlags: ['called_collateral'],
            signals: { business: 1, strategic: -1 },
            style: { growth_prudence: -2, people_task: -2, bold_steady: 1 },
            consequence:
              'Notaris menolak melanjutkan karena pengikatan agunan belum selesai, sehingga eksekusi tertunda berbulan-bulan. Pak Surya memindahkan rekening operasionalnya ke bank lain.',
          },
          {
            id: 'c',
            label: 'Catat sebagai pemantauan biasa dan tunggu angsuran jatuh tempo berikutnya sebelum bertindak.',
            effects: { npl: 0.7, compliance: 4, regional: -1 },
            setFlags: ['ignored_early_warning'],
            signals: { business: -2, strategic: -2 },
            style: { bold_steady: -2, growth_prudence: -1 },
            consequence:
              'Angsuran berikutnya tidak dibayar dan tunggakan naik menjadi tiga bulan. Analis kredit mengirim catatan pengingat tertulis kepada Anda yang belum dijawab.',
          },
          {
            id: 'd',
            label: 'Datangi usaha bersama analis kredit, susun rencana pemulihan dengan debitur, dan jadikan pengikatan agunan syarat pembicaraan restrukturisasi.',
            effects: { npl: 0.2, compliance: -3, realization: -1, morale: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 2 },
            style: { growth_prudence: -1, bold_steady: 1 },
            consequence:
              'Kunjungan memperlihatkan penggilingan masih beroperasi dan piutang ke pembeli utama bisa ditagih. Pak Surya setuju melengkapi pengikatan agunan, meski ia menilai bank terlalu banyak meminta saat usahanya sedang sulit.',
          },
        ],
      },
      {
        situation:
          'PT Agro Sentosa Makmur, penggilingan padi dengan kredit investasi dan modal kerja Rp5 miliar, menunggak angsuran dua bulan berturut-turut. Direkturnya, Pak Surya Kusuma, menyebut pembeli utamanya menunda pembayaran dan harga gabah naik. Berkas kredit lengkap dan agunan gudang terikat sempurna, tetapi analis kredit mencatat tanda peringatan dini: perputaran rekening menurun sejak tiga bulan lalu.',
        options: [
          {
            id: 'a',
            label: 'Setujui restrukturisasi tenor 18 bulan dengan masa tenggang enam bulan.',
            effects: { npl: 0.1, compliance: 2, regional: 1, dpk: 10 },
            setFlags: ['restructured_client'],
            signals: { business: 1, strategic: 1 },
            style: { people_task: 1, bold_steady: -1 },
            consequence:
              'Debitur kembali mengangsur sesuai jadwal baru dan rekening operasionalnya tetap di cabang. Komite kredit mencatat restrukturisasi ini bergantung pada pembayaran pembeli utama dan perlu dipantau.',
          },
          {
            id: 'b',
            label: 'Kirim surat peringatan resmi dan mulai proses eksekusi atas agunan.',
            effects: { npl: 0.4, realization: -2, regional: -1, compliance: 2, dpk: -20 },
            setFlags: ['called_collateral'],
            signals: { business: 1, strategic: -2 },
            style: { growth_prudence: -2, people_task: -2, bold_steady: 1 },
            consequence:
              'Karena agunan terikat sempurna, proses berjalan, tetapi lelang memakan waktu dan nilainya di bawah perkiraan. Pak Surya menutup rekening operasionalnya dan pelaku usaha lain di kota membicarakan tindakan bank.',
          },
          {
            id: 'c',
            label: 'Catat sebagai pemantauan biasa dan tunggu angsuran jatuh tempo berikutnya sebelum bertindak.',
            effects: { npl: 0.6, compliance: 3, regional: -1 },
            setFlags: ['ignored_early_warning'],
            signals: { business: -2, strategic: -2 },
            style: { bold_steady: -2, growth_prudence: -1 },
            consequence:
              'Satu bulan kemudian tunggakan menjadi tiga bulan dan pembeli utama debitur ikut mengurangi pesanan. Analis kredit menyampaikan bahwa peringatan dini yang ia ajukan belum ditindaklanjuti.',
          },
          {
            id: 'd',
            label: 'Datangi usaha bersama analis kredit dan susun rencana pemulihan dengan target penagihan ke pembeli utama.',
            effects: { npl: 0.1, morale: -1, compliance: -1, realization: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 1 },
            style: { people_task: 1, growth_prudence: -1 },
            consequence:
              'Kunjungan menghasilkan rencana pemulihan tiga bulan dengan target penagihan ke pembeli utama. Pak Surya bersedia melaporkan arus kas setiap dua minggu, dan analis kredit harus menambah jadwal pemantauan.',
          },
        ],
      },
    ],
  },
  {
    id: 'd8',
    chapter: 3,
    title: 'Nasabah marah dan mengancam viral',
    dimensions: ['influence', 'resilience', 'integrity'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['ignored_staff_issue'],
        person: 'Pak Darmawan Setiadi, nasabah tabungan dan pedagang pasar',
        situation:
          'Dua bulan lalu Pak Darmawan menulis keluhan tentang antrean teller pagi. Hari ini ia menunggu 50 menit, melewati batas waktu setoran ke pemasoknya, dan terkena denda keterlambatan Rp3,5 juta. Ia merekam antrean itu dan berkata akan mengunggahnya bersama keluhan lamanya yang menurutnya tidak pernah ditanggapi. Ia aktif di komunitas pedagang pasar dengan beberapa ratus anggota.',
        options: [
          {
            id: 'a',
            label: 'Temui langsung di ruang pelayanan, akui bahwa keluhan sebelumnya belum ditindaklanjuti, dan tawarkan penggantian sebagian denda sesuai kewenangan Anda.',
            effects: { regional: 1, morale: -1, dpk: 5 },
            setFlags: ['customer_apologized'],
            signals: { influence: 2, resilience: 1, integrity: 1 },
            style: { people_task: 1, bold_steady: 1 },
            consequence:
              'Pak Darmawan berhenti merekam dan menerima penggantian sebagian denda. Ia tetap menceritakan kejadian itu secara lisan kepada pedagang lain, tetapi tidak jadi mengunggah videonya. Staf teller yang mendengar pengakuan itu merasa cabang menyalahkan mereka di depan nasabah.',
          },
          {
            id: 'b',
            label: 'Jelaskan bahwa prosedur antrean sudah dijalankan, keterlambatan menjadi tanggung jawab nasabah, dan tolak penggantian denda.',
            effects: { morale: -3, regional: -3, dpk: -8 },
            setFlags: ['blamed_customer'],
            signals: { influence: -2, resilience: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Pak Darmawan mengunggah videonya sore itu dan dibagikan ratusan kali di grup pedagang. Tim humas kantor regional menghubungi Anda untuk meminta klarifikasi tertulis.',
          },
          {
            id: 'c',
            label: 'Serahkan penanganan kepada tim humas kantor regional dan minta dikabari hasilnya.',
            effects: { regional: -1, morale: -1 },
            setFlags: [],
            signals: { influence: -1, resilience: -1 },
            style: { bold_steady: -2, people_task: -1 },
            consequence:
              'Tim humas membalas lewat surat standar dua hari kemudian. Pak Darmawan merasa tidak ada yang menemuinya, dan keluhannya di media sosial mulai mengundang komentar nasabah lain.',
          },
          {
            id: 'd',
            label: 'Tawarkan penggantian denda penuh dengan syarat ia menandatangani pernyataan tidak akan menyebarkan video atau keluhan.',
            effects: { compliance: 4, regional: -2 },
            setFlags: [],
            signals: { influence: 1, integrity: -2 },
            style: { bold_steady: 1 },
            consequence:
              'Pak Darmawan menolak menandatangani dan memperlihatkan syarat itu kepada pedagang lain, yang lalu membagikannya. Tim humas regional bertanya apakah praktik semacam ini sudah mendapat persetujuan bagian hukum.',
          },
        ],
      },
      {
        person: 'Pak Darmawan Setiadi, nasabah tabungan dan pedagang pasar',
        situation:
          'Pak Darmawan mentransfer pembayaran Rp40 juta ke pemasoknya, tetapi sistem menahan transaksi untuk pemeriksaan otomatis dan teller memberi tahu prosesnya bisa memakan dua hari kerja. Pembayarannya terlambat dan ia terkena denda Rp3,5 juta. Ia datang ke kantor, meninggikan suara di depan nasabah lain, merekam percakapan dengan teller, dan berkata akan mengunggah videonya ke media sosial. Ia aktif di komunitas pedagang pasar dengan beberapa ratus anggota.',
        options: [
          {
            id: 'a',
            label: 'Temui langsung di ruang pelayanan, minta maaf atas pengalamannya, jelaskan penyebab penahanan transaksi, dan tawarkan penggantian sebagian denda sesuai kewenangan Anda.',
            effects: { regional: 1, morale: -1, dpk: 5 },
            setFlags: ['customer_apologized'],
            signals: { influence: 2, resilience: 1, integrity: 1 },
            style: { people_task: 1, bold_steady: 1 },
            consequence:
              'Pak Darmawan berhenti merekam dan menerima penggantian sebagian denda. Ia tetap menyampaikan kekecewaannya secara lisan kepada pedagang lain, tetapi tidak jadi mengunggah videonya. Teller yang bertugas merasa penjelasan di depan nasabah menempatkan mereka sebagai sumber masalah.',
          },
          {
            id: 'b',
            label: 'Jelaskan bahwa pemeriksaan otomatis wajib dan keterlambatan menjadi tanggung jawab nasabah, serta tolak penggantian denda.',
            effects: { morale: -3, regional: -3, dpk: -8 },
            setFlags: ['blamed_customer'],
            signals: { influence: -2, resilience: -1 },
            style: { people_task: -2, bold_steady: -1 },
            consequence:
              'Pak Darmawan mengunggah videonya sore itu dan dibagikan ratusan kali di grup pedagang. Tim humas kantor regional menghubungi Anda untuk meminta klarifikasi tertulis.',
          },
          {
            id: 'c',
            label: 'Serahkan penanganan kepada tim humas kantor regional dan minta dikabari hasilnya.',
            effects: { regional: -1, morale: -1 },
            setFlags: [],
            signals: { influence: -1, resilience: -1 },
            style: { bold_steady: -2, people_task: -1 },
            consequence:
              'Tim humas membalas lewat surat standar dua hari kemudian. Pak Darmawan merasa tidak ada yang menemuinya, dan unggahan yang ia tulis mulai mengundang komentar nasabah lain.',
          },
          {
            id: 'd',
            label: 'Tawarkan penggantian denda penuh dengan syarat ia menandatangani pernyataan tidak akan menyebarkan video atau keluhan.',
            effects: { compliance: 4, regional: -2 },
            setFlags: [],
            signals: { influence: 1, integrity: -2 },
            style: { bold_steady: 1 },
            consequence:
              'Pak Darmawan menolak menandatangani dan memperlihatkan syarat itu kepada pedagang lain, yang lalu membagikannya. Tim humas regional bertanya apakah praktik semacam ini sudah mendapat persetujuan bagian hukum.',
          },
        ],
      },
    ],
  },
  {
    id: 'd9',
    chapter: 3,
    title: 'Permintaan restrukturisasi',
    dimensions: ['business', 'strategic', 'learning'],
    involvesPerson: false,
    variants: [
      {
        requiresFlags: ['restructured_client'],
        situation:
          'Empat bulan setelah restrukturisasi, PT Agro Sentosa Makmur membayar tiga angsuran lalu kembali menunggak pada bulan keempat. Pak Surya Kusuma meminta restrukturisasi kedua disertai tambahan modal kerja Rp1 miliar. Komite kredit mengingatkan bahwa restrukturisasi berulang harus dilaporkan khusus ke kantor regional, dan analis kredit menilai arus kas debitur hanya membaik bila pembeli utama membayar tepat waktu.',
        options: [
          {
            id: 'a',
            label: 'Setujui restrukturisasi kedua dan tambahan modal kerja dengan pengawasan arus kas mingguan.',
            effects: { npl: 0.3, compliance: 4, dpk: 10, realization: 1 },
            setFlags: [],
            signals: { business: -2, learning: -1 },
            style: { growth_prudence: 2, bold_steady: 1 },
            consequence:
              'Tambahan modal kerja membuat penggilingan beroperasi penuh, dan komite kredit meneruskan kasus ini ke kantor regional sebagai restrukturisasi berulang. Debitur memenuhi laporan mingguan selama tiga minggu pertama lalu terlambat.',
          },
          {
            id: 'b',
            label: 'Tolak tambahan modal kerja, perpanjang tenor sekali lagi, dan akui kepada komite bahwa penilaian restrukturisasi pertama terlalu optimistis.',
            effects: { npl: 0.2, compliance: -2, regional: -1, realization: -1 },
            setFlags: [],
            signals: { learning: 2, business: 1 },
            style: { growth_prudence: -1, bold_steady: 1 },
            consequence:
              'Komite mencatat koreksi Anda dan menyusun kriteria baru untuk restrukturisasi. Pak Surya keberatan karena merasa kesepakatan pertama tidak dihormati.',
          },
          {
            id: 'c',
            label: 'Pindahkan debitur ke tim penyelesaian kredit khusus dan hentikan pembicaraan restrukturisasi.',
            effects: { npl: 0.6, realization: -1, dpk: -15, regional: 1 },
            setFlags: [],
            signals: { business: 1, strategic: 1 },
            style: { growth_prudence: -2, people_task: -1, bold_steady: 1 },
            consequence:
              'Tim penyelesaian khusus mengambil alih dan memperkirakan pemulihan sekitar 70% dari nilai kredit. Hubungan dengan debitur berakhir dan rekening operasionalnya dipindahkan.',
          },
          {
            id: 'd',
            label: 'Minta debitur menjual sebagian aset atau menambah modal sendiri sebagai syarat restrukturisasi kedua.',
            effects: { npl: 0.2, compliance: 1, realization: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 1, learning: 1 },
            style: { bold_steady: 1, growth_prudence: -1 },
            consequence:
              'Pak Surya menawarkan menjual satu truk dan menambah setoran modal Rp400 juta, lebih kecil dari yang diminta bank. Komite sedang menimbang apakah jumlah itu cukup.',
          },
        ],
      },
      {
        requiresFlags: ['called_collateral'],
        situation:
          'Setelah proses eksekusi agunan dimulai, Pak Surya Kusuma datang bersama pengacaranya dan mengajukan restrukturisasi, disertai tawaran melunasi 60% utang dalam enam bulan dari penjualan aset miliknya sendiri. Pengacaranya mengingatkan bahwa pengikatan agunan bisa digugat dan lelang dapat tertahan di pengadilan. Tim penyelesaian kredit memperkirakan lelang menghasilkan paling banyak 65% dari nilai kredit.',
        options: [
          {
            id: 'a',
            label: 'Terima tawaran pelunasan 60% dengan jadwal tertulis dan jaminan tambahan, lalu restrukturisasi sisanya.',
            effects: { npl: 0.3, compliance: 2, dpk: 5 },
            setFlags: [],
            signals: { business: 1, strategic: 2 },
            style: { bold_steady: 1 },
            consequence:
              'Pelunasan 60% masuk sesuai jadwal pada dua bulan pertama dan pengacara menarik ancaman gugatan. Sisa utang berstatus direstrukturisasi dan perlu dipantau komite.',
          },
          {
            id: 'b',
            label: 'Lanjutkan eksekusi dan lelang tanpa negosiasi.',
            effects: { npl: 0.5, realization: -2, regional: -1 },
            setFlags: [],
            signals: { business: 1, strategic: -2 },
            style: { growth_prudence: -2, people_task: -2, bold_steady: 1 },
            consequence:
              'Pengadilan menerima gugatan debitur dan lelang tertahan lebih dari empat bulan. Biaya hukum bertambah dan kredit tetap tercatat macet.',
          },
          {
            id: 'c',
            label: 'Setujui restrukturisasi penuh tanpa pelunasan di muka demi menghindari sengketa.',
            effects: { npl: 0.2, compliance: 5, regional: -1 },
            setFlags: [],
            signals: { business: -2, learning: -1 },
            style: { growth_prudence: 1, bold_steady: -1 },
            consequence:
              'Sengketa mereda dan pengacara menarik gugatan. Komite kredit mempertanyakan mengapa bank melepas posisi tawar yang sudah dimiliki lewat agunan.',
          },
          {
            id: 'd',
            label: 'Minta mediasi lewat lembaga penyelesaian sengketa dan libatkan tim hukum regional.',
            effects: { npl: 0.2, realization: -1, compliance: -2, regional: 1 },
            setFlags: [],
            signals: { strategic: 1, learning: 1 },
            style: { bold_steady: -1 },
            consequence:
              'Mediasi dijadwalkan enam minggu lagi dan debitur menyetujui menunda tindakan hukum selama prosesnya. Tim hukum regional meminta dokumen tambahan dari cabang.',
          },
        ],
      },
      {
        situation:
          'PT Agro Sentosa Makmur mengajukan restrukturisasi resmi setelah tunggakannya mencapai tiga bulan: perpanjangan tenor 24 bulan dan masa tenggang delapan bulan. Proyeksi arus kasnya menunjukkan kemampuan bayar hanya jika harga gabah turun dan pembeli utama membayar tepat waktu. Analis kredit menilai permintaan ini wajar tetapi asumsinya optimistis.',
        options: [
          {
            id: 'a',
            label: 'Setujui sesuai permintaan karena usaha debitur masih berjalan.',
            effects: { npl: 0.2, compliance: 3, dpk: 5 },
            setFlags: [],
            signals: { business: -1 },
            style: { growth_prudence: 1, people_task: 1 },
            consequence:
              'Debitur mengangsur sesuai jadwal baru pada bulan-bulan awal. Analis kredit mencatat bahwa asumsi proyeksinya belum diuji.',
          },
          {
            id: 'b',
            label: 'Setujui sebagian dengan tenor 18 bulan, masa tenggang empat bulan, dan laporan arus kas bulanan.',
            effects: { npl: 0.1, compliance: -1, realization: -1 },
            setFlags: [],
            signals: { business: 2, strategic: 1 },
            style: { growth_prudence: -1, bold_steady: 1 },
            consequence:
              'Pak Surya menerima dengan keberatan soal masa tenggang yang lebih pendek. Laporan arus kas bulan pertama datang tepat waktu dan sesuai proyeksi.',
          },
          {
            id: 'c',
            label: 'Tolak dan serahkan ke tim penyelesaian kredit khusus.',
            effects: { npl: 0.6, realization: -1, dpk: -15 },
            setFlags: [],
            signals: { business: 1, strategic: -1 },
            style: { growth_prudence: -2, people_task: -1 },
            consequence:
              'Tim khusus memulai penagihan dan debitur menghentikan seluruh transaksi di cabang. Kredit dicatat sebagai bermasalah pada bulan itu.',
          },
          {
            id: 'd',
            label: 'Setujui dengan syarat debitur menyerahkan uji sensitivitas proyeksi dan menambah agunan berupa mesin penggilingan.',
            effects: { npl: 0.1, compliance: -2 },
            setFlags: [],
            signals: { business: 1, strategic: 2, learning: 1 },
            style: { bold_steady: 1 },
            consequence:
              'Debitur memerlukan tiga minggu menyusun uji sensitivitas, dan hasilnya menunjukkan usahanya bertahan jika harga gabah turun 10%. Penambahan agunan mesin disetujui setelah penilaian ulang.',
          },
        ],
      },
    ],
  },
]
