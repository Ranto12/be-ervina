import { Order, Shipment } from "../models/index.js";

// Create a shipment for an order
const createShipment = async (req, res) => {
  const { orderId, trackingNumber, shippingMethod, shippingStatus, estimatedDeliveryDate } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findOne({ where: { id: orderId } });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Create the shipment
    const shipment = await Shipment.create({
      orderId,
      trackingNumber,
      shippingMethod,
      shippingStatus,
      estimatedDeliveryDate,
    });

    // Update the order status to "Shipped"
    order.status = "Shipped";
    await order.save();

    res.status(201).json({
      message: "Shipment created successfully and order marked as shipped",
      shipment,
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating shipment",
      error: error.message,
    });
  }
};

// Update the shipment status
const updateShipmentStatus = async (req, res) => {
  const { shipmentId, shippingStatus, actualDeliveryDate } = req.body;

  try {
    // Find the shipment by ID
    const shipment = await Shipment.findOne({ where: { id: shipmentId } });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Update the shipment status
    shipment.shippingStatus = shippingStatus;
    shipment.actualDeliveryDate = actualDeliveryDate || shipment.actualDeliveryDate;
    await shipment.save();

    res.status(200).json({
      message: "Shipment status updated successfully",
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating shipment status",
      error: error.message,
    });
  }
};

// Get shipment details by order ID
const getShipmentByOrderId = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the shipment for the given order ID
    const shipment = await Shipment.findOne({ where: { orderId } });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found for this order" });
    }

    res.status(200).json({
      shipment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving shipment",
      error: error.message,
    });
  }
};

export { createShipment, updateShipmentStatus, getShipmentByOrderId };
