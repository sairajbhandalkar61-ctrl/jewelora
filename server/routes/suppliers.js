const router = require("express").Router();
const pool = require("../config/db");

// GET all suppliers with procurement summary
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        COUNT(p.id) as total_orders_count,
        COALESCE(SUM(p.total_amount), 0) as total_procurement_value,
        MAX(p.purchase_date) as last_order_date
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id
      GROUP BY s.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET single supplier with order history
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Supplier not found" });

    const supplier = rows[0];

    const [orders] = await pool.query(
      `SELECT p.*, j.name as jewellery_name, j.category as jewellery_category, j.sku as jewellery_sku
       FROM purchases p
       LEFT JOIN jewellery j ON p.jewellery_id = j.id
       WHERE p.supplier_id = ?
       ORDER BY p.purchase_date DESC`,
      [req.params.id]
    );

    const totalValue = orders.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

    res.json({
      ...supplier,
      total_procurement_value: totalValue,
      orders_count: orders.length,
      orders
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create supplier
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const [r] = await pool.query(
      "INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)",
      [name, phone || "", email || "", address || ""]
    );
    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT update supplier
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    await pool.query(
      "UPDATE suppliers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?",
      [name, phone || "", email || "", address || "", req.params.id]
    );
    const [rows] = await pool.query("SELECT * FROM suppliers WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE supplier
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM suppliers WHERE id = ?", [req.params.id]);
    res.json({ message: "Supplier deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
