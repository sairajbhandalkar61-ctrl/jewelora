const router = require("express").Router();
const pool = require("../config/db");

// GET all jewellery items with optional search & filter
router.get("/", async (req, res) => {
  try {
    const { search, category, material, purity, stock_status } = req.query;
    let query = "SELECT * FROM jewellery WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (name LIKE ? OR sku LIKE ? OR category LIKE ? OR material LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }
    if (material && material !== "All") {
      query += " AND material = ?";
      params.push(material);
    }
    if (purity && purity !== "All") {
      query += " AND purity = ?";
      params.push(purity);
    }
    if (stock_status === "in_stock") {
      query += " AND quantity > 2";
    } else if (stock_status === "low_stock") {
      query += " AND quantity > 0 AND quantity <= 2";
    } else if (stock_status === "out_of_stock") {
      query += " AND quantity = 0";
    }

    query += " ORDER BY id DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET single jewellery item with transaction history
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jewellery WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Jewellery item not found" });

    const item = rows[0];

    // Fetch related recent sales
    const [sales] = await pool.query(
      `SELECT s.*, c.name as customer_name 
       FROM sales s 
       LEFT JOIN customers c ON s.customer_id = c.id 
       WHERE s.jewellery_id = ? 
       ORDER BY s.sale_date DESC LIMIT 5`,
      [req.params.id]
    );

    // Fetch related recent purchases
    const [purchases] = await pool.query(
      `SELECT p.*, s.name as supplier_name 
       FROM purchases p 
       LEFT JOIN suppliers s ON p.supplier_id = s.id 
       WHERE p.jewellery_id = ? 
       ORDER BY p.purchase_date DESC LIMIT 5`,
      [req.params.id]
    );

    res.json({
      ...item,
      recent_sales: sales,
      recent_purchases: purchases
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create jewellery
router.post("/", async (req, res) => {
  try {
    const {
      name, category, material, weight, purity, quantity,
      purchase_price, selling_price, sku, description, image_url,
      making_charges, stone_charges
    } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    // Auto-generate SKU if not provided
    const cleanSku = sku || `JWL-${Date.now().toString().slice(-4)}`;

    const [r] = await pool.query(
      `INSERT INTO jewellery 
       (name, category, material, weight, purity, quantity, purchase_price, selling_price, sku, description, image_url, making_charges, stone_charges)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category || "Ring",
        material || "Gold",
        Number(weight) || 0,
        purity || "22K",
        Number(quantity) || 0,
        Number(purchase_price) || 0,
        Number(selling_price) || 0,
        cleanSku,
        description || "",
        image_url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
        Number(making_charges) || 0,
        Number(stone_charges) || 0
      ]
    );

    const [rows] = await pool.query("SELECT * FROM jewellery WHERE id = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT update jewellery
router.put("/:id", async (req, res) => {
  try {
    const {
      name, category, material, weight, purity, quantity,
      purchase_price, selling_price, sku, description, image_url,
      making_charges, stone_charges
    } = req.body;

    await pool.query(
      `UPDATE jewellery SET 
        name = ?, category = ?, material = ?, weight = ?, purity = ?, quantity = ?,
        purchase_price = ?, selling_price = ?, sku = ?, description = ?, image_url = ?,
        making_charges = ?, stone_charges = ?
       WHERE id = ?`,
      [
        name,
        category || "Ring",
        material || "Gold",
        Number(weight) || 0,
        purity || "22K",
        Number(quantity) || 0,
        Number(purchase_price) || 0,
        Number(selling_price) || 0,
        sku || `JWL-${req.params.id}`,
        description || "",
        image_url || "",
        Number(making_charges) || 0,
        Number(stone_charges) || 0,
        req.params.id
      ]
    );

    const [rows] = await pool.query("SELECT * FROM jewellery WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Jewellery item not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE jewellery
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM jewellery WHERE id = ?", [req.params.id]);
    res.json({ message: "Jewellery item deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
