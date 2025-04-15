import express from 'express';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, upload } from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenu);
router.post('/', upload.single('image'), addMenuItem); // Add a new menu item with image upload
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
