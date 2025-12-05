export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
  specs?: Record<string, string>;
}

export const categories = [
  { id: 'phones', name: 'Phones', icon: '📱' },
  { id: 'laptops', name: 'Laptops', icon: '💻' },
  { id: 'audio', name: 'Audio', icon: '🎧' },
  { id: 'accessories', name: 'Accessories', icon: '⌚' },
  { id: 'smart-home', name: 'Smart Home', icon: '🏠' },
];

export const products: Product[] = [
  // Phones
  {
    id: 'phone-1',
    name: 'ProMax Ultra 15',
    price: 1199,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
    category: 'phones',
    description: 'The most advanced smartphone yet. Featuring a stunning 6.7-inch Super Retina XDR display, A17 Pro chip, and a revolutionary camera system with 48MP main sensor. Experience desktop-class performance in the palm of your hand.',
    rating: 4.9,
    reviews: 2847,
    inStock: true,
    featured: true,
    specs: {
      'Display': '6.7" Super Retina XDR',
      'Chip': 'A17 Pro',
      'Camera': '48MP + 12MP + 12MP',
      'Battery': '4422 mAh',
      'Storage': '256GB / 512GB / 1TB',
    },
  },
  {
    id: 'phone-2',
    name: 'Galaxy Fold X',
    price: 1799,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80',
    category: 'phones',
    description: 'Unfold your world with the revolutionary foldable display. 7.6-inch Infinity Flex Display when unfolded, seamlessly transforms to a compact phone for everyday use.',
    rating: 4.7,
    reviews: 1523,
    inStock: true,
    featured: true,
    specs: {
      'Display': '7.6" Foldable AMOLED',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '50MP Triple Camera',
      'Battery': '4400 mAh',
    },
  },
  {
    id: 'phone-3',
    name: 'Pixel Pro 9',
    price: 899,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
    category: 'phones',
    description: 'Pure Android experience with the best camera AI. Tensor G4 chip delivers intelligent features that adapt to you.',
    rating: 4.8,
    reviews: 1892,
    inStock: true,
    specs: {
      'Display': '6.3" LTPO OLED',
      'Chip': 'Tensor G4',
      'Camera': '50MP Dual Pixel',
      'Battery': '4700 mAh',
    },
  },
  // Laptops
  {
    id: 'laptop-1',
    name: 'MacBook Pro M4',
    price: 2499,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    category: 'laptops',
    description: 'Supercharged by M4 Pro and M4 Max. The most advanced Mac chips ever. Incredible performance for demanding workflows and up to 22 hours of battery life.',
    rating: 4.9,
    reviews: 3421,
    inStock: true,
    featured: true,
    specs: {
      'Display': '16" Liquid Retina XDR',
      'Chip': 'M4 Pro / M4 Max',
      'Memory': 'Up to 128GB',
      'Storage': 'Up to 8TB SSD',
      'Battery': '22 hours',
    },
  },
  {
    id: 'laptop-2',
    name: 'XPS Studio 17',
    price: 1899,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    category: 'laptops',
    description: 'Creator\'s dream machine. 17-inch 4K+ OLED display with 100% DCI-P3 color gamut. Intel Core Ultra with NVIDIA RTX graphics.',
    rating: 4.6,
    reviews: 876,
    inStock: true,
    specs: {
      'Display': '17" 4K+ OLED Touch',
      'Processor': 'Intel Core Ultra 9',
      'Graphics': 'NVIDIA RTX 4070',
      'Memory': '32GB DDR5',
    },
  },
  {
    id: 'laptop-3',
    name: 'ROG Zephyrus G16',
    price: 2199,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80',
    category: 'laptops',
    description: 'Ultra-slim gaming powerhouse. NVIDIA RTX 4090 graphics in an impossibly thin chassis. 240Hz Nebula HDR display for competitive gaming.',
    rating: 4.8,
    reviews: 1245,
    inStock: true,
    featured: true,
    specs: {
      'Display': '16" 240Hz QHD+',
      'Processor': 'AMD Ryzen 9 8945HX',
      'Graphics': 'NVIDIA RTX 4090',
      'Memory': '32GB DDR5',
    },
  },
  // Audio
  {
    id: 'audio-1',
    name: 'AirPods Pro Max',
    price: 549,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    category: 'audio',
    description: 'Immersive listening with Active Noise Cancellation and Spatial Audio. Apple-designed H2 chip delivers magical audio experiences.',
    rating: 4.7,
    reviews: 4521,
    inStock: true,
    featured: true,
    specs: {
      'Driver': '40mm Apple-designed',
      'ANC': 'Adaptive Transparency',
      'Battery': '20 hours',
      'Connectivity': 'Bluetooth 5.3',
    },
  },
  {
    id: 'audio-2',
    name: 'Sony WH-1000XM6',
    price: 399,
    originalPrice: 449,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    category: 'audio',
    description: 'Industry-leading noise cancellation with V2 processor. 30-hour battery life and LDAC support for Hi-Res Audio.',
    rating: 4.8,
    reviews: 3876,
    inStock: true,
    specs: {
      'Driver': '40mm HD',
      'ANC': 'V2 Processor',
      'Battery': '30 hours',
      'Codecs': 'LDAC, AAC, SBC',
    },
  },
  {
    id: 'audio-3',
    name: 'Bose QuietComfort Ultra',
    price: 329,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
    category: 'audio',
    description: 'Spatial audio with breakthrough immersive sound. CustomTune technology personalizes your listening experience.',
    rating: 4.6,
    reviews: 2134,
    inStock: true,
    specs: {
      'Type': 'True Wireless',
      'ANC': 'CustomTune',
      'Battery': '6 + 18 hours',
      'Features': 'Spatial Audio',
    },
  },
  // Accessories
  {
    id: 'accessory-1',
    name: 'Apple Watch Ultra 3',
    price: 799,
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80',
    category: 'accessories',
    description: 'The most rugged Apple Watch ever. 49mm titanium case, precision dual-frequency GPS, and 36-hour battery life.',
    rating: 4.9,
    reviews: 1876,
    inStock: true,
    featured: true,
    specs: {
      'Case': '49mm Titanium',
      'Display': 'Always-On Retina',
      'Battery': '36 hours',
      'Water': '100m depth rating',
    },
  },
  {
    id: 'accessory-2',
    name: 'MagSafe Charger Pro',
    price: 49,
    image: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=600&q=80',
    category: 'accessories',
    description: '15W fast wireless charging with perfect alignment every time. Works with iPhone, AirPods, and Apple Watch.',
    rating: 4.5,
    reviews: 5432,
    inStock: true,
    specs: {
      'Output': '15W',
      'Compatibility': 'MagSafe devices',
      'Cable': 'USB-C',
    },
  },
  {
    id: 'accessory-3',
    name: 'Galaxy Buds3 Pro',
    price: 229,
    originalPrice: 279,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    category: 'accessories',
    description: 'Intelligent ANC that adapts to your environment. 360 Audio and enhanced call clarity with 3 mics.',
    rating: 4.6,
    reviews: 2341,
    inStock: true,
    specs: {
      'Driver': '10.5mm Dynamic',
      'ANC': 'Intelligent Active',
      'Battery': '6 + 18 hours',
      'Features': '360 Audio',
    },
  },
  // Smart Home
  {
    id: 'smart-1',
    name: 'HomePod Pro',
    price: 349,
    image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600&q=80',
    category: 'smart-home',
    description: 'Room-filling sound that adapts to any space. S9 chip with Neural Engine for computational audio and smart home hub.',
    rating: 4.7,
    reviews: 1234,
    inStock: true,
    featured: true,
    specs: {
      'Audio': 'High-excursion woofer',
      'Chip': 'S9 with Neural Engine',
      'Features': 'Matter hub',
      'Assistant': 'Siri',
    },
  },
  {
    id: 'smart-2',
    name: 'Nest Hub Max',
    price: 229,
    originalPrice: 279,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80',
    category: 'smart-home',
    description: '10-inch HD screen with camera for video calls. Control your smart home, stream music, and more with Google Assistant.',
    rating: 4.5,
    reviews: 3421,
    inStock: true,
    specs: {
      'Display': '10" HD',
      'Camera': '6.5MP',
      'Speakers': 'Stereo',
      'Assistant': 'Google',
    },
  },
  {
    id: 'smart-3',
    name: 'Ring Video Doorbell 5',
    price: 199,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    category: 'smart-home',
    description: 'See, hear, and speak to visitors from anywhere. 1536p HD video with enhanced night vision and package detection.',
    rating: 4.6,
    reviews: 8765,
    inStock: true,
    specs: {
      'Video': '1536p HD',
      'Features': 'Motion zones',
      'Power': 'Battery/Wired',
      'Audio': 'Two-way talk',
    },
  },
];

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery)
  );
};
