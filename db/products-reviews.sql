-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO product_categories (name, description, icon) VALUES
('Food & Beverage', 'Food, drinks, and snacks', 'utensils'),
('Electronics', 'Tech gadgets and electronics', 'laptop'),
('Books & Supplies', 'Textbooks and school supplies', 'book'),
('Clothing', 'Apparel and accessories', 'shirt'),
('Services', 'Various services offered', 'briefcase'),
('Health & Beauty', 'Health and beauty products', 'heart'),
('Sports & Recreation', 'Sports equipment and gear', 'activity'),
('Home & Living', 'Home decor and living essentials', 'home')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
