import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Order from "./Order.js"; // Import the Order model

const Shipment = sequelize.define("Shipment", {
  trackingNumber: { type: DataTypes.STRING, allowNull: false },
  shippingMethod: {
    type: DataTypes.ENUM("Standard", "Express", "Overnight", "JNT"),
    allowNull: false,
    defaultValue: "JNT",
  },
  shippingStatus: {
    type: DataTypes.ENUM("Pending", "Shipped", "In Transit", "Delivered", "Returned"),
    defaultValue: "Pending",
  },
  estimatedDeliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
  actualDeliveryDate: { type: DataTypes.DATEONLY, allowNull: true },
  address: { type: DataTypes.STRING, allowNull: false }, 
  cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, 
  orderId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: Order,
      key: "id",
    },
  },
});

// Establish the relationship
Shipment.belongsTo(Order, { foreignKey: "orderId" }); // Shipment belongs to one Order
Order.hasOne(Shipment, { foreignKey: "orderId" }); // Order has one Shipment

export default Shipment;
