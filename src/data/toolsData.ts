import { ToolCategory, PaymentConfig, RolesConfig, UserRole, CustomPricesConfig } from '../types';

export const defaultPaymentConfig: PaymentConfig = {
  merchantName: 'ZAIN.NET Academic Store',
  midtransClientKey: 'SB-Mid-client-zainnet-academic-prod',
  isProduction: false,
  allAccessPriceRp: 35000,
};

export const defaultCustomPrices: CustomPricesConfig = {
  itemPrices: {
    'art-1': 8000,
    'art-2': 8000,
    'art-3': 10000,
    'split-1': 5000,
    'split-2': 5000,
    'split-3': 5000,
    'num-1': 10000,
    'mak-1': 15000,
    'plag-1': 15000,
  },
  categoryPrices: {
    1: 15000,
    2: 10000,
    3: 10000,
    4: 15000,
    5: 15000,
  },
  allAccessPriceRp: 35000,
  resellerDiscountPercentage: 50,
  updatedAt: Date.now()
};

/**
 * Merges base categories with dynamic custom prices
 */
export function applyCustomPricesToCategories(baseCategories: ToolCategory[], customPrices: CustomPricesConfig): ToolCategory[] {
  return baseCategories.map((category) => {
    const pkgPrice = customPrices.categoryPrices[category.id] !== undefined
      ? customPrices.categoryPrices[category.id]
      : category.packagePriceRp;

    const updatedTools = category.tools.map((tool) => {
      const toolPrice = customPrices.itemPrices[tool.id] !== undefined
        ? customPrices.itemPrices[tool.id]
        : tool.priceRp;
      return {
        ...tool,
        priceRp: toolPrice
      };
    });

    return {
      ...category,
      packagePriceRp: pkgPrice,
      tools: updatedTools
    };
  });
}

export const defaultRolesConfig: RolesConfig = {
  adminEmails: [
    'fastprint2026@gmail.com',
    'hanafisumenep@gmail.com'
  ],
  resellerEmails: [
    'teknologiindo123@gmail.com',
    'reseller@zain.net',
    'partner@zain.net'
  ],
  resellerDiscountPercentage: 50,
  updatedAt: Date.now()
};

/**
 * Resolves the user's role from their email address and roles configuration
 */
export function resolveUserRole(email: string | null | undefined, config: RolesConfig): UserRole {
  if (!email) return 'public';
  const normalized = email.trim().toLowerCase();
  
  const isAdmin = (config.adminEmails || []).some(e => e.trim().toLowerCase() === normalized);
  if (isAdmin) return 'admin';

  const isReseller = (config.resellerEmails || []).some(e => e.trim().toLowerCase() === normalized);
  if (isReseller) return 'reseller';

  return 'public';
}

/**
 * Calculates effective price based on base price and user role
 */
export function calculateEffectivePrice(basePriceRp: number, role?: UserRole | string, discountPercentage = 50): number {
  if (role === 'admin') {
    return 0; // All free for Admin
  }
  if (role === 'reseller') {
    const factor = (100 - Math.min(100, Math.max(0, discountPercentage))) / 100;
    return Math.round(basePriceRp * factor);
  }
  return basePriceRp; // Normal regular price for Public
}

