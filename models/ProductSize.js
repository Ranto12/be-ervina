import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ProductSize = sequelize.define(
  "ProductSize",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "ProductSizes",
    timestamps: false,
  }
);

export default ProductSize;
