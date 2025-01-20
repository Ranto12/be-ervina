import { Payment, Order } from "../models/index.js";

const makePayment = async (req, res) => {
  const { paymentMethod, amount, orderId, paymentCode } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find a pending payment for the order
    const payment = await Payment.findOne({
      where: { orderId, paymentStatus: "Pending" },
    });

    if (!payment) {
      return res.status(404).json({
        message: "No pending payment found for this order",
      });
    }

    // Check if the payment code matches
    if (payment.paymentCode !== paymentCode) {
      return res.status(400).json({
        message: "Invalid payment code. Please check and try again.",
      });
    }

    // Check if the payment amount matches
    if (parseFloat(amount) !== parseFloat(payment.amount)) {
      return res.status(400).json({
        message: "Payment amount does not match the required amount",
      });
    }

    // Update payment method and status
    payment.paymentMethod = paymentMethod;
    payment.paymentStatus = "Completed"; // Set to completed when payment is successful
    payment.paymentDate = new Date(); // Record the payment date
    await payment.save();

    // Mark the order as paid immediately
    order.status = "Paid";
    await order.save();

    res.status(200).json({
      message: "Payment processed successfully and order marked as paid",
      payment,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing payment",
      error: error.message,
    });
  }
};

export { makePayment };
