-- =============================================
-- Shri Siddhi Vinayak Trading Co.
-- Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- =============================================

-- BRANDS table
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  specifications JSONB,
  price_display TEXT,
  sku TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  primary_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENQUIRIES table
CREATE TABLE enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_featured ON brands(is_featured) WHERE is_featured = true;
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = true;
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created ON enquiries(created_at DESC);

-- Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public can read brands, categories, products
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- Public can insert enquiries
CREATE POLICY "Public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);

-- Authenticated users can do everything
CREATE POLICY "Admin write brands" ON brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage enquiries" ON enquiries FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Storage RLS Policies
-- =============================================

-- Allow public read access to media buckets
CREATE POLICY "Allow public read access to media buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to upload files
CREATE POLICY "Allow authenticated inserts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('product-images', 'brand-logos', 'category-icons'))
WITH CHECK (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Seed Brands data
INSERT INTO brands (id, name, slug, logo_url, is_featured, display_order)
VALUES 
  ('702f8471-1c63-41bd-b651-d5e859320d1f', 'Bosch', 'bosch', '/images/brands/bosch.png', true, 1),
  ('fc2e1f0d-7e36-4fbc-ade5-a1acbee57bb2', 'ESAB', 'esab', '/images/brands/esab.png', true, 2),
  ('7e59648d-8b35-46d4-a33e-c108ac4b167a', 'KARAM', 'karam', '/images/brands/karam.png', true, 3),
  ('2a8a8165-8b35-46d4-a33e-c108ac4b167b', 'Havells', 'havells', '/images/brands/havells.png', true, 4),
  ('1b9c928d-8b35-46d4-a33e-c108ac4b167c', 'L&T', 'l-and-t', '/images/brands/l-and-t.png', true, 5)
ON CONFLICT (slug) 
DO UPDATE SET 
  logo_url = EXCLUDED.logo_url,
  is_featured = EXCLUDED.is_featured,
  display_order = EXCLUDED.display_order;


