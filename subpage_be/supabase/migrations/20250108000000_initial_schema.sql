-- Initial schema for Subpage print-on-demand platform
-- Created: 2025-01-08

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRODUCT COLORS TABLE
-- =====================================================
CREATE TABLE product_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  color_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default colors from colors.json
INSERT INTO product_colors (color_id, name, hex_code) VALUES
  ('white', 'White', '#ffffff'),
  ('black', 'Black', '#000000'),
  ('navy', 'Navy', '#1e2847'),
  ('grey', 'Grey', '#9e9e9e'),
  ('red', 'Red', '#ff0000'),
  ('darkblue', 'Dark Blue', '#003366'),
  ('darkgreen', 'Dark Green', '#006400'),
  ('cream', 'Cream', '#f5deb3');

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  product_type TEXT NOT NULL, -- 'tshirt', 'hoodie', etc.
  gender TEXT, -- 'male', 'female', 'unisex'
  fit TEXT, -- 'regular', 'slim', 'oversized'
  base_cost DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default product
INSERT INTO products (name, product_type, gender, fit, base_cost) VALUES
  ('Essentials Classic Tee', 'tshirt', 'unisex', 'regular', 20.00);

-- =====================================================
-- 3. CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campaign info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT CHECK (char_length(description) <= 150),
  creator_name TEXT NOT NULL,

  -- Pricing
  base_cost DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  selling_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_cost + profit) STORED,
  currency TEXT NOT NULL DEFAULT 'GBP', -- 'GBP', 'USD', 'EUR'

  -- Duration & Goals
  campaign_duration INTEGER NOT NULL DEFAULT 14, -- days
  sales_goal INTEGER NOT NULL DEFAULT 1,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'completed', 'cancelled'

  -- Featured product & color
  featured_product_id UUID REFERENCES products(id),
  featured_color_id UUID REFERENCES product_colors(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  launched_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT valid_currency CHECK (currency IN ('GBP', 'USD', 'EUR')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  CONSTRAINT valid_duration CHECK (campaign_duration >= 7 AND campaign_duration <= 365),
  CONSTRAINT valid_sales_goal CHECK (sales_goal >= 1 AND sales_goal <= 1250)
);

-- =====================================================
-- 4. CAMPAIGN ARTWORKS TABLE
-- =====================================================
CREATE TABLE campaign_artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Artwork details
  side TEXT NOT NULL, -- 'front' or 'back'
  storage_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size INTEGER, -- bytes
  mime_type TEXT,
  width INTEGER,
  height INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_side CHECK (side IN ('front', 'back')),
  CONSTRAINT unique_campaign_side UNIQUE (campaign_id, side)
);

-- =====================================================
-- 5. CAMPAIGN COLORS TABLE
-- =====================================================
CREATE TABLE campaign_colors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES product_colors(id),
  is_featured BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_campaign_color UNIQUE (campaign_id, color_id)
);

-- =====================================================
-- 6. CAMPAIGN PRODUCTS TABLE
-- =====================================================
CREATE TABLE campaign_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_campaign_product UNIQUE (campaign_id, product_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Campaigns indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Campaign artworks indexes
CREATE INDEX idx_campaign_artworks_campaign_id ON campaign_artworks(campaign_id);

-- Campaign colors indexes
CREATE INDEX idx_campaign_colors_campaign_id ON campaign_colors(campaign_id);

-- Campaign products indexes
CREATE INDEX idx_campaign_products_campaign_id ON campaign_products(campaign_id);

-- Product colors indexes
CREATE INDEX idx_product_colors_color_id ON product_colors(color_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaigns table
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique slug from title
CREATE OR REPLACE FUNCTION generate_unique_slug(title TEXT, campaign_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');

  final_slug := base_slug;

  -- Check for uniqueness and append counter if needed
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM campaigns
      WHERE slug = final_slug
      AND (campaign_id IS NULL OR id != campaign_id)
    ) THEN
      RETURN final_slug;
    END IF;

    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to set campaign end date based on start date and duration
CREATE OR REPLACE FUNCTION set_campaign_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.starts_at IS NOT NULL AND NEW.campaign_duration IS NOT NULL THEN
    NEW.ends_at := NEW.starts_at + (NEW.campaign_duration || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set campaign dates
CREATE TRIGGER set_campaign_dates_trigger
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION set_campaign_dates();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - CAMPAIGNS
-- =====================================================

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view active campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active');

-- =====================================================
-- RLS POLICIES - CAMPAIGN ARTWORKS
-- =====================================================

-- Users can view artworks of their own campaigns
CREATE POLICY "Users can view own campaign artworks"
  ON campaign_artworks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_artworks.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Users can insert artworks to their own campaigns
CREATE POLICY "Users can insert own campaign artworks"
  ON campaign_artworks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_artworks.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Users can delete artworks from their own campaigns
CREATE POLICY "Users can delete own campaign artworks"
  ON campaign_artworks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_artworks.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Public can view artworks of active campaigns
CREATE POLICY "Anyone can view active campaign artworks"
  ON campaign_artworks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_artworks.campaign_id
      AND campaigns.status = 'active'
    )
  );

-- =====================================================
-- RLS POLICIES - CAMPAIGN COLORS
-- =====================================================

-- Users can manage colors of their own campaigns
CREATE POLICY "Users can manage own campaign colors"
  ON campaign_colors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_colors.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Public can view colors of active campaigns
CREATE POLICY "Anyone can view active campaign colors"
  ON campaign_colors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_colors.campaign_id
      AND campaigns.status = 'active'
    )
  );

