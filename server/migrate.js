const pool = require("./config/db");

async function columnExists(table, column) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  return rows[0].count > 0;
}

async function addColumnIfNotExists(table, column, definition) {
  const exists = await columnExists(table, column);
  if (!exists) {
    console.log(`Adding column ${column} to table ${table}...`);
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function migrate() {
  console.log("Starting Jewelora schema migration...");
  try {
    // 1. Jewellery enhancements
    await addColumnIfNotExists("jewellery", "sku", "VARCHAR(60) DEFAULT NULL");
    await addColumnIfNotExists("jewellery", "description", "TEXT DEFAULT NULL");
    await addColumnIfNotExists("jewellery", "image_url", "TEXT DEFAULT NULL");
    await addColumnIfNotExists("jewellery", "making_charges", "DECIMAL(12,2) DEFAULT 0");
    await addColumnIfNotExists("jewellery", "stone_charges", "DECIMAL(12,2) DEFAULT 0");

    // 2. Sales enhancements
    await addColumnIfNotExists("sales", "invoice_no", "VARCHAR(60) DEFAULT NULL");
    await addColumnIfNotExists("sales", "payment_method", "VARCHAR(50) DEFAULT 'Cash'");
    await addColumnIfNotExists("sales", "discount", "DECIMAL(12,2) DEFAULT 0");
    await addColumnIfNotExists("sales", "tax_amount", "DECIMAL(12,2) DEFAULT 0");

    // 3. Purchases enhancements
    await addColumnIfNotExists("purchases", "invoice_ref", "VARCHAR(60) DEFAULT NULL");
    await addColumnIfNotExists("purchases", "payment_status", "VARCHAR(50) DEFAULT 'Paid'");

    // Update existing jewellery with SKUs if missing
    await pool.query("UPDATE jewellery SET sku = CONCAT('JWL-', LPAD(id, 4, '0')) WHERE sku IS NULL OR sku = ''");
    
    // Seed high quality showroom items if count <= 4
    const [[countRow]] = await pool.query("SELECT COUNT(*) as cnt FROM jewellery");
    if (countRow.cnt <= 4) {
      console.log("Seeding premium jewellery showroom inventory...");
      const luxuryItems = [
        [
          "Royal Heritage Polki Choker", "Necklace", "Gold", 42.50, "22K", 2, 280000, 325000,
          "JWL-0005", "Intricate handcrafted 22K yellow gold choker embellished with uncut polki diamonds and south sea pearls.",
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
          18000, 12000
        ],
        [
          "Solitaire Diamond Engagement Ring", "Ring", "Platinum", 3.80, "18K", 4, 95000, 120000,
          "JWL-0006", "Brilliant 1.2 carat round diamond mounted on 950 platinum four-prong setting with pavé band.",
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
          8500, 25000
        ],
        [
          "Peacock Antique Temple Kada", "Bangles", "Gold", 36.20, "22K", 5, 230000, 265000,
          "JWL-0007", "Traditional South Indian antique finish nakshi bangle featuring embossed peacock motifs.",
          "https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80",
          15000, 4500
        ],
        [
          "Emerald Cascade Chandelier Earrings", "Earrings", "Gold + Diamond", 14.20, "18K", 3, 115000, 142000,
          "JWL-0008", "Fine 18K yellow gold drop earrings encrusted with natural Zambian emeralds and brilliant diamonds.",
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
          9500, 18000
        ],
        [
          "Diamond Floral Solitaire Pendant", "Pendant", "Gold + Diamond", 5.40, "18K", 6, 42000, 56000,
          "JWL-0009", "Delicate floral pendant studded with micro pavé diamonds centered with a shimmering solitaire.",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
          4000, 9500
        ],
        [
          "Italian Mesh Gold Bracelet", "Bracelet", "Gold", 18.50, "22K", 1, 118000, 138000,
          "JWL-0010", "Contemporary flexible mesh weave bracelet with secure magnetic clasp lock.",
          "https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80",
          8000, 2000
        ]
      ];

      for (const item of luxuryItems) {
        await pool.query(
          `INSERT INTO jewellery (name, category, material, weight, purity, quantity, purchase_price, selling_price, sku, description, image_url, making_charges, stone_charges)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }
    }

    // Set sample images for existing items if they don't have one
    await pool.query(`
      UPDATE jewellery SET 
        sku = IF(sku IS NULL OR sku = '', CONCAT('JWL-', LPAD(id, 4, '0')), sku),
        image_url = CASE 
          WHEN category = 'Ring' AND (image_url IS NULL OR image_url = '') THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
          WHEN category = 'Necklace' AND (image_url IS NULL OR image_url = '') THEN 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
          WHEN category = 'Earrings' AND (image_url IS NULL OR image_url = '') THEN 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
          WHEN category = 'Chain' AND (image_url IS NULL OR image_url = '') THEN 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80'
          ELSE COALESCE(image_url, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80')
        END
    `);

    // Ensure sample sales have invoice numbers
    await pool.query("UPDATE sales SET invoice_no = CONCAT('INV-2026-', LPAD(id, 4, '0')) WHERE invoice_no IS NULL OR invoice_no = ''");
    await pool.query("UPDATE sales SET payment_method = 'UPI' WHERE payment_method IS NULL OR payment_method = ''");

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
