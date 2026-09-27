const router = require("express").Router();
const pool = require("../config/db");

// GET all purchases
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        s.name as supplier_name,
        s.phone as supplier_phone,
        j.name as jewellery_name,
        j.sku as jewellery_sku,
        j.category as jewellery_category,
        j.purity as jewellery_purity
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN jewellery j ON p.jewellery_id = j.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET single purchase
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*, 
        s.name as supplier_name,
        s.phone as supplier_phone,
        s.email as supplier_email,
        s.address as supplier_address,
        j.name as jewellery_name,
        j.sku as jewellery_sku,
        j.category as jewellery_category,
        j.weight as jewellery_weight,
        j.purity as jewellery_purity
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN jewellery j ON p.jewellery_id = j.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: "Purchase record not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST new purchase (with transaction to update inventory)
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { jewellery_id, supplier_id, quantity, total_amount, invoice_ref, payment_status } = req.body;
    const qty = Number(quantity) || 1;
    const amount = Number(total_amount) || 0;
    const invRef = invoice_ref || `PUR-${Date.now().toString().slice(-6)}`;
    const status = payment_status || "Paid";

    await conn.beginTransaction();

    const [r] = await conn.query(
      `INSERT INTO purchases (jewellery_id, supplier_id, quantity, total_amount, purchase_date, invoice_ref, payment_status)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [jewellery_id, supplier_id || null, qty, amount, invRef, status]
    );

    if (jewellery_id) {
      await conn.query(
        "UPDATE jewellery SET quantity = quantity + ? WHERE id = ?",
        [qty, jewellery_id]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Purchase recorded and inventory updated successfully", id: r.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
