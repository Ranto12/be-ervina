import express from "express";
import { makePayment, updatePaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create", makePayment);
router.post("/update/status", updatePaymentStatus);

export default router;
