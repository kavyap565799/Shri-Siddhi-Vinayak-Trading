export const SITE_CONFIG = {
  name: 'Shri Siddhi Vinayak Trading Co.',
  tagline: 'A House of Industrial Tools, Power Tools & Safety Equipment',
  description: 'Your trusted partner for industrial tools, electric power tools, welding accessories, project materials, and safety equipment in Motikhavdi, Jamnagar, Gujarat.',
  gst: '24AJSPC0245L1Z8',
  contact: {
    name: 'Harish Chaudhary',
    phone1: '96385 30020',
    phone2: '96385 30022',
    phone1Link: 'tel:+919638530020',
    phone2Link: 'tel:+919638530022',
    address: 'Shop No.2, Kailash Complex, Jamnagar Khambhaliya Highway, nr. Meera Hotel, Motikhavdi, Nani Khavdi, Gujarat 361140',
  },
  whatsapp: {
    number: '919638530020',
    defaultMessage: "Hello! I'm enquiring about your industrial products.",
  },
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Brands', href: '/brands' },
  { label: 'Categories', href: '/categories' },
  { label: 'Contact', href: '/contact' },
] as const;

export const BRAND_COLORS = {
  navy: '#1B2D5E',
  orange: '#E8660A',
  background: '#FAFAF8',
  surface: '#FFFFFF',
  textDark: '#111111',
  textMuted: '#6B7280',
  borderLight: '#E5E7EB',
} as const;

export function getWhatsAppUrl(message?: string): string {
  const msg = encodeURIComponent(message || SITE_CONFIG.whatsapp.defaultMessage);
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${msg}`;
}

export function getWhatsAppProductUrl(productName: string): string {
  const message = encodeURIComponent(
    `Hello! I'm interested in "${productName}". Please share details and pricing. Thank you!`
  );
  return `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${message}`;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
}

export const LOCAL_BRANDS: Brand[] = [
  {
    id: '702f8471-1c63-41bd-b651-d5e859320d1f',
    name: 'Bosch',
    slug: 'bosch',
    logo_url: '/images/brands/bosch.png',
    description: 'Professional power tools and accessories.',
    is_featured: true,
    display_order: 1
  },
  {
    id: 'fc2e1f0d-7e36-4fbc-ade5-a1acbee57bb2',
    name: 'ESAB',
    slug: 'esab',
    logo_url: '/images/brands/esab.png',
    description: 'Welding and cutting equipment and consumables.',
    is_featured: true,
    display_order: 2
  },
  {
    id: '7e59648d-8b35-46d4-a33e-c108ac4b167a',
    name: 'KARAM',
    slug: 'karam',
    logo_url: '/images/brands/karam.png',
    description: 'Personal protective equipment and fall protection.',
    is_featured: true,
    display_order: 3
  },
  {
    id: '2a8a8165-8b35-46d4-a33e-c108ac4b167b',
    name: 'Havells',
    slug: 'havells',
    logo_url: '/images/brands/havells.png',
    description: 'Industrial and domestic electrical equipment.',
    is_featured: true,
    display_order: 4
  },
  {
    id: '1b9c928d-8b35-46d4-a33e-c108ac4b167c',
    name: 'L&T',
    slug: 'l-and-t',
    logo_url: '/images/brands/l-and-t.png',
    description: 'Heavy industrial electrical and construction machinery.',
    is_featured: true,
    display_order: 5
  }
];

export function getMergedBrands(dbBrands: any[]): Brand[] {
  const merged: Brand[] = [];
  
  LOCAL_BRANDS.forEach(localBrand => {
    const dbMatch = dbBrands.find(b => b.slug === localBrand.slug);
    merged.push({
      ...localBrand,
      id: dbMatch ? dbMatch.id : localBrand.id,
      description: dbMatch ? (dbMatch.description || localBrand.description) : localBrand.description,
      is_featured: dbMatch ? dbMatch.is_featured : localBrand.is_featured,
      display_order: dbMatch ? dbMatch.display_order : localBrand.display_order
    });
  });
  
  dbBrands.forEach(dbBrand => {
    const localMatch = LOCAL_BRANDS.find(b => b.slug === dbBrand.slug);
    if (!localMatch) {
      merged.push({
        id: dbBrand.id,
        name: dbBrand.name,
        slug: dbBrand.slug,
        logo_url: dbBrand.logo_url,
        description: dbBrand.description,
        is_featured: dbBrand.is_featured,
        display_order: dbBrand.display_order
      });
    }
  });
  
  return merged.sort((a, b) => a.display_order - b.display_order);
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  display_order: number;
  created_at?: string;
  parent?: Category | null;
}

