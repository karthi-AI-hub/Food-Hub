import express from 'express';
import { placeOrder, getOrderDetails, cancelOrder, getOrdersByStatus, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', placeOrder);
router.get('/:orderId', getOrderDetails); // Fetch order details
router.put('/cancel/:orderId', cancelOrder); // Cancel order
router.get('/status/:status', getOrdersByStatus); // Fetch orders by status
router.put('/:orderId/status', updateOrderStatus); // Update order status

export default router;
