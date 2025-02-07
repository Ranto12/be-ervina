import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

import { addProduct, getAllProducts, getProductById, updateProduct,deleteProduct, getOrdersByProductId } from "../controllers/productController.js";

const router = express.Router();

router.get("/getById/:id", getProductById);
router.get("/", getAllProducts);
router.get("/getOrdersByProductId/:productId", getOrdersByProductId);
router.post("/add", addProduct);
router.post("/update/:id", updateProduct);
router.post("/delete/:id", deleteProduct);

export default router;
