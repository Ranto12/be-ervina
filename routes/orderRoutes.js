import express from "express";
import {
  createOrder,
  getOrderDetails,
  getOrders,
  getOrdersByUserId,
  cancelOrder,
  getCompletedOrdersByuserId,
  getCompletedOrders,
  updateOrderStatus,
  getOrdersByMonth,
  updateStockByOrderId
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/cancel/:orderId", cancelOrder);
router.post("/status", updateOrderStatus);
router.post("/updateStockByOrderId", updateStockByOrderId);

router.get("/all", getOrders);
router.get("/getAllComplated", getCompletedOrders)
router.get("/AllUserId/:userId", getOrdersByUserId);
router.get("/getCompletedOrdersByuserId/:userId", getCompletedOrdersByuserId);
router.get("/getOrdersByMonth", getOrdersByMonth);
router.get("/detail/:orderId", getOrderDetails);

export default router;
