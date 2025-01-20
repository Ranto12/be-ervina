import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Order = sequelize.define("Order", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  customerName: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: {
    type: DataTypes.ENUM("One-Time", "Two-Installments"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "Pending",
      "Paid",
      "Shipped",
      "Completed",
      "Cancelled",
      "Accepted"
    ),
    defaultValue: "Pending",
  },
  rentalStartDate: { type: DataTypes.DATEONLY, allowNull: false },
  rentalDuration: { type: DataTypes.INTEGER, allowNull: false },
});

export default Order;
