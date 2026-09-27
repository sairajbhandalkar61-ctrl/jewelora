const router = require("express").Router();
const pool = require("../config/db");

router.get("/summary", async (req, res) => {
  try {
    // 1. Sales by category
    const [categorySales] = await pool.query(`
      SELECT 
        COALESCE(j.category, 'Uncategorized') as category,
        COALESCE(SUM(s.quantity), 0) as units_sold,
        COALESCE(SUM(s.total_amount), 0) as revenue
      FROM sales s
      LEFT JOIN jewellery j ON s.jewellery_id = j.id
      GROUP BY j.category
      ORDER BY revenue DESC
    `);

    // 2. Sales by payment method
    const [paymentMethods] = await pool.query(`
      SELECT 
        COALESCE(payment_method, 'Cash') as method,
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM sales
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `);

    // 3. Stock breakdown by material
    const [materialStock] = await pool.query(`
      SELECT 
        COALESCE(material, 'Gold') as material,
        COUNT(*) as item_count,
        COALESCE(SUM(quantity), 0) as total_units,
        COALESCE(SUM(quantity * selling_price), 0) as total_valuation
      FROM jewellery
      GROUP BY material
      ORDER BY total_valuation DESC
    `);

    // 4. Monthly financial trends (Sales, Purchases, Estimated Gross Profit)
    const [monthlyTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(sale_date, '%Y-%m') as month,
        SUM(total_amount) as sales_revenue,
        COUNT(id) as sales_count
      FROM sales
      GROUP BY DATE_FORMAT(sale_date, '%Y-%m')
      ORDER BY month ASC
    `);

    // 5. Total revenue, purchases, profit
    const [[totals]] = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(total_amount), 0) FROM sales) as total_sales,
        (SELECT COALESCE(SUM(total_amount), 0) FROM purchases) as total_purchases,
        (SELECT COALESCE(SUM(quantity * selling_price), 0) FROM jewellery) as stock_retail_val,
        (SELECT COALESCE(SUM(quantity * purchase_price), 0) FROM jewellery) as stock_cost_val
    `);

    const estimatedGrossProfit = Number(totals.total_sales) - Number(totals.total_purchases);
    const profitMargin = totals.total_sales > 0 
      ? ((estimatedGrossProfit / totals.total_sales) * 100).toFixed(1) 
      : 0;

    res.json({
      totals: {
        total_sales: Number(totals.total_sales),
        total_purchases: Number(totals.total_purchases),
        stock_retail_val: Number(totals.stock_retail_val),
        stock_cost_val: Number(totals.stock_cost_val),
        gross_profit: estimatedGrossProfit,
        profit_margin: profitMargin
      },
      categorySales,
      paymentMethods,
      materialStock,
      monthlyTrends
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
