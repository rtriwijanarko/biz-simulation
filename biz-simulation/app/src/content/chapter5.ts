import type { Decision, Option } from '../engine/types'

// Babak 5 "Tekanan regional dan arah cabang". Draft content for review by a banking practitioner.
// This is the last chapter, so it reads flags from earlier chapters but sets none.

// D13 option d reads the same in every variant.
const d13OptionD: Option = {
  id: 'd',
  label: 'Terima target tanpa pembahasan dan minta tiap kepala unit menentukan caranya sendiri dengan laporan mingguan.',
  effects: { realization: 3, npl: 0.3, morale: -4, compliance: 4, regional: 1 },
  setFlags: [],
  signals: { influence: -2, business: -1 },
  style: { people_task: -2, bold_steady: -1 },
  consequence:
    'Laporan mingguan masuk tepat waktu dan dua unit mempercepat pencairan menjelang akhir bulan. Seorang kepala unit mengirim surat ke HR regional yang menyatakan target tidak pernah dibahas dengan mereka.',
}

// D14 option d reads the same in every variant.
const d14OptionD: Option = {
  id: 'd',
  label: 'Dengarkan sampai selesai, minta waktu satu minggu untuk menyusun rencana perbaikan tertulis bersama tim, lalu kembali dengan rencana itu.',
  effects: { regional: -1, compliance: 1, realization: -1 },
  setFlags: [],
  signals: { resilience: 1, influence: 1, learning: 1 },
  style: { bold_steady: -1, people_task: 1 },
  consequence:
    'Pak Antonius memberi waktu satu minggu tetapi menyampaikan bahwa ia berharap Anda sudah punya sikap sendiri hari ini. Rencana tertulis Anda masuk tepat waktu dan memuat masukan dari para kepala unit.',
}

