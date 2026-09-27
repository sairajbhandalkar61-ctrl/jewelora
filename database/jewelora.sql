-- ==============================================================================
-- JEWELORA – INTELLIGENT JEWELLERY BUSINESS MANAGEMENT SYSTEM
-- Master Production Database Schema & Seed Data
-- Compatible with MySQL 8.0+, MariaDB 10.4+, Aiven, TiDB Cloud, Railway, PlanetScale
-- ==============================================================================

-- Create database if creating locally (omit or comment out if using pre-allocated cloud DB)
CREATE DATABASE IF NOT EXISTS jewelora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jewelora_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS jewellery;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. SUPPLIERS TABLE (Bullion Vendors & Gemstone Merchants)
-- ------------------------------------------------------------------------------
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(120),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_supplier_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. CUSTOMERS TABLE (Patrons, HNI Clients & Walk-in Guests)
-- ------------------------------------------------------------------------------
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(120),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_phone (phone),
  INDEX idx_customer_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. JEWELLERY TABLE (Vault Inventory, Physical Specs & Pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE jewellery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(60) UNIQUE,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Jewellery',
  material VARCHAR(80) DEFAULT 'Gold',
  weight DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  purity VARCHAR(30) DEFAULT '22K',
  quantity INT NOT NULL DEFAULT 0,
  making_charges DECIMAL(12,2) DEFAULT 0.00,
  stone_charges DECIMAL(12,2) DEFAULT 0.00,
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  selling_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_jewellery_category (category),
  INDEX idx_jewellery_material (material),
  INDEX idx_jewellery_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. PURCHASES TABLE (Procurement Inward Log)
-- ------------------------------------------------------------------------------
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jewellery_id INT,
  supplier_id INT,
  quantity INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  invoice_ref VARCHAR(80),
  payment_status VARCHAR(30) DEFAULT 'Paid',
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jewellery_id) REFERENCES jewellery(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
  INDEX idx_purchases_date (purchase_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. SALES TABLE (Point-of-Sale Invoices & Revenue Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(80) UNIQUE,
  jewellery_id INT,
  customer_id INT,
  quantity INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  discount DECIMAL(12,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jewellery_id) REFERENCES jewellery(id) ON DELETE SET NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_sales_date (sale_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- CERTIFIED SEED DATA
-- ==============================================================================

-- Suppliers
INSERT INTO suppliers (name, phone, email, address) VALUES
('Shree Bullion & Refinery Pvt Ltd', '+91 98765 43210', 'orders@shreebullion.com', 'Zaveri Bazaar, Mumbai, MH'),
('Mahalaxmi Gold Works', '+91 98765 01234', 'procurement@mahalaxmigold.in', 'Jewellery Market, Sangli, MH'),
('Kohinoor Gemstone Importers', '+91 98220 11223', 'sales@kohinoorgems.com', 'Johari Bazaar, Jaipur, RJ');

-- Customers
INSERT INTO customers (name, phone, email, address) VALUES
('Rajeshwar Deshmukh', '+91 98230 45678', 'rajeshwar.d@gmail.com', 'Prabhat Road, Pune, MH'),
('Ananya Singhania', '+91 98110 98765', 'ananya.singh@outlook.com', 'Bandra West, Mumbai, MH'),
('Vikramaditya Roy', '+91 98300 12345', 'vroy@calcutta-holdings.in', 'Park Street, Kolkata, WB');

-- Curated Certified Jewellery Collection
INSERT INTO jewellery (sku, name, category, material, weight, purity, quantity, making_charges, stone_charges, purchase_price, selling_price, image_url, description) VALUES
('JWL-BR-001', 'Royal Heritage Kundan Bridal Choker', 'Necklace', 'Gold + Kundan', 48.50, '22K', 4, 18500.00, 12000.00, 310000.00, 365000.00, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80', 'Exquisite handcrafted bridal choker necklace featuring authentic Meenakari work with certified Kundan gemstones.'),
('JWL-SL-002', 'Imperial Solitaire Diamond Ring', 'Ring', 'Gold + Diamond', 5.20, '18K', 9, 8500.00, 24000.00, 85000.00, 105000.00, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80', 'VS1 clarity certified brilliant-cut diamond mounted on a sleek 18K white-yellow gold band.'),
('JWL-TP-003', 'Mayur Traditional Jhumka Earrings', 'Earrings', 'Gold', 16.40, '22K', 6, 6200.00, 0.00, 105000.00, 122000.00, 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80', 'Intricately filigreed traditional peacock temple jhumkas with hanging gold bead fringes and hallmarked screw posts.'),
('JWL-CH-004', 'Classic Royal Figaro Gold Chain', 'Chain', 'Gold', 22.80, '22K', 8, 4500.00, 0.00, 148000.00, 168000.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80', 'High-polish hand-linked 22K Figaro chain with lobster clasp mechanism for enduring luxury and daily poise.'),
('JWL-BG-005', 'Navratna Diamond Cut Bangles (Pair)', 'Bangles', 'Gold', 34.20, '22K', 5, 11000.00, 4500.00, 225000.00, 258000.00, 'https://images.unsplash.com/photo-1611591475870-8025287f7396?w=600&auto=format&fit=crop&q=80', 'Pair of diamond-faceted 22K gold kadas with floral hand-carving and safety lock clasp.'),
('JWL-PT-006', 'Platinum Crown Men''s Signet Ring', 'Ring', 'Platinum', 9.10, '950 Platinum', 7, 7200.00, 8000.00, 72000.00, 89000.00, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80', 'Substantial 950 purity platinum ring with brushed top surface and micro-pavé accent diamonds.'),
('JWL-BR-007', 'Tennis Bracelet with VVS Diamonds', 'Bracelet', 'Gold + Diamond', 14.20, '18K', 2, 9500.00, 48000.00, 165000.00, 215000.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80', 'Timeless continuous diamond line bracelet featuring 3.5 carats total weight of certified round brilliant diamonds.'),
('JWL-PD-008', 'Ganeshji Diamond Temple Pendant', 'Pendant', 'Gold + Diamond', 8.60, '22K', 1, 3800.00, 9200.00, 62000.00, 74500.00, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80', 'Sacred Lord Ganesha pendant with pave diamond accents and authentic BIS hallmarking.'),
('JWL-SV-009', 'Antique Sterling Silver Aarti Thali', 'Silverware', 'Silver', 280.00, '925 Silver', 4, 4500.00, 0.00, 32000.00, 41000.00, 'https://images.unsplash.com/photo-1611591475870-8025287f7396?w=600&auto=format&fit=crop&q=80', 'Pure 925 sterling silver puja thali with intricate floral borders and authentic silver hallmark stamp.'),
('JWL-NK-010', 'Kasumala Southern Temple Choker', 'Necklace', 'Gold', 55.40, '22K', 2, 21000.00, 0.00, 360000.00, 420000.00, 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80', 'Traditional coin necklace featuring Goddess Lakshmi motifs across 42 hand-struck coins.');

-- Procurement Inward Orders
INSERT INTO purchases (jewellery_id, supplier_id, quantity, total_amount, invoice_ref, payment_status, purchase_date) VALUES
(1, 1, 2, 620000.00, 'BILL-SB-2026-081', 'Paid', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, 5, 425000.00, 'BILL-MG-2026-119', 'Paid', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 3, 2, 330000.00, 'BILL-KG-2026-004', 'Paid', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Showroom Sales Invoices
INSERT INTO sales (invoice_no, jewellery_id, customer_id, quantity, total_amount, payment_method, discount, tax_amount, sale_date) VALUES
('INV-2026-0001', 1, 1, 1, 365000.00, 'Bank Wire', 5000.00, 10500.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('INV-2026-0002', 3, 2, 1, 122000.00, 'UPI / QR', 2000.00, 3500.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('INV-2026-0003', 4, 3, 1, 168000.00, 'Credit Card', 0.00, 4900.00, NOW());
