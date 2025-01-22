import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import { createShipment, getShipmentByOrderId, updateShipmentStatus } from '../controllers/ShipmentController.js';
import { createReturnShipment } from '../controllers/returnShipment.js';

const router = express.Router();
router.post("/create", createShipment);

// Route to update shipment status
router.post("/update/:shipmentId", updateShipmentStatus);

// Route to get shipment by order ID
router.get("/order/:orderId", getShipmentByOrderId);

router.post('/create/return', createReturnShipment)

export default router;