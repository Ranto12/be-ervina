// uploadImagePayment

import express from "express";
import uploadImagePayment from "../controllers/imagesPaymentController.js";

const router = express.Router();

router.post("/create", uploadImagePayment);

export default router;
