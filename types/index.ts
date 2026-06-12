export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  parent_id: string | null;
  display_order: number;
  created_at: string;
  parent?: Category | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specifications: Record<string, string> | null;
  price_display: string | null;
  sku: string | null;
  is_featured: boolean;
  is_available: boolean;
  brand_id: string | null;
  category_id: string | null;
  images: string[];
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  brand: Pick<Brand, 'id' | 'name' | 'slug' | 'logo_url'> | null;
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  product_id: string | null;
  product_name: string | null;
  status: 'new' | 'contacted' | 'resolved';
  created_at: string;
}

// Form input types
export interface BrandFormInput {
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  display_order: number;
}

export interface CategoryFormInput {
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  display_order: number;
}

export interface ProductFormInput {
  name: string;
  slug: string;
  description: string;
  specifications: Record<string, string>;
  price_display: string;
  sku: string;
  is_featured: boolean;
  is_available: boolean;
  brand_id: string;
  category_id: string;
}

export interface EnquiryFormInput {
  name: string;
  phone: string;
  email: string;
  message: string;
  product_id?: string;
  product_name?: string;
}
