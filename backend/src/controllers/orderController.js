import db from '../config/db.js';

export const placeOrder = async (req, res) => {
  const { rollNo, items } = req.body;

  if (!rollNo || !items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Missing order details' });
  }

  try {
    // Generate a unique 3-digit order ID
    const uniqueId = Math.floor(100 + Math.random() * 900).toString();

    // Insert into `orders` table
    const orderQuery = `
      INSERT INTO orders (unique_id, roll_no, status, created_at)
      VALUES (?, ?, 'Pending', NOW())
    `;
    const [orderResult] = await db.promise().execute(orderQuery, [uniqueId, rollNo]);
    const orderId = orderResult.insertId;

    // Insert into `order_items` table
    const itemQueries = items.map((item) => {
      return db.promise().execute(
        `INSERT INTO order_items (order_id, item_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, item.id, item.quantity]
      );
    });

    await Promise.all(itemQueries);

    // Emit socket event for real-time updates
    req.io.emit('new_order', { orderId, uniqueId });

    res.status(201).json({ message: 'Order placed!', orderId, uniqueId });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    const [orderDetails] = await db.promise().query(
      `SELECT o.id, o.unique_id, o.roll_no, o.status, o.created_at, 
              oi.item_id, oi.quantity, mi.name, mi.price 
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN menu_items mi ON oi.item_id = mi.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (!orderDetails.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(orderDetails);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const [result] = await db.promise().query(
      `UPDATE orders SET status = 'Cancelled' WHERE id = ?`,
      [orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for real-time updates
    req.io.emit('order_updated', { orderId, status: 'Cancelled' });

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOrdersByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    const [orders] = await db.promise().query(
      `SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC`,
      [status]
    );

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const [result] = await db.promise().query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for real-time updates
    req.io.emit('order_updated', { orderId, status });

    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};