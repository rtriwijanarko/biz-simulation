import type { DimensionId, StyleAxisId } from '../engine/types'

// Leadership archetypes shown in the report. The figures are an analogy to a style the public associates with
// them, not a claim about the participant or a verified fact about the person; the owner reviews the list.
// Style targets are in -1..1: growth_prudence (+ growth), people_task (+ people), bold_steady (+ bold).

export interface Archetype {
  id: string
  name: string
  domain: 'politik' | 'ekonomi' | 'bisnis' | 'sosial'
  figure: string
  styleNote: string
  strengths: string[]
  blindSpots: string[]
  profile: {
    dimensions: Partial<Record<DimensionId, number>>
    style: Partial<Record<StyleAxisId, number>>
  }
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'reconciler',
    name: 'Reconciler',
    domain: 'politik',
    figure: 'Nelson Mandela',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Nelson Mandela: mempertemukan pihak yang berseberangan dan bersabar demi hasil jangka panjang.',
    strengths: [
      'Mampu meredakan konflik antarpihak tanpa membuat salah satu pihak merasa dikalahkan.',
      'Menjaga kepercayaan tim dan mitra dalam waktu panjang.',
      'Berani mengambil langkah damai ketika emosi di sekitar sedang tinggi.',
    ],
    blindSpots: [
      'Bisa menunda keputusan keras yang sebenarnya perlu diambil cepat.',
      'Berisiko dianggap terlalu akomodatif oleh pihak yang menginginkan ketegasan.',
    ],
    profile: {
      dimensions: { influence: 1, integrity: 1, people: 1 },
      style: { growth_prudence: -0.2, people_task: 0.6, bold_steady: -0.4 },
    },
  },
  {
    id: 'institution-builder',
    name: 'Institution Builder',
    domain: 'politik',
    figure: 'Lee Kuan Yew',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Lee Kuan Yew: membangun sistem yang disiplin dan menilai keberhasilan dari hasil yang terukur.',
    strengths: [
      'Mengubah praktik yang bergantung pada orang menjadi prosedur yang bisa diulang.',
      'Konsisten menegakkan standar dan tata kelola.',
      'Berorientasi pada hasil yang bisa diukur.',
    ],
    blindSpots: [
      'Bisa terlalu menekankan kontrol sehingga ruang inisiatif tim menyempit.',
      'Kurang memberi waktu bagi masukan yang belum berbentuk data.',
    ],
    profile: {
      dimensions: { strategic: 1, integrity: 1, business: 1 },
      style: { growth_prudence: -0.3, people_task: -0.7, bold_steady: -0.2 },
    },
  },
  {
    id: 'steady-crisis-steward',
    name: 'Steady Crisis Steward',
    domain: 'politik',
    figure: 'Angela Merkel',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Angela Merkel: menganalisis dengan tenang, memilih langkah terukur, dan menjaga stabilitas saat krisis.',
    strengths: [
      'Tetap tenang dan analitis ketika informasi belum lengkap.',
      'Menghindari keputusan yang digerakkan oleh tekanan sesaat.',
      'Menjaga risiko tetap terkendali selama situasi bergerak.',
    ],
    blindSpots: [
      'Bisa terlambat bergerak ketika peluang menuntut kecepatan.',
      'Tim mungkin sulit membaca arah bila alasan di balik sikap hati-hati tidak disampaikan.',
    ],
    profile: {
      dimensions: { resilience: 1, strategic: 1, business: 1 },
      style: { growth_prudence: -0.5, people_task: -0.2, bold_steady: -0.8 },
    },
  },
  {
    id: 'empathic-connector',
    name: 'Empathic Connector',
    domain: 'politik',
    figure: 'Jacinda Ardern',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Jacinda Ardern: mengutamakan empati dan komunikasi yang jelas ketika situasi sedang berat.',
    strengths: [
      'Membuat orang merasa didengar sambil tetap menyampaikan arah yang jelas.',
      'Berkomunikasi dengan hangat di saat tekanan tinggi.',
      'Membangun kedekatan yang membuat tim mau bertahan dalam masa sulit.',
    ],
    blindSpots: [
      'Bisa menunda keputusan yang tidak populer demi menjaga suasana.',
      'Beban emosional tim bisa ikut terbawa ke diri sendiri.',
    ],
    profile: {
      dimensions: { people: 1, influence: 1, resilience: 1 },
      style: { growth_prudence: 0.1, people_task: 0.9, bold_steady: 0.2 },
    },
  },
  {
    id: 'principled-statesman',
    name: 'Principled Statesman',
    domain: 'politik',
    figure: 'Mohammad Hatta',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Mohammad Hatta: memegang prinsip dan kejujuran, serta terus belajar dengan sederhana.',
    strengths: [
      'Konsisten antara ucapan, aturan, dan tindakan.',
      'Membuka diri pada pengetahuan baru dan masukan.',
      'Dipercaya karena tidak mengubah prinsip mengikuti keadaan.',
    ],
    blindSpots: [
      'Bisa kurang lentur ketika kompromi praktis diperlukan.',
      'Cenderung menghindari langkah ekspansif yang berisiko meski menjanjikan.',
    ],
    profile: {
      dimensions: { integrity: 1, learning: 1, influence: 1 },
      style: { growth_prudence: -0.6, people_task: 0.2, bold_steady: 0 },
    },
  },
  {
    id: 'independent-guardian',
    name: 'Independent Guardian',
    domain: 'ekonomi',
    figure: 'Paul Volcker',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Paul Volcker: berani mengambil keputusan tidak populer demi stabilitas jangka panjang.',
    strengths: [
      'Teguh pada keputusan yang benar meski ditentang banyak pihak.',
      'Memprioritaskan stabilitas dan kualitas portofolio di atas pencapaian jangka pendek.',
      'Tahan terhadap tekanan untuk melonggarkan standar.',
    ],
    blindSpots: [
      'Bisa mengorbankan hubungan dan moral tim demi disiplin.',
      'Kurang memberi ruang bagi kompromi yang sebenarnya aman.',
    ],
    profile: {
      dimensions: { integrity: 1, business: 1, resilience: 1 },
      style: { growth_prudence: -0.9, people_task: -0.5, bold_steady: 0.6 },
    },
  },
  {
    id: 'governance-reformer',
    name: 'Governance Reformer',
    domain: 'ekonomi',
    figure: 'Sri Mulyani',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Sri Mulyani: menegakkan disiplin anggaran dan tata kelola sambil menjelaskan alasannya ke publik.',
    strengths: [
      'Menata proses dan akuntabilitas sehingga keputusan dapat dipertanggungjawabkan.',
      'Menjelaskan kebijakan sulit dengan alasan yang runtut.',
      'Menjaga integritas ketika ada tekanan untuk memangkas jalan.',
    ],
    blindSpots: [
      'Bisa terlalu terikat pada prosedur ketika situasi menuntut kelonggaran terukur.',
      'Perhatian pada tim bisa tersisih oleh agenda pembenahan.',
    ],
    profile: {
      dimensions: { integrity: 1, strategic: 1, influence: 1 },
      style: { growth_prudence: -0.4, people_task: -0.3, bold_steady: 0.3 },
    },
  },
  {
    id: 'inclusive-banker',
    name: 'Inclusive Banker',
    domain: 'ekonomi',
    figure: 'Muhammad Yunus',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Muhammad Yunus: percaya pada nasabah kecil dan berani mencoba cara baru agar layanan keuangan menjangkau mereka.',
    strengths: [
      'Melihat potensi pada pihak yang sering dianggap berisiko tinggi.',
      'Membuat model layanan baru tanpa meninggalkan kedekatan dengan nasabah.',
      'Terus belajar dari lapangan.',
    ],
    blindSpots: [
      'Niat baik bisa melonggarkan standar risiko bila tidak dijaga dengan batas yang jelas.',
      'Berisiko menanggung terlalu banyak inisiatif sekaligus.',
    ],
    profile: {
      dimensions: { people: 1, strategic: 1, learning: 1 },
      style: { growth_prudence: 0.4, people_task: 0.7, bold_steady: 0.5 },
    },
  },
  {
    id: 'operational-reformer',
    name: 'Operational Reformer',
    domain: 'ekonomi',
    figure: 'Ignasius Jonan',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Ignasius Jonan: membenahi layanan dan disiplin operasional secara tegas dan cepat.',
    strengths: [
      'Cepat melihat titik lemah operasional dan membenahinya.',
      'Berani menegur dan menegakkan standar layanan.',
      'Tenang menghadapi resistensi terhadap perubahan.',
    ],
    blindSpots: [
      'Perubahan cepat bisa membuat sebagian tim merasa kewalahan.',
      'Fokus pada hasil kerja bisa menutupi kebutuhan pembinaan orang.',
    ],
    profile: {
      dimensions: { business: 1, resilience: 1, people: 1 },
      style: { growth_prudence: 0.2, people_task: -0.6, bold_steady: 0.7 },
    },
  },
  {
    id: 'ambidextrous-leader',
    name: 'Ambidextrous Leader',
    domain: 'bisnis',
    figure: 'Satya Nadella',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Satya Nadella: menjaga bisnis inti tetap sehat sambil berani mencoba hal baru dan terus belajar.',
    strengths: [
      'Menyeimbangkan pertumbuhan dan kehati-hatian tanpa condong ekstrem ke salah satunya.',
      'Berani bereksperimen dengan batas risiko yang jelas.',
      'Mau mengoreksi arah ketika bukti baru muncul.',
    ],
    blindSpots: [
      'Bisa terlihat ragu bila tim menginginkan satu arah yang tegas.',
      'Membagi perhatian antara yang lama dan yang baru dapat menguras energi.',
    ],
    profile: {
      dimensions: { business: 1, strategic: 1, learning: 1 },
      style: { growth_prudence: 0, people_task: 0, bold_steady: 0 },
    },
  },
  {
    id: 'growth-catalyst',
    name: 'Growth Catalyst',
    domain: 'bisnis',
    figure: 'Jeff Bezos',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Jeff Bezos: mengejar peluang dan skala dengan keberanian mengambil risiko terukur.',
    strengths: [
      'Cepat melihat peluang dan menggerakkan sumber daya ke arahnya.',
      'Nyaman mengambil keputusan besar dengan informasi belum lengkap.',
      'Menularkan ambisi kepada tim dan mitra.',
    ],
    blindSpots: [
      'Kualitas risiko bisa tertinggal dari laju ekspansi.',
      'Tim yang lebih berhati-hati mungkin merasa suaranya tidak didengar.',
    ],
    profile: {
      dimensions: { business: 1, influence: 1, resilience: 1 },
      style: { growth_prudence: 0.9, people_task: -0.6, bold_steady: 0.8 },
    },
  },
  {
    id: 'value-guardian',
    name: 'Value Guardian',
    domain: 'bisnis',
    figure: 'Warren Buffett',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Warren Buffett: disiplin pada risiko, berpikir jangka panjang, dan tidak mudah tergoda tren.',
    strengths: [
      'Menjaga kualitas portofolio dan arus kas sebagai prioritas.',
      'Sabar menunggu peluang yang benar-benar sesuai.',
      'Tidak terbawa tekanan untuk ikut-ikutan pesaing.',
    ],
    blindSpots: [
      'Bisa melewatkan peluang yang menuntut langkah lebih cepat.',
      'Kehati-hatian yang kuat bisa terbaca tim sebagai kurang percaya diri pada inisiatif baru.',
    ],
    profile: {
      dimensions: { business: 1, integrity: 1, learning: 1 },
      style: { growth_prudence: -0.9, people_task: -0.3, bold_steady: -0.7 },
    },
  },
  {
    id: 'alignment-turnaround',
    name: 'Alignment Turnaround',
    domain: 'bisnis',
    figure: 'Alan Mulally',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Alan Mulally: membenahi organisasi lewat keterbukaan data dan kolaborasi lintas fungsi.',
    strengths: [
      'Membuat masalah terlihat sejak dini tanpa mencari kambing hitam.',
      'Menyelaraskan fungsi yang biasanya bekerja sendiri-sendiri.',
      'Menjaga ritme evaluasi yang teratur.',
    ],
    blindSpots: [
      'Keterbukaan yang tinggi menuntut budaya aman; tanpa itu bisa membuat orang menutup diri.',
      'Rapat dan koordinasi bisa memakan waktu bila tidak dibatasi.',
    ],
    profile: {
      dimensions: { people: 1, influence: 1, strategic: 1 },
      style: { growth_prudence: 0, people_task: 0.3, bold_steady: 0.1 },
    },
  },
  {
    id: 'purpose-driven-people-builder',
    name: 'Purpose-Driven People Builder',
    domain: 'bisnis',
    figure: 'Indra Nooyi',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Indra Nooyi: menggerakkan tim lewat tujuan bersama dan pembinaan orang secara sungguh-sungguh.',
    strengths: [
      'Mengaitkan pekerjaan sehari-hari dengan tujuan yang lebih besar.',
      'Menyiapkan penerus dan mengembangkan potensi orang.',
      'Menjaga integritas dalam urusan yang menyangkut tim.',
    ],
    blindSpots: [
      'Bisa lambat menindak kinerja yang rendah bila terlalu percaya pada pembinaan.',
      'Target jangka pendek mungkin tersisih oleh agenda jangka panjang.',
    ],
    profile: {
      dimensions: { people: 1, integrity: 1, learning: 1 },
      style: { growth_prudence: 0.1, people_task: 0.8, bold_steady: -0.2 },
    },
  },
  {
    id: 'visionary-builder',
    name: 'Visionary Builder',
    domain: 'bisnis',
    figure: 'B.J. Habibie',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari B.J. Habibie: memegang visi besar jangka panjang dan berani mengejarnya sambil terus belajar.',
    strengths: [
      'Melihat arah jauh ke depan dan mengajak orang menujunya.',
      'Cepat mempelajari bidang baru yang dibutuhkan visi.',
      'Teguh mengejar tujuan di tengah hambatan.',
    ],
    blindSpots: [
      'Detail pelaksanaan harian bisa kurang mendapat perhatian.',
      'Visi yang besar bisa mendahului kesiapan tim dan sumber daya.',
    ],
    profile: {
      dimensions: { strategic: 1, learning: 1, resilience: 1 },
      style: { growth_prudence: 0.8, people_task: -0.2, bold_steady: 0.9 },
    },
  },
  {
    id: 'moral-compass',
    name: 'Moral Compass',
    domain: 'sosial',
    figure: 'Mahatma Gandhi',
    styleNote:
      'Gaya Anda dekat dengan pendekatan yang dikenal publik dari Mahatma Gandhi: memimpin lewat keteladanan, keteguhan nilai, dan keberanian moral.',
    strengths: [
      'Menjadi acuan nilai bagi orang di sekitar lewat tindakan sendiri.',
      'Tetap teguh ketika menegakkan nilai membawa risiko pribadi.',
      'Memengaruhi tanpa mengandalkan wewenang jabatan.',
    ],
    blindSpots: [
      'Standar nilai yang tinggi dapat terasa kaku bagi orang yang belum siap.',
      'Bisa kurang memperhatikan perhitungan finansial yang perlu menopang tujuan.',
    ],
    profile: {
      dimensions: { integrity: 1, resilience: 1, influence: 1 },
      style: { growth_prudence: -0.4, people_task: 0.5, bold_steady: 0.5 },
    },
  },
]
