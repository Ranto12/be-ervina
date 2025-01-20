import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';

import { addProduct, getAllProducts, getProductById, updateProduct,deleteProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/add", addProduct);
router.post("/update/:id", updateProduct);
router.get("/getById/:id", getProductById);
router.get("/", getAllProducts);
router.post("/:id", deleteProduct);

export default router;
