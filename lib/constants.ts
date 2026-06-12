export const SITE_CONFIG = {
  name: 'Shri Siddhi Vinayak Trading Co.',
  tagline: 'A House of Industrial Tools, Power Tools & Safety Equipment',
  description: 'Your trusted partner for industrial tools, electric power tools, welding accessories, project materials, and safety equipment in Godhra, Gujarat.',
  gst: '24AJSPC0245L1Z8',
  contact: {
    name: 'Harish Chaudhary',
    phone1: '96385 30020',
    phone2: '96385 30022',
    phone1Link: 'tel:+919638530020',
    phone2Link: 'tel:+919638530022',
    address: 'Godhra, Gujarat, India',
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