export const chapter5: Decision[] = [
  {
    id: 'd13',
    chapter: 5,
    title: 'Target semester diperketat kantor regional',
    dimensions: ['business', 'strategic', 'influence'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['softened_report'],
        person: 'Ibu Kartika Prameswari, Kepala Divisi Bisnis Kantor Regional',
        situation:
          'Ibu Kartika menyampaikan target semester berikutnya: realisasi kredit naik 15% dari target semester ini, dengan batas NPL 3,0%. Target itu disusun dari laporan semester cabang, yang menggambarkan kondisi lebih baik daripada keadaan di lapangan dan tidak mencantumkan beberapa risiko yang belum selesai. Dua dari empat kepala unit sudah menyampaikan kepada Anda bahwa target tersebut tidak sesuai dengan portofolio mereka.',
        options: [
          {
            id: 'a',
            label: 'Terima target penuh, bagi rata ke empat unit, dan kaitkan insentif tim pemasaran pada realisasi bulanan.',
            effects: { realization: 4, npl: 0.4, morale: -3, compliance: 5, regional: 1 },
            setFlags: [],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 2, people_task: -1, bold_steady: -1 },
            consequence:
              'Realisasi tiga bulan pertama naik mendekati target, tetapi dua unit yang portofolionya sudah lemah mencatat tunggakan baru dari kredit yang dicairkan terburu-buru. Auditor regional mencocokkan angka kuartal itu dengan catatannya dan menandai selisihnya dengan laporan semester.',
          },
          {
            id: 'b',
            label: 'Temui Ibu Kartika, paparkan kapasitas dan kondisi portofolio tiap unit apa adanya, termasuk risiko yang belum tercantum di laporan semester, dan ajukan target realisasi lebih rendah.',
            effects: { realization: -1, regional: -1, compliance: -3, morale: -1 },
            setFlags: [],
            signals: { influence: 2, business: 1, strategic: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Ibu Kartika menyetujui kenaikan 8% dari semula 15% dengan laporan kapasitas unit setiap bulan, dan meminta laporan semester diperbarui. Rapat dengan para kepala unit menjadi tegang karena risiko yang belum tercantum dibahas terbuka.',
          },
          {
            id: 'c',
            label: 'Terima total target, tetapi bagi menurut kapasitas dan kualitas portofolio tiap unit, dan geser sebagian beban ke penghimpunan dana pihak ketiga.',
            effects: { dpk: 25, realization: 2, npl: 0.1, compliance: 1, morale: -1 },
            setFlags: [],
            signals: { strategic: 2, business: 1 },
            style: { bold_steady: 1, people_task: 1 },
            consequence:
              'Unit dengan portofolio rapi menerima target kredit lebih tinggi dan unit yang lemah menerima target dana pihak ketiga. Ibu Kartika menanyakan dasar pembagian itu karena tidak sejalan dengan angka di laporan semester, dan permintaan data pendukung masuk ke cabang pada minggu berikutnya.',
          },
          d13OptionD,
        ],
      },
      {
        requiresFlags: ['pushed_growth'],
        person: 'Ibu Kartika Prameswari, Kepala Divisi Bisnis Kantor Regional',
        situation:
          'Ibu Kartika menyampaikan target semester berikutnya: realisasi kredit naik 15% dari target semester ini, dengan batas NPL 3,0%. Ia menjadikan lonjakan pencairan akhir kuartal cabang sebagai dasar bahwa kapasitas itu ada. Sebagian kredit yang dicairkan menjelang tutup buku belum melewati satu siklus angsuran, sehingga kualitasnya belum teruji, dan para kepala unit menyebut tim survei sudah kewalahan.',
        options: [
          {
            id: 'a',
            label: 'Terima target penuh, bagi rata ke empat unit, dan kaitkan insentif tim pemasaran pada realisasi bulanan.',
            effects: { realization: 5, npl: 0.4, morale: -4, compliance: 4, regional: 2 },
            setFlags: [],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 2, people_task: -1, bold_steady: -1 },
            consequence:
              'Realisasi tiga bulan pertama melampaui pola semester lalu, tetapi petugas survei bekerja lembur hampir tiap pekan dan dua orang mengajukan cuti sakit. Tunggakan dari kredit akhir kuartal sebelumnya mulai muncul pada bulan keempat.',
          },
          {
            id: 'b',
            label: 'Minta bertemu Ibu Kartika, paparkan kapasitas dan portofolio tiap unit dengan data, dan ajukan target realisasi lebih rendah dengan batas NPL yang tetap.',
            effects: { realization: -1, regional: -1, compliance: -2, morale: 2 },
            setFlags: [],
            signals: { influence: 2, business: 1, strategic: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Ibu Kartika menyetujui kenaikan 8% dari semula 15% setelah melihat jumlah berkas per petugas survei, dengan laporan kapasitas unit setiap bulan. Ia menyatakan lonjakan akhir kuartal tidak dipakai lagi sebagai patokan kapasitas.',
          },
          {
            id: 'c',
            label: 'Terima total target, tetapi bagi menurut kapasitas dan kualitas portofolio tiap unit, dan geser sebagian beban ke penghimpunan dana pihak ketiga.',
            effects: { dpk: 25, realization: 2, npl: 0.1, morale: -1 },
            setFlags: [],
            signals: { strategic: 2, business: 1 },
            style: { bold_steady: 1, people_task: 1 },
            consequence:
              'Unit dengan portofolio rapi menerima target kredit lebih tinggi dan unit yang kewalahan menerima target dana pihak ketiga. Dua kepala unit mempertanyakan pembagian itu, dan realisasi total semester mencapai sekitar 90% dari target baru.',
          },
          d13OptionD,
        ],
      },
      {
        requiresFlags: ['held_line', 'reported_transparently'],
        excludesFlags: ['relaxed_verification'],
        person: 'Ibu Kartika Prameswari, Kepala Divisi Bisnis Kantor Regional',
        situation:
          'Ibu Kartika menyampaikan target semester berikutnya: realisasi kredit naik 15% dari target semester ini, dengan batas NPL 3,0%. Ia mencatat bahwa cabang Anda menahan pencairan sebelum survei selesai dan melaporkan kondisinya secara terbuka, tetapi realisasi kredit cabang tertinggal dari cabang sebaya dan kantor regional ingin selisih itu ditutup semester depan.',
        options: [
          {
            id: 'a',
            label: 'Terima target penuh, bagi rata ke empat unit, dan kaitkan insentif tim pemasaran pada realisasi bulanan.',
            effects: { realization: 4, npl: 0.2, morale: -2, compliance: 3, regional: 2 },
            setFlags: [],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 2, people_task: -1, bold_steady: -1 },
            consequence:
              'Realisasi naik bertahap dan tim pemasaran menyambut insentif itu. Pada bulan kedua dua kepala unit meminta kelonggaran jadwal survei agar target bulanan tercapai, dan permintaan itu harus Anda jawab.',
          },
          {
            id: 'b',
            label: 'Minta bertemu Ibu Kartika, paparkan kapasitas dan portofolio tiap unit dengan data, dan ajukan target realisasi lebih rendah dengan batas NPL yang tetap.',
            effects: { realization: -1, regional: 1, compliance: -2, morale: 2 },
            setFlags: [],
            signals: { influence: 2, business: 1, strategic: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Ibu Kartika menyetujui kenaikan 10% dari semula 15%, dengan syarat batas NPL 3,0% dipertahankan. Ia menyebut cabang lain yang tidak membahas target menerima angka penuh.',
          },
          {
            id: 'c',
            label: 'Terima total target, tetapi bagi menurut kapasitas dan kualitas portofolio tiap unit, dan geser sebagian beban ke penghimpunan dana pihak ketiga.',
            effects: { dpk: 25, realization: 2, npl: 0.1, compliance: -1 },
            setFlags: [],
            signals: { strategic: 2, business: 1 },
            style: { bold_steady: 1, people_task: 1 },
            consequence:
              'Unit dengan portofolio rapi menerima target kredit lebih tinggi dan unit yang lemah menerima target dana pihak ketiga. Ibu Kartika menerima pembagian itu dan meminta laporan kemajuan per unit setiap bulan.',
          },
          d13OptionD,
        ],
      },
      {
        person: 'Ibu Kartika Prameswari, Kepala Divisi Bisnis Kantor Regional',
        situation:
          'Ibu Kartika menyampaikan target semester berikutnya: realisasi kredit naik 15% dari target semester ini, dengan batas NPL 3,0%. Kantor regional menyebut kenaikan itu berlaku untuk seluruh cabang di wilayah dan tidak dibahas per cabang. Para kepala unit meminta penjelasan cara target itu dibagi sebelum rapat internal pekan depan.',
        options: [
          {
            id: 'a',
            label: 'Terima target penuh, bagi rata ke empat unit, dan kaitkan insentif tim pemasaran pada realisasi bulanan.',
            effects: { realization: 4, npl: 0.3, morale: -3, compliance: 3, regional: 2 },
            setFlags: [],
            signals: { business: -1, strategic: -1 },
            style: { growth_prudence: 2, people_task: -1, bold_steady: -1 },
            consequence:
              'Realisasi tiga bulan pertama naik mendekati target, tetapi dua unit mencatat permintaan kredit baru dengan kualitas yang menurun dan staf pemasaran mulai menolak cuti. Ibu Kartika menjadikan skema insentif cabang Anda contoh dalam rapat koordinasi wilayah.',
          },
          {
            id: 'b',
            label: 'Minta bertemu Ibu Kartika, paparkan kapasitas dan portofolio tiap unit dengan data, dan ajukan target realisasi lebih rendah dengan batas NPL yang tetap.',
            effects: { realization: -1, regional: -1, compliance: -2, morale: 2 },
            setFlags: [],
            signals: { influence: 2, business: 1, strategic: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Ibu Kartika menyetujui kenaikan 8% dari semula 15% dengan laporan kapasitas unit setiap bulan. Dua cabang lain yang menerima target penuh menyampaikan keberatan karena tidak diberi kesempatan serupa.',
          },
          {
            id: 'c',
            label: 'Terima total target, tetapi bagi menurut kapasitas dan kualitas portofolio tiap unit, dan geser sebagian beban ke penghimpunan dana pihak ketiga.',
            effects: { dpk: 25, realization: 2, npl: 0.1, morale: -1 },
            setFlags: [],
            signals: { strategic: 2, business: 1 },
            style: { bold_steady: 1, people_task: 1 },
            consequence:
              'Unit dengan portofolio rapi menerima target kredit lebih tinggi dan unit yang lemah menerima target dana pihak ketiga. Dua kepala unit dengan beban kredit tinggi mempertanyakan pembagian itu, dan realisasi total semester mencapai sekitar 90% dari target baru.',
          },
          d13OptionD,
        ],
      },
    ],
  },
  {
    id: 'd14',
    chapter: 5,
    title: 'Rapat evaluasi semester dengan kepala kantor regional',
    dimensions: ['learning', 'resilience', 'influence'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['deflected_audit'],
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius memanggil Anda ke rapat evaluasi semester di kantor regional. Di mejanya ada ringkasan tanggapan cabang atas audit dan dokumen persetujuan yang ditemukan auditor di arsip cabang. Ia menyampaikan bahwa tanggapan cabang menyebut unit sebagai penyebab, sementara dokumen itu menunjukkan keputusannya berasal dari cabang, dan kepala unit yang disebut sudah menyampaikan keberatan kepadanya. Ia bertanya apa yang terjadi dan apa yang akan Anda ubah.',
        options: [
          {
            id: 'a',
            label: 'Akui bahwa keputusan dan tanggapan audit itu berasal dari Anda, sampaikan permintaan maaf kepada kepala unit yang disebut, dan paparkan tiga perubahan konkret beserta ukuran keberhasilannya.',
            effects: { regional: -2, compliance: -3, realization: -1, morale: 2 },
            setFlags: [],
            signals: { learning: 2, resilience: 1, influence: 1 },
            style: { bold_steady: 2, people_task: 1 },
            consequence:
              'Pak Antonius meminta ketiga perubahan itu dicatat dalam risalah rapat dan menetapkan tinjauan kemajuan setiap bulan. Ia menyampaikan bahwa pertimbangan penugasan yang lebih besar untuk Anda menunggu hasil tiga bulan pertama.',
          },
          {
            id: 'b',
            label: 'Jelaskan konteks keputusan itu, termasuk tekanan target dari kantor regional, dan tekankan capaian cabang semester ini.',
            effects: { regional: -3, compliance: 2 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Pak Antonius menjawab bahwa target dari kantor regional tidak pernah mensyaratkan pencairan di luar prosedur, dan meminta tanggapan audit direvisi secara tertulis. Rapat berakhir tanpa kesepakatan tindak lanjut.',
          },
          {
            id: 'c',
            label: 'Arahkan pembahasan pada kinerja kepala unit dan staf yang terlibat, lalu usulkan pembinaan atau penggantian mereka.',
            effects: { morale: -5, compliance: 1, regional: -1 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: 1 },
            consequence:
              'Pak Antonius meminta dokumen keputusan yang menunjukkan siapa yang memberi arahan, dan Anda diminta menyerahkannya hari itu juga. Dua kepala unit meminta bertemu langsung dengan HR regional.',
          },
          d14OptionD,
        ],
      },
      {
        requiresFlags: ['softened_report'],
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius memanggil Anda ke rapat evaluasi semester di kantor regional. Di mejanya ada laporan semester cabang, ringkasan audit, dan jawaban klarifikasi yang dikirim ke OJK. Ia menunjukkan bahwa gambaran risiko di dokumen-dokumen itu tidak selaras satu sama lain, dan komite wilayah baru mengetahuinya dari auditor regional. Ia bertanya bagaimana perbedaan itu terjadi dan apa yang akan Anda ubah.',
        options: [
          {
            id: 'a',
            label: 'Akui bahwa penyampaian cabang lebih ringan dari keadaan sebenarnya, jelaskan sebabnya dari sisi Anda, dan paparkan tiga perubahan konkret dalam cara cabang melaporkan.',
            effects: { regional: -2, compliance: -3, realization: -1 },
            setFlags: [],
            signals: { learning: 2, resilience: 1, influence: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Pak Antonius meminta format pelaporan baru itu dipakai mulai bulan depan dan menetapkan pemantauan khusus atas laporan cabang selama dua kuartal. Ia menyampaikan bahwa pertimbangan penugasan yang lebih besar untuk Anda menunggu hasil pemantauan itu.',
          },
          {
            id: 'b',
            label: 'Jelaskan bahwa perbedaan itu muncul dari waktu penyusunan dan format tiap dokumen yang berbeda, dan tekankan capaian cabang semester ini.',
            effects: { regional: -3, compliance: 2 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Pak Antonius meminta ketiga dokumen itu dicocokkan baris demi baris oleh auditor regional dan hasilnya dibawa ke pertemuan berikutnya. Beberapa selisih tidak dapat dijelaskan oleh perbedaan waktu penyusunan.',
          },
          {
            id: 'c',
            label: 'Arahkan pembahasan pada kepala unit yang menyiapkan data dasar, lalu usulkan pembinaan atau penggantian mereka.',
            effects: { morale: -5, compliance: 1, regional: -1 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: 1 },
            consequence:
              'Pak Antonius menanyakan siapa yang menyetujui isi laporan sebelum dikirim, dan Anda diminta menunjukkan jejak persetujuannya. Kepala unit yang disebut meminta bertemu langsung dengan HR regional.',
          },
          d14OptionD,
        ],
      },
      {
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius memanggil Anda ke rapat evaluasi semester di kantor regional. Ia membahas temuan audit internal dan kasus PT Agro Sentosa Makmur dari awal tunggakan sampai keputusan terakhir, dan menunjuk titik-titik di mana cabang bisa bertindak lebih awal. Ia bertanya bagaimana Anda menilai penanganan itu dan apa yang akan Anda ubah.',
        options: [
          {
            id: 'a',
            label: 'Uraikan keputusan Anda yang ikut menyebabkan keterlambatan itu, apa yang akan Anda lakukan secara berbeda, dan tiga perubahan konkret beserta ukuran keberhasilannya.',
            effects: { compliance: -2, realization: -2, morale: -1 },
            setFlags: [],
            signals: { learning: 2, resilience: 1, influence: 1 },
            style: { bold_steady: 2, growth_prudence: -1 },
            consequence:
              'Pak Antonius menyetujui ketiga perubahan itu, tetapi menetapkan laporan kemajuan setiap bulan dan tinjauan tim regional atas seluruh restrukturisasi cabang. Analis kredit dan kepala unit menghabiskan sebagian waktu kerja bulan itu menyiapkan data tambahan.',
          },
          {
            id: 'b',
            label: 'Jelaskan bahwa keputusan itu wajar dengan informasi yang tersedia saat itu, dan tekankan capaian cabang semester ini.',
            effects: { regional: -2, compliance: 2, realization: 1, morale: 2 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { bold_steady: -1, growth_prudence: 1 },
            consequence:
              'Pak Antonius mencatat capaian cabang dan tidak menambah kewajiban pelaporan, tetapi menunjukkan catatan analis kredit yang sudah memberi peringatan sebelum keputusan itu diambil. Ia meminta tinjauan tertulis atas proses pemantauan debitur dalam tiga bulan.',
          },
          {
            id: 'c',
            label: 'Arahkan pembahasan pada analis kredit dan kepala unit yang menangani debitur itu, lalu usulkan pembinaan atau penggantian mereka.',
            effects: { npl: -0.1, compliance: -1, morale: -5, regional: -1 },
            setFlags: [],
            signals: { learning: -2, influence: -1 },
            style: { people_task: -2, bold_steady: 1 },
            consequence:
              'Pak Antonius menyetujui pembinaan dua analis kredit dan pemeriksaan mingguan atas debitur menunggak, lalu menanyakan siapa yang memutuskan di setiap tahap dan menemukan bahwa keputusan restrukturisasi diambil di tingkat Anda. Analis kredit yang disebut meminta bertemu dengan HR regional.',
          },
          d14OptionD,
        ],
      },
    ],
  },
  {
    id: 'd15',
    chapter: 5,
    title: 'Arah cabang semester depan dan penerus kepala unit',
    dimensions: ['strategic', 'people', 'integrity'],
    involvesPerson: true,
    variants: [
      {
        requiresFlags: ['protected_star_lead'],
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius meminta rencana cabang untuk semester depan dalam satu halaman sebelum akhir bulan. Ia juga memberi tahu bahwa kepala unit yang selama ini menjadi andalan kinerja cabang akan dipromosikan memimpin kantor cabang pembantu empat bulan lagi, dan meminta Anda menyiapkan penggantinya. Unit itu kehilangan beberapa staf, termasuk dua penyelia, sejak staf mengadu tentang kepala unitnya, dan belum ada wakil yang siap menggantikan. Staf yang tersisa jarang diberi tanggung jawab keputusan.',
        options: [
          {
            id: 'a',
            label: 'Tunjuk penyelia yang paling siap di antara yang tersisa sebagai penerus sekarang, dampingi setiap minggu selama empat bulan, dan arahkan cabang tumbuh terukur pada segmen yang portofolionya sudah teruji.',
            effects: { morale: 3, realization: -1, compliance: -1, regional: 1 },
            setFlags: [],
            signals: { people: 2, strategic: 1 },
            style: { people_task: 2, bold_steady: 1 },
            consequence:
              'Penyelia yang ditunjuk menerima tugas itu dengan syarat mendapat wewenang persetujuan kredit secara bertahap. Pendampingan mingguan berjalan, tetapi dua staf lain menyampaikan kekecewaan karena tidak dipertimbangkan.',
          },
          {
            id: 'b',
            label: 'Buka seleksi terbuka bagi kandidat dari seluruh cabang dan kantor regional dengan penilaian tertulis dan pendampingan tiga bulan, dan tahan target pertumbuhan unit itu selama masa seleksi.',
            effects: { realization: -2, morale: -1, compliance: -2, regional: -1 },
            setFlags: [],
            signals: { integrity: 1, people: 1, strategic: 1 },
            style: { people_task: 1, growth_prudence: -2, bold_steady: -1 },
            consequence:
              'Enam kandidat mendaftar, dua di antaranya dari luar cabang, dan penyelia dari unit itu ikut seleksi. Target kredit unit itu turun selama tiga bulan dan Pak Antonius menanyakan apakah promosi kepala unit perlu ditunda.',
          },
          {
            id: 'c',
            label: 'Minta kantor regional menempatkan kepala unit berpengalaman dari cabang lain, dan pusatkan waktu Anda pada target pertumbuhan semester depan.',
            effects: { realization: 3, npl: 0.1, morale: -3, regional: 2, dpk: 10 },
            setFlags: [],
            signals: { strategic: 1, people: -1 },
            style: { growth_prudence: 2, people_task: -2, bold_steady: 1 },
            consequence:
              'Kantor regional menempatkan kepala unit dari cabang lain dalam enam minggu, dan realisasi unit itu terjaga pada kuartal pertama. Penyelia yang tersisa mengajukan pindah karena menilai jalur promosi di unit itu tertutup.',
          },
          {
            id: 'd',
            label: 'Dukung promosi kepala unit andalan sesuai jadwal regional tanpa mengangkat pengaduan staf sebelumnya, dan fokuskan rencana semester pada capaian realisasi.',
            effects: { realization: 3, regional: 2, compliance: 4, morale: -4 },
            setFlags: [],
            signals: { integrity: -2, people: -1, strategic: -1 },
            style: { people_task: -2, growth_prudence: 1, bold_steady: -1 },
            consequence:
              'Promosi disetujui tanpa pembahasan lebih jauh dan unit itu mencapai target semester. Menjelang serah terima, dua penyelia yang tersisa mengajukan pindah dan staf yang mengadu sebelumnya mengirim surat kepada HR regional dengan tembusan kepada Pak Antonius.',
          },
        ],
      },
      {
        person: 'Pak Antonius Wibisono, Kepala Kantor Regional',
        situation:
          'Pak Antonius meminta rencana cabang untuk semester depan dalam satu halaman sebelum akhir bulan. Ia juga memberi tahu bahwa kepala unit yang selama ini menjadi andalan kinerja cabang akan dipromosikan memimpin kantor cabang pembantu empat bulan lagi, dan meminta Anda menyiapkan penggantinya. Unit itu relatif stabil sejak pembenahan perilaku kepala unitnya. Wakil kepala unit, Ibu Wulan Pertiwi, punya hasil survei dan hubungan dengan staf yang baik tetapi belum pernah memegang persetujuan kredit sendiri, sedangkan seorang penyelia senior dari unit lain lebih berpengalaman tetapi kurang disukai staf.',
        options: [
          {
            id: 'a',
            label: 'Tunjuk wakil kepala unit sebagai penerus sekarang, dampingi setiap minggu selama empat bulan, dan arahkan cabang tumbuh terukur pada segmen yang portofolionya sudah teruji.',
            effects: { morale: 3, realization: -1, compliance: -1, regional: 1 },
            setFlags: [],
            signals: { people: 2, strategic: 1 },
            style: { people_task: 2, bold_steady: 1 },
            consequence:
              'Ibu Wulan menerima tugas itu dan pendampingan mingguan berjalan. Dalam dua bulan ia menyetujui sendiri empat permohonan kredit, dan satu di antaranya Anda minta ditinjau ulang karena agunannya belum lengkap.',
          },
          {
            id: 'b',
            label: 'Buka seleksi terbuka bagi kandidat dari seluruh cabang dan kantor regional dengan penilaian tertulis dan pendampingan tiga bulan, dan tahan target pertumbuhan unit itu selama masa seleksi.',
            effects: { realization: -2, morale: -1, compliance: -2, regional: -1 },
            setFlags: [],
            signals: { integrity: 1, people: 1, strategic: 1 },
            style: { people_task: 1, growth_prudence: -2, bold_steady: -1 },
            consequence:
              'Lima kandidat mendaftar, termasuk Ibu Wulan dan penyelia senior dari unit lain. Target kredit unit itu tertahan selama tiga bulan, dan Pak Antonius menanyakan apakah seleksi sepanjang itu diperlukan bila sudah ada kandidat internal.',
          },
          {
            id: 'c',
            label: 'Minta kantor regional menempatkan kepala unit berpengalaman dari cabang lain, dan pusatkan waktu Anda pada target pertumbuhan semester depan.',
            effects: { realization: 3, npl: 0.1, morale: -3, regional: 2, dpk: 10 },
            setFlags: [],
            signals: { strategic: 1, people: -1 },
            style: { growth_prudence: 2, people_task: -2, bold_steady: 1 },
            consequence:
              'Kantor regional menempatkan kepala unit dari cabang lain dalam enam minggu, dan realisasi unit itu terjaga pada kuartal pertama. Ibu Wulan mengajukan permohonan pindah ke cabang lain karena menilai jalur promosinya tertutup.',
          },
          {
            id: 'd',
            label: 'Minta Pak Antonius menunda promosi kepala unit andalan sampai akhir tahun, dan tunda penunjukan penerus sampai target semester tercapai.',
            effects: { realization: 3, compliance: 2, morale: -3, regional: -2 },
            setFlags: [],
            signals: { strategic: -2, people: -1 },
            style: { growth_prudence: 1, bold_steady: -2, people_task: -1 },
            consequence:
              'Pak Antonius menyetujui penundaan dua bulan dan menolak penundaan sampai akhir tahun, dengan catatan bahwa promosi itu sudah masuk rencana kantor regional. Kepala unit yang bersangkutan mengetahui permintaan itu dan menanyakan alasannya kepada Anda.',
          },
        ],
      },
    ],
  },
]
