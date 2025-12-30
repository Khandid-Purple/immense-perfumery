
import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Chanel No. 5',
    category: 'Ladies',
    price: 2150,
    rating: 4.8,
    reviews: 1240,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The world’s most famous perfume. A complex floral-aldehyde fragrance that is timeless, elegant, and sophisticated. Composed of neroli, ylang-ylang, jasmine, and rose, anchored by sandalwood and vetiver.',
    notes: ['Aldehydes', 'Ylang-Ylang', 'Neroli', 'Jasmine', 'Rose', 'Sandalwood'],
    stock: 45
  },
  {
    id: '2',
    name: 'Dior Sauvage',
    category: 'Men',
    price: 1850,
    rating: 4.9,
    reviews: 3500,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615164716478-620242b5887c?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A radically fresh composition, dictated by a name that has the ring of a manifesto. Radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot. Ambroxan, derived from precious ambergris, unleashes a powerfully woody trail.',
    notes: ['Bergamot', 'Ambroxan', 'Sichuan Pepper', 'Lavender', 'Star Anise'],
    stock: 80
  },
  {
    id: '3',
    name: 'Baccarat Rouge 540',
    category: 'Unisex',
    price: 4800,
    rating: 5.0,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Luminous and sophisticated, Baccarat Rouge 540 lays on the skin like an amber, floral and woody breeze. A poetic alchemy. A graphic and highly condensed signature.',
    notes: ['Saffron', 'Jasmine', 'Amberwood', 'Ambergris', 'Fir Resin', 'Cedar'],
    stock: 12
  },
  {
    id: '4',
    name: 'YSL Black Opium',
    category: 'Ladies',
    price: 1950,
    rating: 4.7,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1543438418-85706593f0b2?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A captivating floral gourmand scent, twisted with an overdose of black coffee, for a shot of adrenaline. Energy, sensuality, coupled with that unique YSL edge.',
    notes: ['Black Coffee', 'White Flowers', 'Vanilla', 'Patchouli', 'Cedar'],
    stock: 25
  },
  {
    id: '5',
    name: 'Creed Aventus',
    category: 'Men',
    price: 5500,
    rating: 4.8,
    reviews: 1540,
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The exceptional Aventus was inspired by the dramatic life of a historic emperor, celebrating strength, power, and success. Introduced in 2010 and crafted by the deft hand of Sixth Generation Master Perfumer Olivier Creed.',
    notes: ['Pineapple', 'Birch', 'Musk', 'Blackcurrant', 'Bergamot', 'Oakmoss'],
    stock: 5
  },
  {
    id: '6',
    name: 'Tom Ford Tobacco Vanille',
    category: 'Unisex',
    price: 4400,
    rating: 4.6,
    reviews: 760,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A modern take on an old-world men’s club. A smooth oriental fragrance opens with opulent essences of tobacco leaf and aromatic spice notes. The heart unfolds with creamy tonka bean, tobacco flower, vanilla and cocoa.',
    notes: ['Tobacco Leaf', 'Spices', 'Vanilla', 'Cocoa', 'Tonka Bean', 'Wood Sap'],
    stock: 18
  },
  {
    id: '7',
    name: 'Le Labo Santal 33',
    category: 'Unisex',
    price: 3450,
    rating: 4.5,
    reviews: 1100,
    image: 'https://images.unsplash.com/photo-1512777576255-a88b7245b08a?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512777576255-a88b7245b08a?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A perfume that touches the sensual universality of this icon... that would intoxicate a man as much as a woman. It introduces the brand\'s use of cardamom, iris, violet, and ambrox which crackle in the formula and bring to this smoking wood alloy some spicy, leathery, musky notes.',
    notes: ['Sandalwood', 'Cedar', 'Cardamom', 'Violet', 'Papyrus', 'Leather'],
    stock: 30
  },
  {
    id: '8',
    name: 'Versace Eros',
    category: 'Men',
    price: 1450,
    rating: 4.7,
    reviews: 2800,
    image: 'https://images.unsplash.com/photo-1605658632608-8e658e244b2d?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1605658632608-8e658e244b2d?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Love, Passion, Beauty, and Desire. Eros is a fragrance that interprets the sublime masculinity through a luminous aura with an intense, vibrant, and glowing freshness obtained from the combination of mint leaves, Italian lemon zest, and green apple.',
    notes: ['Mint', 'Green Apple', 'Lemon', 'Tonka Bean', 'Ambroxan', 'Geranium'],
    stock: 65
  },
  {
    id: '9',
    name: 'Jo Malone Wood Sage',
    category: 'Unisex',
    price: 1650,
    rating: 4.7,
    reviews: 1950,
    image: 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Escape the everyday along the windswept shore. Waves breaking white, the air fresh with sea salt and spray. Alive with the mineral scent of the rugged cliffs. Mingling with the woody earthiness of sage.',
    notes: ['Ambrette Seeds', 'Sea Salt', 'Sage', 'Grapefruit', 'Seaweed'],
    stock: 40
  },
  {
    id: '10',
    name: 'Gucci Bloom',
    category: 'Ladies',
    price: 1750,
    rating: 4.6,
    reviews: 2200,
    image: 'https://images.unsplash.com/photo-1585822765181-70529d2f22c6?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1585822765181-70529d2f22c6?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Debuting the first fragrance developed wholly under Alessandro Michele’s creative vision: a scent designed to celebrate the authenticity, vitality and diversity of women—flourishing in a natural, expressive and individual way.',
    notes: ['Rangoon Creeper', 'Jasmine Bud', 'Tuberose', 'Orris Root', 'Honeysuckle'],
    stock: 55
  },
  {
    id: '11',
    name: 'Acqua Di Giò',
    category: 'Men',
    price: 1550,
    rating: 4.8,
    reviews: 4100,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A resolutely masculine fragrance born from the sea, the sun, the earth, and the breeze of a Mediterranean island. Transparent, aromatic, and woody in nature Aqua Di Gio Pour Homme is a contemporary expression of masculinity.',
    notes: ['Marine Notes', 'Bergamot', 'Cedar', 'White Musk', 'Patchouli'],
    stock: 90
  },
  {
    id: '12',
    name: 'Tom Ford Oud Wood',
    category: 'Unisex',
    price: 4900,
    rating: 4.7,
    reviews: 850,
    image: 'https://images.unsplash.com/photo-1555437648-26155dd54445?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555437648-26155dd54445?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'Rare. Exotic. Distinctive. One of the most rare, precious, and expensive ingredients in a perfumer’s arsenal, oud wood is often burned in the incense-filled temples of Bhutan.',
    notes: ['Oud Wood', 'Sandlewood', 'Chinese Pepper', 'Rosewood', 'Tonka Bean', 'Vanilla'],
    stock: 15
  },
  {
    id: '13',
    name: 'YSL Libre',
    category: 'Ladies',
    price: 2100,
    rating: 4.8,
    reviews: 1800,
    image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'The freedom to live everything with excess. The perfume of a strong, bold, and free woman experimenting her freedom efficiently. The first floral lavender. The tension between the burning sensuality of an orange blossom from Morocco & the boldness of a lavender from France.',
    notes: ['Lavender', 'Orange Blossom', 'Musk', 'Vanilla', 'Mandarin'],
    stock: 60
  },
  {
    id: '14',
    name: 'Bleu de Chanel',
    category: 'Men',
    price: 2250,
    rating: 4.9,
    reviews: 3200,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop'
    ],
    description: 'A tribute to masculine freedom in an aromatic-woody fragrance with a captivating trail. A timeless scent housed in a bottle of deep and mysterious blue.',
    notes: ['Labdanum', 'Nutmeg', 'Ginger', 'Sandalwood', 'Patchouli', 'Mint'],
    stock: 75
  },
  {
    id: '15',
    name: 'Nautica Voyage',
    category: 'Men',
    price: 450,
    rating: 4.6,
    reviews: 5200,
    image: 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1585232004423-244e0e6904e3?q=80&w=1000&auto=format&fit=crop'],
    description: 'Fresh, cool, and aquatic. For a man on a journey, living life by his own rules. A crisp, lively blend of apple and green leaves, anchored by lotus and cedarwood.',
    notes: ['Green Apple', 'Green Leaves', 'Lotus', 'Cedar', 'Musk', 'Amber'],
    stock: 120
  },
  {
    id: '16',
    name: 'Davidoff Cool Water',
    category: 'Men',
    price: 550,
    rating: 4.5,
    reviews: 4800,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=1000&auto=format&fit=crop'],
    description: 'The quintessence of ocean freshness. Experience the cool call of the sea, blending coriander, mint, lavender, and rosemary with a heart of sandalwood and jasmine.',
    notes: ['Sea Water', 'Lavender', 'Mint', 'Coriander', 'Sandalwood'],
    stock: 100
  },
  {
    id: '17',
    name: 'CK One',
    category: 'Unisex',
    price: 600,
    rating: 4.4,
    reviews: 6100,
    image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=1000&auto=format&fit=crop'],
    description: 'Purity. Unity. Freshness. The first and most iconic unisex fragrance. A clean, refreshing scent with notes of bergamot, cardamom, pineapple, and papaya.',
    notes: ['Lemon', 'Green Notes', 'Bergamot', 'Papaya', 'Lily-of-the-Valley'],
    stock: 150
  },
  {
    id: '18',
    name: 'Elizabeth Arden Green Tea',
    category: 'Ladies',
    price: 350,
    rating: 4.3,
    reviews: 3200,
    image: 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop'],
    description: 'Energizing. Refreshing. Uplifting. From a lush, green world of freshness comes Elizabeth Arden Green Tea, the fragrance that energizes the body, excites the senses and invigorates the spirit.',
    notes: ['Green Tea', 'Mint', 'Lemon', 'Orange Peel', 'Rhubarb'],
    stock: 90
  },
  {
    id: '19',
    name: 'Zara Red Vanilla',
    category: 'Ladies',
    price: 420,
    rating: 4.2,
    reviews: 1500,
    image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop'],
    description: 'A sophisticated, warm, and spicy fragrance with floral and sweet notes. A brilliant bouquet of elegant iris and red peony flowers combined with juicy notes of tangerine.',
    notes: ['Blackcurrant', 'Iris', 'Vanilla', 'Praline', 'Patchouli'],
    stock: 200
  },
  {
    id: '20',
    name: 'Versace Blue Jeans',
    category: 'Men',
    price: 480,
    rating: 4.3,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop'],
    description: 'A classic masculine fragrance with a woodsy, citrusy scent with a heart of spicy notes. Casual, youthful, and free-spirited.',
    notes: ['Citrus', 'Bergamot', 'Juniper', 'Rose', 'Geranium', 'Vanilla'],
    stock: 85
  },
  {
    id: '21',
    name: 'Victoria\'s Secret Bombshell',
    category: 'Ladies',
    price: 950,
    rating: 4.6,
    reviews: 4500,
    image: 'https://images.unsplash.com/photo-1550523871-b0db3c804b4c?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1550523871-b0db3c804b4c?q=80&w=1000&auto=format&fit=crop'],
    description: 'Confidence and glamour in a bottle. A sparkling mix of fresh-cut peonies and afternoon sun. Citrus notes and Brazilian Purple Passion Fruit start the fragrance off with bright, exotic sparkle.',
    notes: ['Passion Fruit', 'Grapefruit', 'Peony', 'Vanilla Orchid', 'Musk'],
    stock: 60
  },
  {
    id: '22',
    name: 'Armaf Club de Nuit Intense',
    category: 'Men',
    price: 850,
    rating: 4.5,
    reviews: 3800,
    image: 'https://images.unsplash.com/photo-1615164716478-620242b5887c?q=80&w=1000&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1615164716478-620242b5887c?q=80&w=1000&auto=format&fit=crop'],
    description: 'A provocative woody spicy masculine scent that opens with fresh fruity notes of lemon, apple and blackcurrant leading to its opulent floral heart of rose and jasmine spiced with birch to add a smoky leather nuance.',
    notes: ['Lemon', 'Pineapple', 'Blackcurrant', 'Birch', 'Musk', 'Ambergris'],
    stock: 70
  }
];
