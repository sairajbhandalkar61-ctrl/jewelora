const router = require("express").Router();
const pool = require("../config/db");

router.get("/", async (req, res) => {
  try {
    // 1. Basic counts
    const [[jewellery]] = await pool.query("SELECT COUNT(*) count FROM jewellery");
    const [[customers]] = await pool.query("SELECT COUNT(*) count FROM customers");
    const [[suppliers]] = await pool.query("SELECT COUNT(*) count FROM suppliers");
    const [[stock]] = await pool.query("SELECT COALESCE(SUM(quantity), 0) total FROM jewellery");
    const [[sales]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) total FROM sales");
    const [[purchases]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) total FROM purchases");

    // 2. Today's figures
    const [[todaySalesRow]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) total FROM sales WHERE DATE(sale_date) = CURDATE()"
    );
    const [[todayPurchasesRow]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) total FROM purchases WHERE DATE(purchase_date) = CURDATE()"
    );

    // 3. Stock valuations & low stock
    const [[valRow]] = await pool.query(`
      SELECT 
        COALESCE(SUM(quantity * purchase_price), 0) as cost_valuation,
        COALESCE(SUM(quantity * selling_price), 0) as retail_valuation,
        COUNT(CASE WHEN quantity <= 2 AND quantity > 0 THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_count
      FROM jewellery
    `);

    // 4. Low stock items detail
    const [lowStockItems] = await pool.query(`
      SELECT id, name, category, quantity, purity, selling_price, image_url, sku
      FROM jewellery 
      WHERE quantity <= 2 
      ORDER BY quantity ASC, selling_price DESC 
      LIMIT 6
    `);

    // 5. Top selling items
    const [topSelling] = await pool.query(`
      SELECT 
        j.id, j.name, j.category, j.purity, j.image_url, j.selling_price, j.sku,
        COALESCE(SUM(s.quantity), 0) as units_sold,
        COALESCE(SUM(s.total_amount), 0) as total_revenue
      FROM jewellery j
      JOIN sales s ON j.id = s.jewellery_id
      GROUP BY j.id
      ORDER BY units_sold DESC, total_revenue DESC
      LIMIT 5
    `);

    // 6. Recent sales transactions
    const [recentSales] = await pool.query(`
      SELECT 
        s.id, s.invoice_no, s.sale_date as date, s.total_amount as amount, 
        s.payment_method, s.quantity,
        c.name as party_name, 'Sale' as type, 'Paid' as status,
        j.name as item_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN jewellery j ON s.jewellery_id = j.id
      ORDER BY s.sale_date DESC LIMIT 5
    `);

    // 7. Recent purchases
    const [recentPurchases] = await pool.query(`
      SELECT 
        p.id, p.invoice_ref as invoice_no, p.purchase_date as date, p.total_amount as amount,
        'Direct' as payment_method, p.quantity,
        s.name as party_name, 'Purchase' as type, p.payment_status as status,
        j.name as item_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN jewellery j ON p.jewellery_id = j.id
      ORDER BY p.purchase_date DESC LIMIT 5
    `);

    // Combine recent transactions sorted by date
    const recentTransactions = [...recentSales, ...recentPurchases]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7);

    // 8. Daily timeline series for chart (Sales and Purchases)
    const [salesTimeline] = await pool.query(`
      SELECT DATE(sale_date) as date, SUM(total_amount) as total
      FROM sales
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `);

    const [purchasesTimeline] = await pool.query(`
      SELECT DATE(purchase_date) as date, SUM(total_amount) as total
      FROM purchases
      GROUP BY DATE(purchase_date)
      ORDER BY date ASC
    `);

    // Build smart rule-based insights
    const smartAlerts = [];
    if (valRow.out_of_stock_count > 0) {
      smartAlerts.push({
        type: "danger",
        title: `${valRow.out_of_stock_count} Item(s) Out of Stock`,
        message: "Immediate replenishment required to prevent missed sales opportunities.",
        action: "/jewellery"
      });
    }
    if (valRow.low_stock_count > 0) {
      smartAlerts.push({
        type: "warning",
        title: `${valRow.low_stock_count} Jewellery Item(s) Low in Stock`,
        message: "Inventory level is below recommended safety stock (<= 2 units).",
        action: "/jewellery"
      });
    }
    smartAlerts.push({
      type: "info",
      title: "Showroom Vault Valuation",
      message: `Total inventory showroom retail value stands at ? ${Number(valRow.retail_valuation).toLocaleString("en-IN")}.`,
      action: "/reports"
    });

    res.json({
      jewelleryCount: jewellery.count,
      customerCount: customers.count,
      supplierCount: suppliers.count,
      stock: Number(stock.total) || 0,
      sales: Number(sales.total) || 0,
      purchases: Number(purchases.total) || 0,
      todaySales: Number(todaySalesRow.total) || 0,
      todayPurchases: Number(todayPurchasesRow.total) || 0,
      costValuation: Number(valRow.cost_valuation) || 0,
      retailValuation: Number(valRow.retail_valuation) || 0,
      lowStockCount: Number(valRow.low_stock_count) || 0,
      outOfStockCount: Number(valRow.out_of_stock_count) || 0,
      lowStockItems,
      topSelling,
      recentTransactions,
      salesTimeline,
      purchasesTimeline,
      smartAlerts
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