export const LOCAL_CATEGORIES: Category[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Industrial Tools',
    slug: 'industrial-tools',
    description: 'Power Tools, Hand Tools, Pneumatic Tools, Hydraulic Tools. High-performance tools engineered for industrial manufacturing, assembly, and heavy-duty applications.',
    icon_url: '/images/categories/industrial-tools.png',
    parent_id: null,
    display_order: 1
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Hand Tools',
    slug: 'hand-tools',
    description: 'Pliers, Screwdrivers, Wrenches & Spanners, Hammers, Chisels, Saws. Professional-grade manual tools for precision, durability, and daily mechanical tasks.',
    icon_url: '/images/categories/hand-tools.png',
    parent_id: null,
    display_order: 2
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Power Tools',
    slug: 'power-tools',
    description: 'Drills, Grinders, Rotary Hammers, Demolition Hammers, Sanders, Polishers. Electric and cordless power tools offering high torque, reliability, and precision for professional trades.',
    icon_url: '/images/categories/power-tools.png',
    parent_id: null,
    display_order: 3
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Welding',
    slug: 'welding',
    description: 'Welding Machines, Welding Electrodes, Filler Wires, TIG Torches, MIG Guns. Industrial welding equipment, electrodes, filler materials, and accessories for robust metal fabrication.',
    icon_url: '/images/categories/welding.png',
    parent_id: null,
    display_order: 4
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Safety Equipment',
    slug: 'safety-equipment',
    description: 'Safety Helmets, Safety Harnesses, Safety Goggles, Safety Shoes, Ear Protection, Protective Gloves. Certified personal protective equipment (PPE) designed to ensure maximum safety on site.',
    icon_url: '/images/categories/safety-equipment.png',
    parent_id: null,
    display_order: 5
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Electrical',
    slug: 'electrical',
    description: 'House Wires, Industrial Cables, Flexible Cables, Switchgears, Contactors. Premium electrical wiring, heavy-duty industrial cables, and control gear for power distribution.',
    icon_url: '/images/categories/electrical.png',
    parent_id: null,
    display_order: 6
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Construction Materials',
    slug: 'construction-materials',
    description: 'Wire Ropes, Synthetic Ropes, Chains & Slings, Shackles, Turnbuckles. High-strength lifting rigging, wire ropes, chains, and structural materials for site construction.',
    icon_url: '/images/categories/construction-materials.png',
    parent_id: null,
    display_order: 7
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Abrasives',
    slug: 'abrasives',
    description: 'Cutting Discs, Grinding Wheels, Flap Discs, Sandpaper, Wire Brushes. High-performance cutting, grinding, and finishing abrasives for precise metal and stone work.',
    icon_url: '/images/categories/abrasives.png',
    parent_id: null,
    display_order: 8
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Industrial Consumables',
    slug: 'industrial-consumables',
    description: 'Welding Consumables, Abrasive Consumables, Adhesives & Sealants, Lubricants, Cleaning Agents. Essential day-to-day workshop consumables, chemical adhesives, sealants, and maintenance supplies.',
    icon_url: '/images/categories/industrial-consumables.png',
    parent_id: null,
    display_order: 9
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Hardware Products',
    slug: 'hardware-products',
    description: 'Bolts & Nuts, Screws & Anchors, Clamps & Brackets, Washers, Rivets. Industrial-grade fasteners, structural hardware, anchors, and fixing products.',
    icon_url: '/images/categories/hardware-products.png',
    parent_id: null,
    display_order: 10
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Measuring Instruments',
    slug: 'measuring-instruments',
    description: 'Multimeters, Clamp Meters, Laser Meters, Vernier Calipers, Micrometers. High-accuracy electrical and dimensional measurement tools for testing and calibration.',
    icon_url: '/images/categories/measuring-instruments.png',
    parent_id: null,
    display_order: 11
  }
];

export function getMergedCategories(dbCategories: any[]): Category[] {
  const merged: Category[] = [];
  
  LOCAL_CATEGORIES.forEach(localCat => {
    const dbMatch = dbCategories.find(c => c.slug === localCat.slug);
    merged.push({
      ...localCat,
      id: dbMatch ? dbMatch.id : localCat.id,
      description: dbMatch ? (dbMatch.description || localCat.description) : localCat.description,
      icon_url: dbMatch ? (dbMatch.icon_url || localCat.icon_url) : localCat.icon_url,
      parent_id: dbMatch ? dbMatch.parent_id : localCat.parent_id,
      display_order: dbMatch ? dbMatch.display_order : localCat.display_order
    });
  });
  
  dbCategories.forEach(dbCat => {
    const localMatch = LOCAL_CATEGORIES.find(c => c.slug === dbCat.slug);
    if (!localMatch) {
      merged.push({
        id: dbCat.id,
        name: dbCat.name,
        slug: dbCat.slug,
        description: dbCat.description,
        icon_url: dbCat.icon_url,
        parent_id: dbCat.parent_id,
        display_order: dbCat.display_order
      });
    }
  });
  
  return merged.sort((a, b) => a.display_order - b.display_order);
}


