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

