import express from 'express';
import AuthRoutes from './authRoutes.js';
import PaymentRoutes from './Payment.js';
import OrderRoutes from './orderRoutes.js';
import ProductRoutes from './productRoutes.js';
import CartRoutes from './cartRoutes.js'
import ShipmentRoutes from './ShipmentRoutes.js'
import ProductReview from './productReviewRoutes.js'

const router = express.Router();

router.use("/auth", AuthRoutes);
router.use("/products", ProductRoutes);
router.use("/orders", OrderRoutes);
router.use("/payment", PaymentRoutes)
router.use("/cart", CartRoutes)
router.use("/shipments", ShipmentRoutes)
router.use("/reviews", ProductReview)

export default router