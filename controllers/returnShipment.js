import ReturnShipment from "../models/ReturnShipment.js";
import Order from "../models/Order.js";

const createReturnShipment = async (req, res) => {
  const { noResi, address, orderId } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if a ReturnShipment already exists for this order
    const existingReturnShipment = await ReturnShipment.findOne({
      where: { orderId },
    });

    if (existingReturnShipment) {
      return res.status(400).json({
        message: "A return shipment already exists for this order",
      });
    }

    // Create the ReturnShipment
    const returnShipment = await ReturnShipment.create({
      noResi,
      address,
      orderId,
    });

    res.status(201).json({
      message: "Return shipment created successfully",
      returnShipment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating return shipment",
      error: error.message,
    });
  }
};

export { createReturnShipment };
