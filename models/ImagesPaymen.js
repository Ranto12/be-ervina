import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js"; // Import konfigurasi database
import Payment from "./Payment.js"; // Import model Payment jika diperlukan untuk relasi

const ImagesPayment = sequelize.define("ImagesPayment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Payments",
      key: "id",
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default ImagesPayment;
