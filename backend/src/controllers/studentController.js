import db from '../config/db.js';

export const placeOrder = (req, res) => {
  const { roll_no, items, total_amount } = req.body;

  const orderId = 'ORD' + Date.now();
  const orderData = {
    order_id: orderId,
    roll_no,
    items: JSON.stringify(items),
    total_amount,
    status: 'Pending',
    created_at: new Date()
  };

  db.query('INSERT INTO orders SET ?', orderData, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to place order' });

    res.json({ message: 'Order placed successfully', order_id: orderId });
  });
};

export const getStudentOrders = (req, res) => {
  const roll_no = req.params.roll_no;

  db.query('SELECT * FROM orders WHERE roll_no = ? ORDER BY created_at DESC', [roll_no], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });

    res.json(results);
  });
};

export const getMenu = (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch menu' });

    res.json(results);
  });
}

export const getProfile = (req, res) => {
  const roll_no = req.params.roll_no;

  db.query('SELECT * FROM students WHERE roll_no = ?', [roll_no], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch profile' });

    if (results.length === 0) return res.status(404).json({ error: 'Student not found' });

    res.json(results[0]);
  });
};

export const updateProfile = (req, res) => {
  const roll_no = req.params.roll_no;
  const { name, email, phone } = req.body;

  db.query('UPDATE students SET name = ?, email = ?, phone = ? WHERE roll_no = ?', [name, email, phone, roll_no], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update profile' });

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });

    res.json({ message: 'Profile updated successfully' });
  });
}
