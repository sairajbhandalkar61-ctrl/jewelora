const router = require("express").Router();
const pool = require("../config/db");

// GET all sales
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*, 
        c.name as customer_name,
        c.phone as customer_phone,
        j.name as jewellery_name,
        j.sku as jewellery_sku,
        j.category as jewellery_category,
        j.purity as jewellery_purity,
        j.weight as jewellery_weight
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN jewellery j ON s.jewellery_id = j.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET single sale / invoice details
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*, 
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        c.address as customer_address,
        j.name as jewellery_name,
        j.sku as jewellery_sku,
        j.category as jewellery_category,
        j.material as jewellery_material,
        j.purity as jewellery_purity,
        j.weight as jewellery_weight,
        j.selling_price as jewellery_unit_price,
        j.making_charges,
        j.stone_charges
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN jewellery j ON s.jewellery_id = j.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: "Sale / Invoice not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create sale (supports single item or multi-item batch checkout)
router.post("/", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      jewellery_id, customer_id, quantity, total_amount,
      items, payment_method, discount, tax_amount, invoice_no
    } = req.body;

    const generatedInv = invoice_no || `INV-2026-${Date.now().toString().slice(-6)}`;
    const payMethod = payment_method || "Cash";
    const disc = Number(discount) || 0;
    const tax = Number(tax_amount) || 0;

    await conn.beginTransaction();

    let createdSales = [];

    // Case 1: Batch checkout from POS cart
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qty = Number(item.quantity) || 1;
        const [stockCheck] = await conn.query("SELECT quantity, name FROM jewellery WHERE id = ? FOR UPDATE", [item.jewellery_id]);
        if (!stockCheck.length) throw new Error(`Jewellery item ID ${item.jewellery_id} not found`);
        if (stockCheck[0].quantity < qty) throw new Error(`Insufficient stock for "${stockCheck[0].name}". Available: ${stockCheck[0].quantity}`);

        const itemTotal = Number(item.line_total || item.total_amount) || (Number(item.selling_price || 0) * qty);

        const [r] = await conn.query(
          `INSERT INTO sales 
           (jewellery_id, customer_id, quantity, total_amount, sale_date, invoice_no, payment_method, discount, tax_amount)
           VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
          [item.jewellery_id, customer_id || null, qty, itemTotal, generatedInv, payMethod, disc / items.length, tax / items.length]
        );

        await conn.query("UPDATE jewellery SET quantity = quantity - ? WHERE id = ?", [qty, item.jewellery_id]);
        createdSales.push(r.insertId);
      }
    } 
    // Case 2: Standard single-item sale
    else {
      const qty = Number(quantity) || 1;
      const amt = Number(total_amount) || 0;

      const [stockCheck] = await conn.query("SELECT quantity, name FROM jewellery WHERE id = ? FOR UPDATE", [jewellery_id]);
      if (!stockCheck.length) throw new Error("Jewellery item not found");
      if (stockCheck[0].quantity < qty) throw new Error(`Insufficient stock for "${stockCheck[0].name}". Available: ${stockCheck[0].quantity}`);

      const [r] = await conn.query(
        `INSERT INTO sales 
         (jewellery_id, customer_id, quantity, total_amount, sale_date, invoice_no, payment_method, discount, tax_amount)
         VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
        [jewellery_id, customer_id || null, qty, amt, generatedInv, payMethod, disc, tax]
      );

      await conn.query("UPDATE jewellery SET quantity = quantity - ? WHERE id = ?", [qty, jewellery_id]);
      createdSales.push(r.insertId);
    }

    await conn.commit();
    res.status(201).json({
      message: "Sale processed and stock updated successfully",
      invoice_no: generatedInv,
      sale_ids: createdSales
    });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
