import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the 'uploads' directory exists
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create the directory if it doesn't exist
  console.log(`Created 'uploads' directory at ${uploadsDir}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });

export const getMenu = (req, res) => {
  db.query('SELECT * FROM menu_items', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch menu' });

    res.json(results);
  });
};

export const addMenuItem = async (req, res) => {
  const { name, price, available, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Save the file path

  // Convert 'available' to an integer (1 for true, 0 for false)
  const availableInt = available === 'true' ? 1 : 0;

  try {
    await db.promise().query(
      'INSERT INTO menu_items (name, price, available, image_url, category) VALUES (?, ?, ?, ?, ?)',
      [name, price, availableInt, image_url, category]
    );
    const [menuItems] = await db.promise().query('SELECT * FROM menu_items');
    res.status(201).json(menuItems);
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ message: 'Failed to add menu item' });
  }
};

export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, price, available, image_url, category } = req.body;

  try {
    const [result] = await db.promise().query(
      'UPDATE menu_items SET name = ?, price = ?, available = ?, image_url = ?, category = ? WHERE id = ?',
      [name, price, available, image_url, category, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const [menuItems] = await db.promise().query('SELECT * FROM menu_items');
    res.json(menuItems);
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({ message: 'Failed to update menu item' });
  }
};

export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.promise().query('DELETE FROM menu_items WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ message: 'Failed to delete menu item' });
  }
};