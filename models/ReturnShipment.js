import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Order from "./Order.js"; // Import the Order model

const ReturnShipment = sequelize.define("ReturnShipment", {
  noResi: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: "id",
    },
  },
});

export default ReturnShipment;
