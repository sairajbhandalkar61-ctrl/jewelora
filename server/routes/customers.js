const router = require("express").Router();
const pool = require("../config/db");

// GET all customers with summary totals
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*,
        COUNT(s.id) as total_purchases_count,
        COALESCE(SUM(s.total_amount), 0) as total_spent,
        MAX(s.sale_date) as last_purchase_date
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET single customer with full purchase history and insights
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Customer not found" });

    const customer = rows[0];

    // Fetch customer's purchases / sales
    const [history] = await pool.query(
      `SELECT s.*, j.name as jewellery_name, j.category as jewellery_category, j.sku as jewellery_sku
       FROM sales s
       LEFT JOIN jewellery j ON s.jewellery_id = j.id
       WHERE s.customer_id = ?
       ORDER BY s.sale_date DESC`,
      [req.params.id]
    );

    const totalSpent = history.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

    // Calculate favorite category
    const categoryCounts = {};
    history.forEach(item => {
      const cat = item.jewellery_category || "Uncategorized";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    let favoriteCategory = "None";
    let maxCount = 0;
    for (const [cat, cnt] of Object.entries(categoryCounts)) {
      if (cnt > maxCount) {
        maxCount = cnt;
        favoriteCategory = cat;
      }
    }

    res.json({
      ...customer,
      total_spent: totalSpent,
      purchase_count: history.length,
      favorite_category: favoriteCategory,
      history
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create customer
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const [r] = await pool.query(
      "INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)",
      [name, phone || "", email || "", address || ""]
    );
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT update customer
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    await pool.query(
      "UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?",
      [name, phone || "", email || "", address || "", req.params.id]
    );
    const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    res.json({ message: "Customer deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
