import express from 'express';
import { getAllOrders, updateOrderStatus, getCanteenProfile, getSalesReport } from '../controllers/canteenController.js';

const router = express.Router();

router.get('/orders', getAllOrders);
router.put('/order/status', updateOrderStatus);
// router.get('/profile', getCanteenProfile); 
router.get('/reports', getSalesReport); // Fetch sales report

export default router;
