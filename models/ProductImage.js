import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ProductImage = sequelize.define(
  "ProductImage",
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
    imagePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "ProductImages",
    timestamps: false,
  }
);

export default ProductImage;
