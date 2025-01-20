import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize';

const Chart = sequelize.define('Chart', {
  category: { // Misalnya, nama kategori produk atau status user
    type: DataTypes.STRING,
    allowNull: false,
  },
  count: { // Menyimpan jumlah, seperti jumlah produk atau jumlah user
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: { // Jenis data (produk atau user)
    type: DataTypes.STRING,
    allowNull: false,
  },
  referenceId: { // ID referensi untuk produk atau user
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, { 
  tableName: 'charts', 
  timestamps: true,
});

export default Chart;
