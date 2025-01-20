import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const OrderItem = sequelize.define("OrderItem", {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  productName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  size: { type: DataTypes.STRING },
  color: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
});

export default OrderItem;
