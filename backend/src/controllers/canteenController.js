import db from '../config/db.js';

export const getAllOrders = (req, res) => {
  db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });

    res.json(results);
  });
};

export const getCanteenProfile = (req, res) => {
  // Assuming token middleware has set req.user
  const canteenId = req.user ? req.user.id : req.query.id; 
  db.query('SELECT id, username FROM canteen_staff WHERE id = ?', [canteenId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch profile' });
    if (results.length === 0) return res.status(404).json({ error: 'Canteen user not found' });
    res.json(results[0]);
  });
};

export const updateOrderStatus = (req, res) => {
  const { order_id, status } = req.body;

  db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, order_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update order' });

    res.json({ message: 'Order status updated successfully' });
  });
};

export const getSalesReport = async (req, res) => {
  const { range } = req.query;
  let query;

  switch (range) {
    case 'day':
      query = `
        SELECT DATE_FORMAT(created_at, '%H:00') as period, 
               COUNT(*) as sales, 
               CAST(SUM(oi.quantity * mi.price) AS DECIMAL(10,2)) as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.item_id = mi.id
        WHERE DATE(o.created_at) = CURDATE()
        GROUP BY period
        ORDER BY period`;
      break;
    case 'week':
      query = `
        SELECT DATE_FORMAT(created_at, '%a') as period, 
               COUNT(*) as sales, 
               CAST(SUM(oi.quantity * mi.price) AS DECIMAL(10,2)) as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.item_id = mi.id
        WHERE YEARWEEK(o.created_at) = YEARWEEK(CURDATE())
        GROUP BY period, DAYOFWEEK(o.created_at)
        ORDER BY DAYOFWEEK(o.created_at)`;
      break;
    case 'month':
      query = `
        SELECT DATE_FORMAT(created_at, '%b %e') as period, 
               COUNT(*) as sales, 
               CAST(SUM(oi.quantity * mi.price) AS DECIMAL(10,2)) as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items mi ON oi.item_id = mi.id
        WHERE MONTH(o.created_at) = MONTH(CURDATE())
        GROUP BY period, DAY(o.created_at)
        ORDER BY DAY(o.created_at)`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid range' });
  }

  try {
    const [salesData] = await db.promise().query(query);

    const [revenueTrend] = await db.promise().query(`
      SELECT DATE_FORMAT(o.created_at, '%Y-%m-%d') as period, 
             CAST(SUM(oi.quantity * mi.price) AS DECIMAL(10,2)) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN menu_items mi ON oi.item_id = mi.id
      WHERE o.status = 'Completed'
      GROUP BY period
      ORDER BY period DESC
      LIMIT 7
    `);

    const [popularItems] = await db.promise().query(`
      SELECT mi.name, 
             SUM(oi.quantity) as quantity, 
             CAST(SUM(oi.quantity * mi.price) AS DECIMAL(10,2)) as revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'Completed'
      GROUP BY mi.name
      ORDER BY quantity DESC
      LIMIT 5
    `);

    res.json({ salesData, revenueTrend, popularItems });
  } catch (err) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};