export const categoriesData: ToolCategory[] = [
  {
    id: 1,
    number: 1,
    title: "Pembuatan Artikel Skripsi & Artikel Ilmiah",
    subtitle: "3 modul generator naskah, skripsi & jurnal publikasi (Mayar Payment)",
    description: "Sistem otomasi cerdas penyusunan artikel skripsi & naskah karya ilmiah terstruktur untuk jurnal, prosiding, dan publikasi perguruan tinggi.",
    iconName: "FileText",
    packagePriceRp: 15000,
    mayarPaymentUrl: "https://zainnet.myr.id/pl/pembuatan-artikel-skripsi?iframe=true",
    tools: [
      {
        id: "art-1",
        categoryId: 1,
        number: 1,
        title: "Generator Artikel 1",
        domain: "artikel-1.zain.net",
        url: "https://buat-artikel-2.ai.studio/",
        description: "Modul generator struktur naskah artikel ilmiah otomatis standar akreditasi SINTA.",
        badge: "Generator Cerdas",
        priceRp: 8000,
        mayarPaymentUrl: "https://zainnet.myr.id/pl/pembuatan-artikel-skripsi?iframe=true",
      },
      {
        id: "art-2",
        categoryId: 1,
        number: 2,
        title: "Generator Artikel 2",
        domain: "artikel-2.zain.net",
        url: "https://buat-artikel-1.ai.studio/",
        description: "Penyusun artikel akademik, metodologi penelitian, dan tinjauan literatur komprehensif.",
        badge: "Akademik Pro",
        priceRp: 8000,
        mayarPaymentUrl: "https://zainnet.myr.id/pl/pembuatan-artikel-skripsi?iframe=true",
      },
      {
        id: "art-3",
        categoryId: 1,
        number: 3,
        title: "ZAIN Artikel Studio",
        domain: "studio-artikel.zain.net",
        url: "https://zainartikel.ai.studio/",
        description: "Ruang kerja terintegrasi penulisan naskah publikasi ZAIN dengan format baku.",
        badge: "Edisi Khusus",
        priceRp: 10000,
        mayarPaymentUrl: "https://zainnet.myr.id/pl/pembuatan-artikel-skripsi?iframe=true",
      }
    ]
  },
  {
    id: 2,
    number: 2,
    title: "Pemisah Berkas PDF",
    subtitle: "3 modul pemotong dan ekstraktor bab skripsi",
    description: "Alat praktis untuk memotong, mengekstrak bab skripsi, dan mengonversi berkas PDF menjadi komponen naskah mandiri.",
    iconName: "Scissors",
    packagePriceRp: 10000,
    tools: [
      {
        id: "split-1",
        categoryId: 2,
        number: 1,
        title: "Pemisah PDF Skripsi 1",
        domain: "pemisah-1.zain.net",
        url: "https://pemisah-pdf-skripsi-generator-artikel-ilmiah-1.ai.studio/",
        description: "Pemisah halaman PDF bab skripsi & konverter naskah bab 1 hingga penutup.",
        badge: "Pemisah Bab",
        priceRp: 5000,
      },
      {
        id: "split-2",
        categoryId: 2,
        number: 2,
        title: "Pemisah PDF Skripsi 2",
        domain: "pemisah-2.zain.net",
        url: "https://pemisah-pdf-skripsi-generator-artikel-ilmiah-2.ai.studio/",
        description: "Pemisah berkas PDF skripsi berkecepatan tinggi dengan optimasi berkas besar.",
        badge: "Ekstraktor Cepat",
        priceRp: 5000,
      },
      {
        id: "split-3",
        categoryId: 2,
        number: 3,
        title: "Pemisah PDF Skripsi 3",
        domain: "pemisah-3.zain.net",
        url: "https://remix-copy-of-pemisah-pdf-skripsi-generator-artik-4996.ai.studio/",
        description: "Pemisah berkas skripsi & generator naskah ilmiah multi-format dokumen.",
        badge: "Multi-Format",
        priceRp: 5000,
      }
    ]
  },
  {
    id: 3,
    number: 3,
    title: "Edit Penomoran Halaman",
    subtitle: "Sistem penomoran skripsi baku & editor PDF akademik",
    description: "Format otomatis nomor halaman angka romawi (i, ii, iii) untuk bagian awal dan angka arab (1, 2, 3) untuk bab isi sesuai standar tesis.",
    iconName: "Hash",
    packagePriceRp: 10000,
    tools: [
      {
        id: "num-1",
        categoryId: 3,
        number: 1,
        title: "Sistem Penomoran Skripsi Baku",
        domain: "penomoran.zain.net",
        url: "https://sistem-penomoran-skripsi-baku-editor-pdf-akademik.ai.studio/",
        description: "Editor PDF akademik & sistem penataan nomor halaman baku naskah skripsi.",
        badge: "Standar Baku",
        priceRp: 10000,
      }
    ]
  },
  {
    id: 4,
    number: 4,
    title: "Penyusunan Makalah",
    subtitle: "Modul penyusun makalah & laporan ilmiah mahasiswa",
    description: "Penyusun otomatis struktur makalah perkuliahan lengkap: cover, latar belakang, rumusan masalah, pembahasan, dan daftar pustaka.",
    iconName: "BookOpen",
    packagePriceRp: 15000,
    tools: [
      {
        id: "mak-1",
        categoryId: 4,
        number: 1,
        title: "Penyusun Makalah Akademik",
        domain: "makalah.zain.net",
        url: "https://penyusun-makalah-uin-madura.ai.studio/",
        description: "Template dan penyusun makalah otomatis sesuai pedoman penulisan karya ilmiah universitas.",
        badge: "Format Kampus",
        priceRp: 15000,
      }
    ]
  },
  {
    id: 5,
    number: 5,
    title: "Penurunan Plagiasi",
    subtitle: "Modul parafrase skripsi & revisi dokumen anti-plagiasi",
    description: "Sistem cerdas parafrase naskah karya ilmiah, perombakan kalimat terstruktur, dan penurunan skor similaritas Turnitin secara komprehensif pada dokumen DOCX.",
    iconName: "ShieldCheck",
    packagePriceRp: 15000,
    tools: [
      {
        id: "plag-1",
        categoryId: 5,
        number: 1,
        title: "Penurunan Plagiasi & Parafrase Skripsi",
        domain: "plagiasi.zain.net",
        url: "https://aplikasi-parafrase-skripsi-revisi-plagiasi-docx-921936667702.asia-southeast1.run.app/",
        description: "Aplikasi otomatis parafrase naskah skripsi & revisi dokumen DOCX untuk menurunkan indeks similaritas plagiasi.",
        badge: "Anti-Plagiasi",
        priceRp: 15000,
      }
    ]
  }
];
