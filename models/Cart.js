import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Ensure this matches your User model table name
        key: "id",
      },
      onDelete: "CASCADE", // Ensure cart items are deleted if a user is deleted
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products", // Ensure this matches your Product model table name
        key: "id",
      },
      onDelete: "CASCADE", // Ensure cart items are deleted if a product is deleted
    },
    sizeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ProductSizes", // Ensure this matches your ProductSize model table name
        key: "id",
      },
      onDelete: "CASCADE", // Ensure cart items are deleted if a size is deleted
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default quantity if none is provided
      validate: {
        min: 1, // Prevents quantity from being less than 1
      },
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    timestamps: false, // Disable automatic `createdAt` and `updatedAt` fields
  }
);

export default Cart;
