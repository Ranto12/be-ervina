import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ProductColor = sequelize.define(
  "ProductColor",
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
    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "ProductColors",
    timestamps: false,
  }
);

export default ProductColor;
