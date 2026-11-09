export const CATEGORIES = [
  {
    id: 'outerwear',
    name: 'Outerwear & Coats',
    slug: 'outerwear',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 24,
    description: 'Structured wool overcoats, tailored trench coats & leather jackets.'
  },
  {
    id: 'dresses',
    name: 'Dresses & Gowns',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 18,
    description: 'Minimalist slip dresses, draped monochrome evening gowns.'
  },
  {
    id: 'tops',
    name: 'Tops & Shirts',
    slug: 'tops',
    image: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 32,
    description: 'Crisp poplin shirts, relaxed cotton tees & silk blouses.'
  },
  {
    id: 'trousers',
    name: 'Tailored Trousers',
    slug: 'trousers',
    image: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 20,
    description: 'Pleated wide-leg pants, high-waisted wool trousers & denim.'
  },
  {
    id: 'knitwear',
    name: 'Knitwear & Sweaters',
    slug: 'knitwear',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 15,
    description: 'Cashmere turtlenecks, heavy-gauge ribbed sweaters.'
  },
  {
    id: 'accessories',
    name: 'Accessories & Leather',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80&sat=-100',
    itemCount: 28,
    description: 'Architectural leather bags, minimal eyewear & belts.'
  }
];

export const PRODUCTS = [
  {
    id: 'zel-001',
    name: 'Structured Double-Breasted Wool Overcoat',
    slug: 'structured-wool-overcoat',
    brand: 'ZELORA Atelier',
    category: 'outerwear',
    gender: 'unisex',
    price: 349,
    originalPrice: 420,
    discount: 17,
    rating: 4.9,
    reviewCount: 48,
    inStock: true,
    stockCount: 14,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Crafted from heavyweight virgin wool melton with architectural shoulders and a relaxed drape. Designed for sharp silhouette and cold-weather versatility.',
    details: [
      '100% Virgin Wool Melton exterior',
      'Cupro satin full lining with interior slip pockets',
      'Horn buttons at double-breasted closure',
      'Center back vent with concealed kick pleat',
      'Dry clean only'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Noir Black', hex: '#0a0a0a' },
      { name: 'Ash Slate', hex: '#333333' }
    ],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r1', user: 'Helena V.', rating: 5, date: 'October 24, 2026', comment: 'The cut is pure couture. It elevates everything I wear under it.' },
      { id: 'r2', user: 'Marcus K.', rating: 5, date: 'October 12, 2026', comment: 'Impeccable construction. Heavyweight and keeps the crisp shape all day.' }
    ]
  },
  {
    id: 'zel-002',
    name: 'Draped Silk Evening Slip Gown',
    slug: 'draped-silk-slip-gown',
    brand: 'ZELORA Noir',
    category: 'dresses',
    gender: 'women',
    price: 260,
    originalPrice: 320,
    discount: 19,
    rating: 4.8,
    reviewCount: 36,
    inStock: true,
    stockCount: 9,
    isNew: true,
    isTrending: false,
    isSpecialOffer: true,
    isRecommended: true,
    description: 'Fluid heavyweight silk cut on the bias to follow the contours of the body. Features an asymmetrical cowl neck and delicate cord straps.',
    details: [
      '100% 22-Momme Mulberry Silk',
      'Bias-cut for graceful movement',
      'Square back with adjustable tie closure',
      'Side slit reaching lower thigh'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Midnight Onyx', hex: '#111111' },
      { name: 'Ivory Frost', hex: '#f2f2f2' }
    ],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r3', user: 'Aria D.', rating: 5, date: 'November 2, 2026', comment: 'The drape is unmatched. Received endless compliments at our gallery opening.' }
    ]
  },
  {
    id: 'zel-003',
    name: 'Oversized Poplin Studio Shirt',
    slug: 'oversized-poplin-shirt',
    brand: 'Studio Monolith',
    category: 'tops',
    gender: 'unisex',
    price: 145,
    originalPrice: 180,
    discount: 19,
    rating: 4.7,
    reviewCount: 52,
    inStock: true,
    stockCount: 22,
    isNew: false,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Crisp organic cotton poplin tailored with dropped shoulders, exaggerated elongated cuffs, and a mother-of-pearl button placket.',
    details: [
      '100% GOTS Certified Organic Cotton Poplin',
      'Point collar with reinforced floating interlining',
      'Single box pleat at back yoke for relaxed volume',
      'Mother-of-pearl buttons'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Optic White', hex: '#fcfcfc' },
      { name: 'Pitch Black', hex: '#050505' }
    ],
    images: [
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r4', user: 'Camille R.', rating: 5, date: 'October 30, 2026', comment: 'The quintessential minimalist shirt. Crisp and holds its sculptural form.' }
    ]
  },
  {
    id: 'zel-004',
    name: 'Pleated High-Rise Wide Trousers',
    slug: 'pleated-wide-trousers',
    brand: 'ZELORA Atelier',
    category: 'trousers',
    gender: 'women',
    price: 195,
    originalPrice: 245,
    discount: 20,
    rating: 4.9,
    reviewCount: 41,
    inStock: true,
    stockCount: 16,
    isNew: true,
    isTrending: true,
    isSpecialOffer: true,
    isRecommended: true,
    description: 'High-waisted tailoring with double front inverted pleats and a sweeping wide-leg silhouette. Cut from premium tropical wool blend for year-round ease.',
    details: [
      '70% Tropical Wool, 28% Recycled Poly, 2% Elastane',
      'Concealed zip fly with hook-and-bar closure',
      'Slanted side trouser pockets and back welt pockets',
      'Internal curtain waistband'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Black', hex: '#181818' },
      { name: 'Pale Stone', hex: '#e8e8e8' }
    ],
    images: [
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r5', user: 'Sophia L.', rating: 5, date: 'October 19, 2026', comment: 'The drape when you walk is perfection. Exactly what high fashion should feel like.' }
    ]
  },
  {
    id: 'zel-005',
    name: 'Ribbed Cashmere Turtleneck Sweater',
    slug: 'ribbed-cashmere-turtleneck',
    brand: 'L’Épure',
    category: 'knitwear',
    gender: 'unisex',
    price: 280,
    originalPrice: 350,
    discount: 20,
    rating: 4.9,
    reviewCount: 30,
    inStock: true,
    stockCount: 8,
    isNew: false,
    isTrending: false,
    isSpecialOffer: true,
    isRecommended: false,
    description: 'Knitted from Grade-A Mongolian cashmere with dense English rib detailing. Offers supreme softness and an effortless slouchy neck fold.',
    details: [
      '100% Sustainable Grade-A Mongolian Cashmere',
      '7-gauge chunky fisherman rib stitch',
      'Seamless tubular knit collar and cuffs',
      'Hand wash cold or dry clean'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Jet Black', hex: '#080808' },
      { name: 'Heather Gray', hex: '#888888' }
    ],
    images: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r6', user: 'Daniel M.', rating: 5, date: 'October 15, 2026', comment: 'Worth every penny. Pure warmth without any bulk.' }
    ]
  },
  {
    id: 'zel-006',
    name: 'Minimalist Box Leather Shoulder Bag',
    slug: 'box-leather-shoulder-bag',
    brand: 'ZELORA Noir',
    category: 'accessories',
    gender: 'unisex',
    price: 220,
    originalPrice: 280,
    discount: 21,
    rating: 4.8,
    reviewCount: 29,
    inStock: true,
    stockCount: 11,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Geometric box silhouette rendered in smooth Italian vegetable-tanned leather with discreet magnetic closure and custom matte silver hardware.',
    details: [
      '100% Full-grain Italian Calfskin',
      'Bonded suede interior with card organizer',
      'Adjustable leather shoulder strap with 50cm drop',
      'Discreet debossed ZELORA foil signature'
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'Gloss Noir', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r7', user: 'Zoe P.', rating: 5, date: 'November 1, 2026', comment: 'Architectural and functional. Fits all daily essentials cleanly.' }
    ]
  },
  {
    id: 'zel-007',
    name: 'Tailored Single-Breasted Blazer',
    slug: 'tailored-single-breasted-blazer',
    brand: 'ZELORA Atelier',
    category: 'outerwear',
    gender: 'men',
    price: 290,
    originalPrice: 340,
    discount: 15,
    rating: 4.8,
    reviewCount: 27,
    inStock: true,
    stockCount: 15,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Modern relaxed tailoring crafted with sharp peak lapels and a single horn button closure. Perfect paired with jeans or matching trousers.',
    details: [
      '100% Wool Crepe shell',
      'Canvas chest piece for natural structure',
      'Double back vents and functional sleeve buttonholes',
      'Flap pockets with optional tuck-in styling'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Onyx Black', hex: '#0a0a0a' }
    ],
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r8', user: 'Julian T.', rating: 5, date: 'October 21, 2026', comment: 'The shoulder drape is European-standard. Sharp yet comfortable.' }
    ]
  },
  {
    id: 'zel-008',
    name: 'Raw Selvedge Straight-Leg Denim',
    slug: 'raw-selvedge-straight-denim',
    brand: 'Studio Monolith',
    category: 'trousers',
    gender: 'men',
    price: 165,
    originalPrice: 195,
    discount: 15,
    rating: 4.7,
    reviewCount: 38,
    inStock: true,
    stockCount: 20,
    isNew: false,
    isTrending: true,
    isSpecialOffer: true,
    isRecommended: false,
    description: '14oz rigid Japanese selvedge denim woven on vintage shuttle looms. Features a classic mid-rise and straight leg cut that fades uniquely with wear.',
    details: [
      '100% Kuroki Mills Japanese Cotton Selvedge',
      'Button fly with custom matte black donut buttons',
      'Classic 5-pocket construction with selvedge coin pocket detail',
      'Unwashed raw denim'
    ],
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Deep Indigo Black', hex: '#11151c' }
    ],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r9', user: 'Klaus E.', rating: 4, date: 'October 18, 2026', comment: 'Super stiff at first as authentic selvedge should be, breaking in beautifully.' }
    ]
  },
  {
    id: 'zel-009',
    name: 'Asymmetric Pleated Midi Skirt',
    slug: 'asymmetric-pleated-midi-skirt',
    brand: 'ZELORA Noir',
    category: 'dresses',
    gender: 'women',
    price: 180,
    originalPrice: 230,
    discount: 22,
    rating: 4.8,
    reviewCount: 22,
    inStock: true,
    stockCount: 13,
    isNew: true,
    isTrending: false,
    isSpecialOffer: true,
    isRecommended: true,
    description: 'Permanent knife pleats cascade with an architectural handkerchief hemline. Elasticated grosgrain waistband for effortless styling.',
    details: [
      '100% Technical Chiffon Crepe',
      'Permanent heat-pressed accordion pleats',
      'Invisible side zipper closure',
      'Midi length with dynamic diagonal hem'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Pure Noir', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r10', user: 'Serena W.', rating: 5, date: 'November 3, 2026', comment: 'Moves like water when you walk. A work of wearable art.' }
    ]
  },
  {
    id: 'zel-010',
    name: 'Minimalist Acetate Square Sunglasses',
    slug: 'minimalist-square-sunglasses',
    brand: 'Studio Monolith',
    category: 'accessories',
    gender: 'unisex',
    price: 110,
    originalPrice: 140,
    discount: 21,
    rating: 4.9,
    reviewCount: 64,
    inStock: true,
    stockCount: 30,
    isNew: false,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Handcrafted Mazzucchelli acetate frames featuring 100% UV400 black tint lenses and bevelled temple edges. As seen on the ZELORA hero campaign.',
    details: [
      'Italian Mazzucchelli biological acetate',
      'Category 3 UV400 protective polarized lenses',
      '7-barrel reinforced stainless steel hinges',
      'Includes recycled leather protective case and cloth'
    ],
    sizes: ['One Size'],
    colors: [
      { name: 'Piano Black', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r11', user: 'Devon F.', rating: 5, date: 'October 28, 2026', comment: 'Matches the editorial look in the hero banner perfectly. Heavy and premium.' }
    ]
  },
  {
    id: 'zel-011',
    name: 'Cropped Heavyweight Biker Jacket',
    slug: 'cropped-heavyweight-biker-jacket',
    brand: 'ZELORA Noir',
    category: 'outerwear',
    gender: 'women',
    price: 380,
    originalPrice: 480,
    discount: 21,
    rating: 4.9,
    reviewCount: 33,
    inStock: true,
    stockCount: 7,
    isNew: true,
    isTrending: true,
    isSpecialOffer: true,
    isRecommended: true,
    description: 'Supple lambskin leather constructed with silver chunky hardware, snapped epaulettes, and asymmetrical front zip.',
    details: [
      '100% Full grain sheep nappa leather',
      'Thermal quilted satin lining',
      'Heavy industrial silver hardware',
      'Gusseted zip cuffs and belted waist'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Midnight Lambskin', hex: '#0f0f0f' }
    ],
    images: [
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r12', user: 'Victoria B.', rating: 5, date: 'October 17, 2026', comment: 'The leather smell, the hardware weight—it’s luxury through and through.' }
    ]
  },
  {
    id: 'zel-012',
    name: 'Heavy Cotton Crewneck Minimal Tee',
    slug: 'heavy-cotton-crewneck-tee',
    brand: 'Studio Monolith',
    category: 'tops',
    gender: 'unisex',
    price: 65,
    originalPrice: 85,
    discount: 24,
    rating: 4.6,
    reviewCount: 77,
    inStock: true,
    stockCount: 45,
    isNew: false,
    isTrending: false,
    isSpecialOffer: true,
    isRecommended: false,
    description: '300 GSM dense combed cotton jersey with a tight bound crew neck. Designed with a boxy, slightly dropped-shoulder drape.',
    details: [
      '100% 300GSM Ring-spun Combed Cotton',
      'Pre-shrunk vintage wash finish',
      'Reinforced double-needle hem and sleeve edges',
      'Machine wash cold, lay flat to dry'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Optic White', hex: '#ffffff' },
      { name: 'Pitch Black', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80&sat=-100',
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80&sat=-100'
    ],
    reviews: [
      { id: 'r13', user: 'Liam G.', rating: 5, date: 'November 4, 2026', comment: 'The best heavyweight basic on the market. Doesn’t wrinkle or shrink.' }
    ]
  }
];

// Ensure every piece has its verified Boutique Seller name
const BRAND_TO_SELLER_MAP = {
  'ZELORA Atelier': 'ZELORA Official Flagship',
  'ZELORA Noir': 'ZELORA Noir Boutique',
  'Studio Monolith': 'Studio Monolith Concept',
  'L’Épure': 'L’Épure Paris Boutique',
  'Aethelgard': 'Aethelgard High Fashion',
  'Maison Minimal': 'Maison Minimal NYC',
  'Atelier Studio': 'Atelier Studio Paris',
  'Vanguard': 'Vanguard Sartorial London',
  'Sartorialist': 'Sartorialist Milan',
  'Nordic Studio': 'Nordic Studio Copenhagen'
};

PRODUCTS.forEach((p) => {
  if (!p.seller) {
    p.seller = BRAND_TO_SELLER_MAP[p.brand] || `${p.brand} Official Atelier`;
  }
});

