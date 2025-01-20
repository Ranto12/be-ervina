import sequelize from "../config/sequelize.js";
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
  },

}, { tableName: 'users', timestamps: true, freezeTableName: true });

User.associate = (models) => {
  // A user can have many chart entries
  User.hasMany(models.Chart, { foreignKey: 'userId' });
};

export default User;
