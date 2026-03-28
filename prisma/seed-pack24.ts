import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PRODUCTS = [
  // ── Karton qutilar ──
  { name: 'Karton quti 300×200×150 mm', sku: 'P24-001', price: 4500, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured: true },
  { name: 'To\'rt qanotli gofroqorti', sku: 'P24-002', price: 8630, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'O\'z-o\'zidan yig\'iladigan qutilar', sku: 'P24-003', price: 3850, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'Pochta qutilar', sku: 'P24-004', price: 15550, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'Arxiv qutilar', sku: 'P24-005', price: 91850, category: 'arxiv-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'Sovg\'a uchun karton qutilar', sku: 'P24-006', price: 16800, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'Pizza qutilar', sku: 'P24-007', price: 21600, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'EKO qutilar (mahsulot, suvenir)', sku: 'P24-008', price: 53900, category: 'karton-qutilar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name: 'Gofroqoroblar', sku: 'P24-009', price: 9200, category: 'gofrokoroblar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured: true },

  // ── Kuryer paketlari ──
  { name: 'Kuryer paketlari oq (Standard)', sku: 'P24-010', price: 790, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Kuryer paketlari oq (Ekonom)', sku: 'P24-011', price: 970, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Kuryer paketlari oq cho\'ntakli', sku: 'P24-012', price: 1950, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Kuryer paketlari qora', sku: 'P24-013', price: 830, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Kuryer paketlari shaffof', sku: 'P24-014', price: 1070, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Shtrix kodli kuryer paketlari', sku: 'P24-015', price: 12350, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Seyf paketlari', sku: 'P24-016', price: 10500, category: 'kuryer-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Rossiya pochta paketlari ──
  { name: 'Rossiya pochta paketlari', sku: 'P24-017', price: 4110, category: 'rossiya-pochta-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },

  // ── BOPP paketlar ──
  { name: 'BOPP paket klapanli', sku: 'P24-018', price: 970, category: 'bopp-paketlar', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured: true },
  { name: 'BOPP paket kiyim uchun', sku: 'P24-019', price: 1310, category: 'bopp-paketlar', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name: 'BOPP paket yopishqoq klapanli', sku: 'P24-020', price: 450, category: 'bopp-paketlar', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name: 'BOPP paket klapansiz', sku: 'P24-021', price: 510, category: 'bopp-paketlar', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name: 'BOPP paket evropo\'ya klapanli', sku: 'P24-022', price: 850, category: 'bopp-paketlar', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },

  // ── Zip-Lock paketlar ──
  { name: 'Zip-Lock paket standart (30mkm)', sku: 'P24-023', price: 150, category: 'zip-lock-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Zip-Lock paket o\'ta mustahkam (80mkm)', sku: 'P24-024', price: 530, category: 'zip-lock-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Zip-Lock paket ultra mustahkam (100mkm)', sku: 'P24-025', price: 590, category: 'zip-lock-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Zip-Lock shaffof, evropo\'ya (60mkm)', sku: 'P24-026', price: 2700, category: 'zip-lock-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── PVD paketlar (Marketpleys) ──
  { name: 'PVD paket yopishqoq klapanli', sku: 'P24-027', price: 1410, category: 'pvd-paketlar-marketpleys', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'PVD paket klapansiz (standart)', sku: 'P24-028', price: 890, category: 'pvd-paketlar-marketpleys', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'PVD paket klapansiz (ekonom)', sku: 'P24-029', price: 500, category: 'pvd-paketlar-marketpleys', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Slayder paketlar ──
  { name: 'Slayder paket shaffof 60mkm', sku: 'P24-030', price: 1450, category: 'slayder-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Slayder paket mat 50mkm', sku: 'P24-031', price: 1570, category: 'slayder-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Slayder paket mat 70mkm', sku: 'P24-032', price: 1100, category: 'slayder-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Qadoqlash plyonkasi (rukav) ──
  { name: 'PVD rukav shaffof, zich', sku: 'P24-033', price: 163500, category: 'qadoqlash-plyonkasi', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured: true },
  { name: 'PVD rukav shaffof (ekonom)', sku: 'P24-034', price: 284000, category: 'qadoqlash-plyonkasi', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name: 'PVD rukav oq', sku: 'P24-035', price: 168000, category: 'qadoqlash-plyonkasi', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name: 'PVD rukav qora', sku: 'P24-036', price: 168000, category: 'qadoqlash-plyonkasi', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },

  // ── Paket payvandlagichlar ──
  { name: 'Paket payvandlagich', sku: 'P24-037', price: 446000, category: 'paket-payvandlagichlar', image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg', isFeatured: true },

  // ── Kraft paketlar ──
  { name: 'Kraft paket buralgan tutqichli', sku: 'P24-038', price: 9790, category: 'kraft-paketlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg', isFeatured: true },
  { name: 'Kraft paket yassi tutqichli', sku: 'P24-039', price: 10400, category: 'kraft-paketlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Kraft paket sovg\'alik', sku: 'P24-040', price: 23100, category: 'kraft-paketlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Kraft paket to\'g\'ri burchakli tubli', sku: 'P24-041', price: 2250, category: 'kraft-paketlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Kraft paket V-tubli', sku: 'P24-042', price: 1710, category: 'kraft-paketlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },

  // ── Doy-Pak ──
  { name: 'Kraft doy-pak paket', sku: 'P24-043', price: 4170, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg', isFeatured: true },
  { name: 'Kraft doy-pak oynali (silliq qog\'oz)', sku: 'P24-044', price: 5600, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Kraft doy-pak shaffof oynali', sku: 'P24-045', price: 4550, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Oval oynali doy-pak', sku: 'P24-046', price: 4550, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Doy-pak shaffof tomoni bilan', sku: 'P24-047', price: 3600, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Shaffof doy-pak', sku: 'P24-048', price: 4070, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Oq metallashgan doy-pak', sku: 'P24-049', price: 7290, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Qora metallashgan doy-pak', sku: 'P24-050', price: 7290, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Oltin metallashgan doy-pak', sku: 'P24-051', price: 16690, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Qizil metallashgan doy-pak', sku: 'P24-052', price: 8830, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Yashil metallashgan doy-pak', sku: 'P24-053', price: 5250, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Folga doy-pak', sku: 'P24-054', price: 7830, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Metallashgan doy-pak', sku: 'P24-055', price: 5910, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Markaziy tikuvli paket', sku: 'P24-056', price: 5870, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Sakkiz tikuvli tekis tubli doy-pak', sku: 'P24-057', price: 28900, category: 'doy-pak', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },

  // ── Polietilen paketlar ──
  { name: 'Polietilen futbolka paketlar', sku: 'P24-058', price: 910, category: 'polietilen-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Teshikli tutqichli paketlar', sku: 'P24-059', price: 3810, category: 'polietilen-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Halqa tutqichli paketlar', sku: 'P24-060', price: 13750, category: 'polietilen-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Fasovka paketlar', sku: 'P24-061', price: 4645, category: 'polietilen-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Chiqindi paketlar va xaltalar', sku: 'P24-062', price: 2730, category: 'chiqindi-paketlari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },

  // ── Pufakchali plyonka ──
  { name: 'Havo-pufakli plyonka 0.6m×50m', sku: 'P24-063', price: 6410, category: 'pufakchali-plyonka', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg', isFeatured: true },

  // ── Havo yostig'i lentasi ──
  { name: 'Havo yostig\'i lentasi', sku: 'P24-064', price: 574500, category: 'havo-yostigʼi-lentasi', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg', isFeatured: true },

  // ── Havo yostiqli paketlar ──
  { name: 'Havo-pufakli plyonkadan paket', sku: 'P24-065', price: 3310, category: 'havo-yostiqli-paketlar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg', isFeatured: true },
  { name: 'Havo-pufakli paket yopishqoq klapanli', sku: 'P24-066', price: 4130, category: 'havo-yostiqli-paketlar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg' },
  { name: 'Mail Lite havo yostiqli paket', sku: 'P24-067', price: 9170, category: 'havo-yostiqli-paketlar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg' },
  { name: 'Qora namlikka chidamli havo paket', sku: 'P24-068', price: 14050, category: 'havo-yostiqli-paketlar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg' },
  { name: 'Folga havo-pufakli paket', sku: 'P24-069', price: 8610, category: 'havo-yostiqli-paketlar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg' },

  // ── Qadoqlash qog'ozi ──
  { name: 'Kraft qog\'oz 70gr/m² 1m×50m', sku: 'P24-070', price: 63800, category: 'qadoqlash-qogozi', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg', isFeatured: true },
  { name: 'O\'rash qog\'ozi', sku: 'P24-071', price: 31000, category: 'qadoqlash-qogozi', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg' },
  { name: 'To\'r kraft qog\'oz', sku: 'P24-072', price: 91800, category: 'qadoqlash-qogozi', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg' },
  { name: 'Tissue qog\'oz', sku: 'P24-073', price: 76200, category: 'qadoqlash-qogozi', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg' },
  { name: 'O\'z-o\'ziga yopishuvchi etiketkalar', sku: 'P24-074', price: 121500, category: 'termoetiketkalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured: true },

  // ── Qog'oz konvertlar ──
  { name: 'Karton konvert', sku: 'P24-075', price: 16700, category: 'qogoz-konvertlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg', isFeatured: true },
  { name: 'Kraft konvert', sku: 'P24-076', price: 2990, category: 'qogoz-konvertlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Pochta konvert', sku: 'P24-077', price: 2050, category: 'qogoz-konvertlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Rangli konvert', sku: 'P24-078', price: 7500, category: 'qogoz-konvertlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },
  { name: 'Vizitka konverti', sku: 'P24-079', price: 6210, category: 'qogoz-konvertlar', image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg' },

  // ── Termoetiketkalar ──
  { name: 'Termo etiketka 58×40mm ECO — 1000 dona', sku: 'P24-080', price: 9480, category: 'termoetiketkalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },

  // ── Skotch va Yelim lenta ──
  { name: 'Skotch OPP shaffof 48mm×66m (36 rulon)', sku: 'P24-081', price: 2790, category: 'skotch-yelim-lenta', image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg', isFeatured: true },

  // ── Streich-plyonka ──
  { name: 'Streich (stretch) plyonka 500mm×200m', sku: 'P24-082', price: 20700, category: 'streich-plyonka', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured: true },

  // ── To'ldiruvchilar ──
  { name: 'To\'ldiruvchilar (napolnitel)', sku: 'P24-083', price: 19300, category: 'toldiruvchilar', image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg', isFeatured: true },

  // ── Karton tubuslar ──
  { name: 'Karton tubus', sku: 'P24-084', price: 5905, category: 'karton-tubuslar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured: true },

  // ── Gofrokarton ──
  { name: 'Gofrokarton varaq', sku: 'P24-085', price: 767, category: 'gofrokarton', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured: true },
  { name: 'Gofrokarton rulon', sku: 'P24-086', price: 120500, category: 'gofrokarton', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },

  // ── Himoya profili ──
  { name: 'Himoya profili (burchak)', sku: 'P24-087', price: 289, category: 'himoya-profili', image: 'https://pack24.ru/upload/iblock/e4b/corner.jpg', isFeatured: true },

  // ── Ko'pikli polietilen ──
  { name: 'Ko\'pikli polietilen 3mm×1m×50m', sku: 'P24-088', price: 45800, category: 'kopikli-polietilen', image: 'https://pack24.ru/upload/iblock/aa5/foam.jpg', isFeatured: true },

  // ── Ko'pikli PE paketlar ──
  { name: 'Ko\'pikli PE paket', sku: 'P24-089', price: 4310, category: 'kopikli-pe-paketlar', image: 'https://pack24.ru/upload/iblock/aa5/foam.jpg', isFeatured: true },

  // ── Yelimli cho'ntaklar ──
  { name: 'Yelimli cho\'ntak (A4)', sku: 'P24-090', price: 2610, category: 'yelimli-chontaklar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },

  // ── Do'konlar uchun mollar ──
  { name: 'Kassa lentasi', sku: 'P24-091', price: 2475, category: 'dokonlar-uchun-mollar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured: true },
  { name: 'Ribbonlar', sku: 'P24-092', price: 44000, category: 'dokonlar-uchun-mollar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },

  // ── Vakuum paketlar ──
  { name: 'Vakuum paket PET/PE', sku: 'P24-093', price: 2250, category: 'vakuum-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Vakuum paket PA/PE', sku: 'P24-094', price: 2810, category: 'vakuum-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Laminatsiyali substrat', sku: 'P24-095', price: 3130, category: 'vakuum-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'Vakuum upkovshchik', sku: 'P24-096', price: 1245000, category: 'vakuum-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Termo-qisqaruvchi plyonka ──
  { name: 'Termousadka plyonka POF', sku: 'P24-097', price: 278000, category: 'termo-qisqaruvchi-plyonka', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured: true },
  { name: 'Termousadka plyonka PVX', sku: 'P24-098', price: 424000, category: 'termo-qisqaruvchi-plyonka', image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },

  // ── PP Qoplar ──
  { name: 'Polipropilen qop', sku: 'P24-099', price: 1115, category: 'pp-qoplar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },

  // ── PP Lenta (Tasma) ──
  { name: 'Polipropilen lenta 16mm×1000m', sku: 'P24-100', price: 63100, category: 'pp-lenta', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured: true },
  { name: 'PP lenta qisqichlar', sku: 'P24-101', price: 63100, category: 'pp-lenta', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },
  { name: 'Qadoqlash asbobi', sku: 'P24-102', price: 195000, category: 'pp-lenta', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },

  // ── Termo paketlar (Sumka) ──
  { name: 'Termopakety (issiqlik saqlash)', sku: 'P24-103', price: 4625, category: 'termo-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Sovutish akkumulyatorlari', sku: 'P24-104', price: 17510, category: 'termo-paketlar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Iplar va Arqonlar ──
  { name: 'Shpagat va arqonlar', sku: 'P24-105', price: 9085, category: 'iplar-arqonlar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured: true },

  // ── Plombalar ──
  { name: 'Plastik nazorat plombalari', sku: 'P24-106', price: 419, category: 'plombalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured: true },
  { name: 'Plomba nakleiykalar', sku: 'P24-107', price: 185, category: 'plombalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },
  { name: 'Xalta plombalari', sku: 'P24-108', price: 957, category: 'plombalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },
  { name: 'Plomba sim SPIRAL', sku: 'P24-109', price: 34900, category: 'plombalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },
  { name: 'Plomba lentasi', sku: 'P24-110', price: 422000, category: 'plombalar', image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg' },

  // ── Kanselyariya ──
  { name: 'Kanselyariya mahsulotlari', sku: 'P24-111', price: 1215, category: 'kanselyariya', image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg', isFeatured: true },

  // ── PET Bankalar ──
  { name: 'PET banka 58mm easy open', sku: 'P24-112', price: 2655, category: 'pet-bankalar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'PET banka 65mm easy open', sku: 'P24-113', price: 3125, category: 'pet-bankalar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name: 'PET banka 78mm easy open', sku: 'P24-114', price: 3595, category: 'pet-bankalar', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Himoya vositalari ──
  { name: 'Xo\'jalik qo\'lqoplari', sku: 'P24-115', price: 2075, category: 'himoya-vositalari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured: true },
  { name: 'Bir martalik qo\'lqoplar', sku: 'P24-116', price: 2715, category: 'himoya-vositalari', image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },

  // ── Oziq-ovqat konteynerlari ──
  { name: 'Folga', sku: 'P24-117', price: 9030, category: 'oziq-ovqat-konteynerlari', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg', isFeatured: true },
  { name: 'Pishiriq qog\'ozi', sku: 'P24-118', price: 3405, category: 'oziq-ovqat-konteynerlari', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg' },
  { name: 'Muzlatish uchun paketlar', sku: 'P24-119', price: 3070, category: 'oziq-ovqat-konteynerlari', image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg' },

  // ── Palletlar ──
  { name: 'Pallet / Poddon', sku: 'P24-120', price: 109000, category: 'palletlar', image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured: true },
];

async function main() {
  console.log(`🌱 Pack24 mahsulotlar seed boshlanmoqda... (${PRODUCTS.length} ta)`);
  let added = 0, skipped = 0;

  for (const p of PRODUCTS) {
    const exists = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({
      data: {
        name: p.name,
        description: '',
        price: p.price,
        originalPrice: null,
        sku: p.sku,
        category: p.category,
        image: p.image,
        isFeatured: p.isFeatured ?? false,
        gallery: [],
        specifications: {},
        tags: [],
        inStock: true,
        status: 'active',
        rating: 0,
        reviews: 0,
      },
    });
    console.log(`  ✅ ${p.name}`);
    added++;
  }
  console.log(`\n🎉 Tugadi! ${added} qo'shildi, ${skipped} o'tkazildi.`);
}

main()
  .catch(e => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
