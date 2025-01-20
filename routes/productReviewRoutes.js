import express from "express";
import { createReview, getAllProductReview, getReviewByProductAndOrder, getReviewsByProductId, getReviewsByUserId, removeReview, updateReview } from "../controllers/productReview.js";

const router = express.Router();

router.get("/user/:userId", getReviewsByUserId);
router.get("/product/:productId", getReviewsByProductId);
router.get("/all", getAllProductReview);

router.post("/ProductAndOrder/:orderId/:productId", getReviewByProductAndOrder);
router.post("/create", createReview);
router.post("/remove/:reviewId", removeReview);
router.post("/update/:reviewId", updateReview);

export default router;
