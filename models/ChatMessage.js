import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import User from "./User.js";

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat_messages",
    timestamps: true,
    freezeTableName: true,
  }
);

ChatMessage.associate = (models) => {
  ChatMessage.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
  
  ChatMessage.belongsTo(models.User, { foreignKey: "receiverId", as: "receiver" });
};


export default ChatMessage;
