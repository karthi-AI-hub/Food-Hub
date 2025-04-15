import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const login = (req, res) => {
  const { role, id, password } = req.body;

  if (!role || !id || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const table = role === 'student' ? 'students' : 'canteen_staff';
  // For students, query by roll_no, for canteen use username field.
  const column = role === 'student' ? 'roll_no' : 'username';

  db.query(`SELECT * FROM ${table} WHERE ${column} = ?`, [id], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Here, token payload uses the auto-generated id from the table.
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user });
  });
};

export const registerStudent = async (req, res) => {
  const { roll_no, name, password } = req.body;

  if (!roll_no || !name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.query('SELECT * FROM students WHERE roll_no = ?', [roll_no], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) return res.status(400).json({ error: 'Roll number already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO students (roll_no, name, password) VALUES (?, ?, ?)',
      [roll_no, name, hashedPassword],
      (err) => {
        if (err) return res.status(500).json({ error: 'Registration failed' });
        res.status(201).json({ message: 'Student registered successfully' });
      }
    );
  });
};
