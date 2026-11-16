import { useState, useEffect } from 'react';

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

export const BASE_PRODUCTS = [
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
  },
  {
    id: 'zel-013',
    name: 'Classic Minimalist Cotton T-Shirt',
    slug: 'classic-minimalist-cotton-tshirt',
    brand: 'ZELORA Essentials',
    category: 'tops',
    gender: 'men',
    price: 599,
    originalPrice: 799,
    discount: 25,
    rating: 4.8,
    reviewCount: 55,
    inStock: true,
    stockCount: 40,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Premium combed Egyptian cotton t-shirt with tailored silhouette and ribbed crewneck.',
    details: ['100% Long-staple Egyptian cotton', 'Tailored modern fit', 'Machine wash cold'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Noir Black', hex: '#0a0a0a' }],
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-014',
    name: 'Monochrome Linen Camp Collar Shirt',
    slug: 'monochrome-linen-camp-shirt',
    brand: 'Studio Monolith',
    category: 'tops',
    gender: 'men',
    price: 899,
    originalPrice: 1199,
    discount: 25,
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    stockCount: 22,
    isNew: false,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Airy pure French linen shirt with relaxed camp collar and mother-of-pearl buttons.',
    details: ['100% French Normandy Linen', 'Camp collar with boxy silhouette', 'Hand wash recommended'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Ash Grey', hex: '#333333' }],
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-015',
    name: 'Sculpted Ribbed Knit Midi Dress',
    slug: 'sculpted-ribbed-knit-midi-dress',
    brand: 'ZELORA Noir',
    category: 'dresses',
    gender: 'women',
    price: 1250,
    originalPrice: 1600,
    discount: 21,
    rating: 4.85,
    reviewCount: 26,
    inStock: true,
    stockCount: 14,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Form-fitting ribbed stretch knit midi dress with high neck and side slit.',
    details: ['Ribbed viscose blend', 'High mock neckline', 'Dry clean only'],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [{ name: 'Noir Black', hex: '#0a0a0a' }],
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-016',
    name: 'Tailored Minimal Wool Blend Trousers',
    slug: 'tailored-minimal-wool-trousers',
    brand: 'ZELORA Tailoring',
    category: 'trousers',
    gender: 'men',
    price: 1450,
    originalPrice: 1850,
    discount: 21,
    rating: 4.8,
    reviewCount: 17,
    inStock: true,
    stockCount: 19,
    isNew: false,
    isTrending: false,
    isSpecialOffer: false,
    isRecommended: false,
    description: 'Refined straight-leg wool blend trousers with clean front pleating and pressed crease.',
    details: ['Wool and modal blend', 'Double welt rear pockets', 'Dry clean'],
    sizes: ['30', '32', '34', '36'],
    colors: [{ name: 'Charcoal', hex: '#222222' }],
    images: ['https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-017',
    name: 'Oversized Gabardine Editorial Trench Coat',
    slug: 'oversized-gabardine-trench',
    brand: 'ZELORA Atelier',
    category: 'outerwear',
    gender: 'women',
    price: 1899,
    originalPrice: 2400,
    discount: 20,
    rating: 4.95,
    reviewCount: 33,
    inStock: true,
    stockCount: 9,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Dramatic double-breasted storm-flap trench coat in weather-resistant cotton gabardine.',
    details: ['Heavy cotton gabardine', 'Storm flap with waist belt', 'Dry clean'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Obsidian', hex: '#111111' }],
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-018',
    name: 'Architectural Silk Organza Evening Gown',
    slug: 'architectural-silk-organza-gown',
    brand: 'ZELORA Haute',
    category: 'dresses',
    gender: 'women',
    price: 3499,
    originalPrice: 4200,
    discount: 16,
    rating: 5.0,
    reviewCount: 12,
    inStock: true,
    stockCount: 5,
    isNew: true,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: true,
    description: 'Couture floor-length silk organza evening gown with sculpted tier drape and corseted bodice.',
    details: ['100% Pure silk organza', 'Internal boned bodice', 'Specialist couture dry clean'],
    sizes: ['XS', 'S', 'M'],
    colors: [{ name: 'Pure Noir', hex: '#000000' }],
    images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-019',
    name: 'Vintage Archive Leather Bomber Jacket',
    slug: 'vintage-archive-leather-bomber',
    brand: 'ZELORA Atelier',
    category: 'outerwear',
    gender: 'men',
    price: 4800,
    originalPrice: 5600,
    discount: 14,
    rating: 4.9,
    reviewCount: 9,
    inStock: true,
    stockCount: 4,
    isNew: false,
    isTrending: true,
    isSpecialOffer: false,
    isRecommended: false,
    description: 'Distressed Italian lambskin leather bomber jacket with heavy antique brass hardware.',
    details: ['100% Italian Lambskin leather', 'Heavy ribbed cuffs and hem', 'Specialist leather clean'],
    sizes: ['M', 'L', 'XL'],
    colors: [{ name: 'Aged Black', hex: '#1c1c1c' }],
    images: ['https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
  },
  {
    id: 'zel-020',
    name: 'Limited Edition Cashmere Duster Cardigan',
    slug: 'limited-cashmere-duster',
    brand: 'Maison Minimal',
    category: 'knitwear',
    gender: 'women',
    price: 1750,
    originalPrice: 2200,
    discount: 20,
    rating: 4.9,
    reviewCount: 8,
    inStock: false,
    stockCount: 0,
    isNew: false,
    isTrending: false,
    isSpecialOffer: false,
    isRecommended: false,
    description: 'Floor-sweeping pure Mongolian cashmere duster cardigan (Sold Out seasonal archive).',
    details: ['100% Mongolian Cashmere', 'Floor-length silhouette', 'Dry clean only'],
    sizes: ['S', 'M', 'L'],
    colors: [{ name: 'Charcoal Heather', hex: '#2b2b2b' }],
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80&sat=-100'],
    reviews: []
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

BASE_PRODUCTS.forEach((p) => {
  if (!p.seller) {
    p.seller = BRAND_TO_SELLER_MAP[p.brand] || `${p.brand} Official Atelier`;
  }
});

export const COLOR_HEX_MAP = {
  'noir black': '#0a0a0a',
  'black': '#000000',
  'ash slate': '#333333',
  'slate': '#475569',
  'white': '#ffffff',
  'ivory': '#f8f6f0',
  'ivory bone': '#f8f6f0',
  'cream': '#fffdd0',
  'beige': '#f5f5dc',
  'grey': '#808080',
  'gray': '#808080',
  'charcoal': '#2b2b2b',
  'navy': '#000080',
  'navy blue': '#0a192f',
  'blue': '#2563eb',
  'red': '#dc2626',
  'crimson': '#990000',
  'burgundy': '#800020',
  'wine': '#722f37',
  'green': '#16a34a',
  'olive': '#556b2f',
  'emerald': '#047857',
  'gold': '#d4af37',
  'sand': '#c2b280',
  'brown': '#654321',
  'camel': '#c19a6b',
  'silver': '#c0c0c0',
  'monochrome': '#1e293b',
};

export const normalizeProductColor = (c) => {
  if (!c) return { name: 'Noir Black', hex: '#0a0a0a' };
  if (typeof c === 'object' && c.name) {
    return {
      name: c.name,
      hex: c.hex || COLOR_HEX_MAP[c.name.toLowerCase()] || '#1e293b',
    };
  }
  const name = String(c).trim();
  const hex = COLOR_HEX_MAP[name.toLowerCase()] || '#1e293b';
  return { name, hex };
};

export const normalizeCategory = (cat) => {
  if (!cat) return 'dresses';
  const c = String(cat).toLowerCase().trim();
  if (c === 'outerwear' || c.includes('coat') || c.includes('jacket')) return 'outerwear';
  if (c === 'dresses' || c.includes('dress') || c.includes('gown')) return 'dresses';
  if (c === 'tops' || c.includes('shirt') || c.includes('tee') || c.includes('blouse') || c.includes('top')) return 'tops';
  if (c === 'trousers' || c.includes('pant') || c.includes('jean') || c.includes('denim')) return 'trousers';
  if (c === 'knitwear' || c.includes('knit') || c.includes('sweater') || c.includes('cardigan')) return 'knitwear';
  if (c === 'accessories' || c.includes('bag') || c.includes('shoe') || c.includes('leather') || c.includes('access')) return 'accessories';
  return c;
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const LEGACY_DEMO_PRODUCT_IDS = new Set([
  'prod-sel-101', 'prod-sel-102', 'prod-sel-103',
  'prod-sel-104', 'prod-sel-105', 'prod-sel-106',
]);

export const DEFAULT_CATEGORY_IMAGES = {
  outerwear: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80&sat=-100',
  dresses: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80&sat=-100',
  tops: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1000&q=80&sat=-100',
  trousers: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=1000&q=80&sat=-100',
  knitwear: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=80&sat=-100',
  accessories: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80&sat=-100',
  shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80&sat=-100',
};

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80&sat=-100';

export const normalizeSellerProduct = (raw, fallbackSeller = '') => {
  if (!raw) return null;
  const rawId = raw.id || `prod-sel-${Date.now()}`;
  const rawName = raw.name || 'Untitled Garment';
  const rawBrand = raw.brand || fallbackSeller || 'ZELORA Partner Atelier';
  const rawSeller = raw.seller || rawBrand || fallbackSeller || 'ZELORA Official Flagship';
  const regPrice = parseFloat(raw.regular_price ?? raw.originalPrice ?? raw.price ?? 0) || 0;
  const discPrice = raw.discount_price !== undefined && raw.discount_price !== null && raw.discount_price !== ''
    ? parseFloat(raw.discount_price)
    : (raw.price ? parseFloat(raw.price) : regPrice);
  const finalPrice = discPrice > 0 ? discPrice : regPrice;
  const originalPrice = regPrice > 0 ? regPrice : finalPrice;
  const discount = originalPrice > finalPrice && originalPrice > 0
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : (parseInt(raw.discount, 10) || 0);

  // Parse stock
  let totalStock = 0;
  if (raw.size_stock && typeof raw.size_stock === 'object') {
    totalStock = Object.values(raw.size_stock).reduce((acc, val) => acc + (parseInt(val, 10) || 0), 0);
  } else if (raw.stock_quantity !== undefined && raw.stock_quantity !== null) {
    totalStock = parseInt(raw.stock_quantity, 10) || 0;
  } else if (raw.stockCount !== undefined && raw.stockCount !== null) {
    totalStock = parseInt(raw.stockCount, 10) || 0;
  } else {
    totalStock = 10;
  }

  const isPublished = (raw.status || 'Published') === 'Published';
  const inStock = Boolean(raw.inStock ?? (totalStock > 0 && isPublished));

  // Colors
  const rawColors = Array.isArray(raw.colors) && raw.colors.length > 0 ? raw.colors : ['Noir Black'];
  const colors = rawColors.map(normalizeProductColor);

  const normCat = normalizeCategory(raw.category);
  const defaultCategoryImg = DEFAULT_CATEGORY_IMAGES[normCat] || FALLBACK_PRODUCT_IMAGE;

  // Images with expired blob: handling and fallback sanitization
  let rawImgList = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    rawImgList = raw.images.filter(Boolean);
  } else if (typeof raw.image === 'string' && raw.image) {
    rawImgList = [raw.image];
  }

  const sanitizedImages = rawImgList
    .map((img) => {
      if (typeof img !== 'string') return defaultCategoryImg;
      const trimmed = img.trim();
      // Replace expired blob URLs or empty strings with high-res lookbook photography
      if (!trimmed || trimmed.startsWith('blob:')) {
        return defaultCategoryImg;
      }
      return trimmed;
    })
    .filter(Boolean);

  const images = sanitizedImages.length > 0 ? sanitizedImages : [defaultCategoryImg];

  // Sizes
  let sizes = [];
  if (raw.size_stock && typeof raw.size_stock === 'object') {
    const activeFromStock = Object.keys(raw.size_stock).filter((s) => (parseInt(raw.size_stock[s], 10) || 0) > 0);
    if (activeFromStock.length > 0) sizes = activeFromStock;
  }
  if (sizes.length === 0 && Array.isArray(raw.sizes) && raw.sizes.length > 0) {
    sizes = raw.sizes;
  }
  if (sizes.length === 0) {
    sizes = ['XS', 'S', 'M', 'L', 'XL'];
  }

  return {
    id: String(rawId),
    name: rawName,
    slug: raw.slug || slugify(rawName) || String(rawId),
    brand: rawBrand,
    seller: rawSeller,
    category: normalizeCategory(raw.category),
    categoryRaw: raw.category || 'Dresses',
    gender: (raw.gender || 'unisex').toLowerCase(),
    price: finalPrice,
    originalPrice: originalPrice,
    discount: discount,
    rating: parseFloat(raw.rating ?? 5.0),
    reviewCount: parseInt(raw.reviewCount ?? raw.reviews_count ?? 0, 10),
    inStock: inStock,
    stockCount: totalStock,
    isNew: raw.isNew !== undefined ? Boolean(raw.isNew) : true,
    isTrending: Boolean(raw.isTrending),
    isSpecialOffer: Boolean(raw.isSpecialOffer || discount > 0),
    isRecommended: Boolean(raw.isRecommended ?? true),
    description: raw.description || `Exquisite bespoke garment crafted with precision tailoring by ${rawBrand}.`,
    details: Array.isArray(raw.details) && raw.details.length > 0
      ? raw.details
      : [raw.description || 'Artisanal tailoring with luxury textile selection', `SKU: ${raw.sku || rawId}`, 'White-glove courier delivery & secure garment bag included'],
    sizes: sizes,
    size_stock: raw.size_stock || {},
    colors: colors,
    images: images,
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    status: raw.status || 'Published',
    created_at: raw.created_at || new Date().toISOString(),
    sku: raw.sku || `ZEL-${rawId}`,
    source: 'seller',
  };
};

export const getSellerProducts = (onlyPublished = true) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('zelora_seller_products');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    let hasBlob = false;
    list.forEach((p) => {
      if (!p) return;
      const cat = normalizeCategory(p.category);
      const catImg = DEFAULT_CATEGORY_IMAGES[cat] || FALLBACK_PRODUCT_IMAGE;
      if (Array.isArray(p.images)) {
        p.images = p.images.map((img) => {
          if (typeof img === 'string' && (img.startsWith('blob:') || !img.trim())) {
            hasBlob = true;
            return catImg;
          }
          return img;
        });
        if (p.images.length === 0) {
          p.images = [catImg];
          hasBlob = true;
        }
      } else if (!p.images) {
        p.images = [catImg];
        hasBlob = true;
      }
      if (typeof p.image === 'string' && (p.image.startsWith('blob:') || !p.image.trim())) {
        p.image = catImg;
        hasBlob = true;
      }
    });

    if (hasBlob) {
      try {
        localStorage.setItem('zelora_seller_products', JSON.stringify(list));
      } catch (e) {}
    }

    let shopName = '';
    try {
      const shopData = localStorage.getItem('zelora_seller_shop');
      if (shopData) {
        const parsedShop = JSON.parse(shopData);
        shopName = parsedShop?.name || '';
      }
    } catch {}

    return list
      .filter((p) => p && !LEGACY_DEMO_PRODUCT_IDS.has(p.id))
      .filter((p) => {
        if (!onlyPublished) return true;
        return p.status === 'Published' || !p.status;
      })
      .map((p) => normalizeSellerProduct(p, shopName))
      .filter(Boolean);
  } catch (err) {
    console.warn('Error reading zelora_seller_products:', err);
    return [];
  }
};

export const getLiveProducts = (options = { includeDrafts: false }) => {
  const sellerProds = getSellerProducts(!options?.includeDrafts);
  // Put newly added seller products first so they appear at the front of customer listings
  return [...sellerProds, ...BASE_PRODUCTS];
};

export const PRODUCTS = getLiveProducts();

export function refreshProducts() {
  const live = getLiveProducts({ includeDrafts: false });
  PRODUCTS.length = 0;
  PRODUCTS.push(...live);
  return PRODUCTS;
}

export function findProductByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  const target = String(idOrSlug).toLowerCase().trim();
  const live = getLiveProducts({ includeDrafts: true });
  return (
    live.find(
      (p) =>
        String(p.id).toLowerCase() === target ||
        String(p.slug || '').toLowerCase() === target
    ) || null
  );
}

export function useLiveProducts(options = { includeDrafts: false }) {
  const [products, setProducts] = useState(() => getLiveProducts(options));

  useEffect(() => {
    const handleUpdate = () => {
      refreshProducts();
      setProducts(getLiveProducts(options));
    };

    window.addEventListener('zelora_products_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('zelora_products_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [options?.includeDrafts]);

  return products;
}