-- =====================================================
-- RLS POLICIES - CAMPAIGN PRODUCTS
-- =====================================================

-- Users can manage products of their own campaigns
CREATE POLICY "Users can manage own campaign products"
  ON campaign_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_products.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Public can view products of active campaigns
CREATE POLICY "Anyone can view active campaign products"
  ON campaign_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_products.campaign_id
      AND campaigns.status = 'active'
    )
  );

-- =====================================================
-- RLS POLICIES - PRODUCTS
-- =====================================================

-- Everyone can view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

-- =====================================================
-- RLS POLICIES - PRODUCT COLORS
-- =====================================================

-- Everyone can view product colors
CREATE POLICY "Anyone can view product colors"
  ON product_colors FOR SELECT
  TO PUBLIC
  USING (TRUE);

-- =====================================================
-- STORAGE BUCKET
-- =====================================================

-- Note: Storage bucket should be created via Supabase Dashboard or CLI
-- because the storage.buckets table schema varies by Supabase version
--
-- To create bucket manually:
-- 1. Go to: https://app.supabase.com/project/ewhabqbenhesnskznhut/storage/buckets
-- 2. Click "New bucket"
-- 3. Name: campaign-artworks
-- 4. Public: OFF
-- 5. Click "Create bucket"

-- Storage policies for campaign artworks
-- Note: These will only work after the bucket is created
DO $$
BEGIN
  -- Check if bucket exists before creating policies
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'campaign-artworks') THEN
    -- Users can upload their own campaign artworks
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload their own campaign artworks'
    ) THEN
      CREATE POLICY "Users can upload their own campaign artworks"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'campaign-artworks'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Users can view their own campaign artworks
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view their own campaign artworks'
    ) THEN
      CREATE POLICY "Users can view their own campaign artworks"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
          bucket_id = 'campaign-artworks'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Users can delete their own campaign artworks
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete their own campaign artworks'
    ) THEN
      CREATE POLICY "Users can delete their own campaign artworks"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
          bucket_id = 'campaign-artworks'
          AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    -- Public can view artworks from active campaigns
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view active campaign artworks'
    ) THEN
      CREATE POLICY "Public can view active campaign artworks"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'campaign-artworks');
    END IF;
  END IF;
END $$;

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE campaigns IS 'Main campaigns table - stores all print-on-demand campaigns';
COMMENT ON TABLE campaign_artworks IS 'Stores artwork files for campaigns (front and back designs)';
COMMENT ON TABLE campaign_colors IS 'Junction table for campaign color selections';
COMMENT ON TABLE campaign_products IS 'Junction table for campaign product selections';
COMMENT ON TABLE products IS 'Product catalog (t-shirts, hoodies, etc.)';
COMMENT ON TABLE product_colors IS 'Available product colors';

COMMENT ON COLUMN campaigns.slug IS 'URL-friendly unique identifier generated from title';
COMMENT ON COLUMN campaigns.selling_price IS 'Auto-calculated: base_cost + profit';
COMMENT ON COLUMN campaigns.status IS 'Campaign lifecycle: draft -> active -> completed/cancelled';
COMMENT ON COLUMN campaign_artworks.storage_path IS 'Path to file in Supabase Storage bucket';
