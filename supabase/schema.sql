-- =============================================
-- Shri Siddhi Vinayak Trading Co.
-- Database Schema for Supabase
-- Run this in your Supabase SQL Editor
-- This script is safe to run multiple times
-- =============================================

-- BRANDS table
CREATE TABLE IF NOT EXISTS brands (
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
CREATE TABLE IF NOT EXISTS categories (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS enquiries (
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
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_featured ON brands(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

-- Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public can read brands, categories, products
DROP POLICY IF EXISTS "Public read brands" ON brands;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- Public can insert enquiries
DROP POLICY IF EXISTS "Public insert enquiries" ON enquiries;
CREATE POLICY "Public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);

-- Authenticated users can do everything
DROP POLICY IF EXISTS "Admin write brands" ON brands;
CREATE POLICY "Admin write brands" ON brands FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin write categories" ON categories;
CREATE POLICY "Admin write categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin write products" ON products;
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage enquiries" ON enquiries;
CREATE POLICY "Admin manage enquiries" ON enquiries FOR ALL USING (auth.role() = 'authenticated');

-- Updated_at trigger for products
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Storage RLS Policies
-- =============================================

-- Allow public read access to media buckets
DROP POLICY IF EXISTS "Allow public read access to media buckets" ON storage.objects;
CREATE POLICY "Allow public read access to media buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to upload files
DROP POLICY IF EXISTS "Allow authenticated inserts" ON storage.objects;
CREATE POLICY "Allow authenticated inserts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to update files
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('product-images', 'brand-logos', 'category-icons'))
WITH CHECK (bucket_id IN ('product-images', 'brand-logos', 'category-icons'));

-- Allow authenticated users (admin) to delete files
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
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

-- Seed Categories data
DELETE FROM categories WHERE slug = 'industrial-tools';

INSERT INTO categories (id, name, slug, description, icon_url, display_order)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Hand Tools', 'hand-tools', 'Pliers, Screwdrivers, Wrenches & Spanners, Hammers, Chisels, Saws. Professional-grade manual tools for precision, durability, and daily mechanical tasks.', '/images/categories/hand-tools.png', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 'Power Tools', 'power-tools', 'Drills, Grinders, Rotary Hammers, Demolition Hammers, Sanders, Polishers. Electric and cordless power tools offering high torque, reliability, and precision for professional trades.', '/images/categories/power-tools.png', 2),
  ('550e8400-e29b-41d4-a716-446655440004', 'Welding', 'welding', 'Welding Machines, Welding Electrodes, Filler Wires, TIG Torches, MIG Guns. Industrial welding equipment, electrodes, filler materials, and accessories for robust metal fabrication.', '/images/categories/welding.png', 3),
  ('550e8400-e29b-41d4-a716-446655440005', 'Safety Equipment', 'safety-equipment', 'Safety Helmets, Safety Harnesses, Safety Goggles, Safety Shoes, Ear Protection, Protective Gloves. Certified personal protective equipment (PPE) designed to ensure maximum safety on site.', '/images/categories/safety-equipment.png', 4),
  ('550e8400-e29b-41d4-a716-446655440006', 'Electrical', 'electrical', 'House Wires, Industrial Cables, Flexible Cables, Switchgears, Contactors. Premium electrical wiring, heavy-duty industrial cables, and control gear for power distribution.', '/images/categories/electrical.png', 5),
  ('550e8400-e29b-41d4-a716-446655440007', 'Construction Materials', 'construction-materials', 'Wire Ropes, Synthetic Ropes, Chains & Slings, Shackles, Turnbuckles. High-strength lifting rigging, wire ropes, chains, and structural materials for site construction.', '/images/categories/construction-materials.png', 6),
  ('550e8400-e29b-41d4-a716-446655440008', 'Abrasives', 'abrasives', 'Cutting Discs, Grinding Wheels, Flap Discs, Sandpaper, Wire Brushes. High-performance cutting, grinding, and finishing abrasives for precise metal and stone work.', '/images/categories/abrasives.png', 7),
  ('550e8400-e29b-41d4-a716-446655440009', 'Industrial Consumables', 'industrial-consumables', 'Welding Consumables, Abrasive Consumables, Adhesives & Sealants, Lubricants, Cleaning Agents. Essential day-to-day workshop consumables, chemical adhesives, sealants, and maintenance supplies.', '/images/categories/industrial-consumables.png', 8),
  ('550e8400-e29b-41d4-a716-446655440010', 'Hardware Products', 'hardware-products', 'Bolts & Nuts, Screws & Anchors, Clamps & Brackets, Washers, Rivets. Industrial-grade fasteners, structural hardware, anchors, and fixing products.', '/images/categories/hardware-products.png', 9),
  ('550e8400-e29b-41d4-a716-446655440011', 'Measuring Instruments', 'measuring-instruments', 'Multimeters, Clamp Meters, Laser Meters, Vernier Calipers, Micrometers. High-accuracy electrical and dimensional measurement tools for testing and calibration.', '/images/categories/measuring-instruments.png', 10)
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  display_order = EXCLUDED.display_order;
