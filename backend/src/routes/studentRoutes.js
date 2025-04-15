import express from 'express';
import { placeOrder, getStudentOrders, getProfile, updateProfile } from '../controllers/studentController.js';

const router = express.Router();

router.post('/order', placeOrder);
router.get('/orders/:roll_no', getStudentOrders);
router.get('/profile/:roll_no', getProfile);
router.put('/profile/:roll_no', updateProfile);

export default router;
