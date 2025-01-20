import { Sequelize } from "sequelize";
import { ChatMessage, User } from "../models/index.js";

const createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // Validasi: pastikan senderId adalah user dan receiverId adalah admin
    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Invalid sender or receiver." });
    }

    // if (receiver.role !== "admin") {
    //   return res.status(400).json({ message: "Receiver must be an admin." });
    // }

    // Create new message
    const newMessage = await ChatMessage.create({
      senderId,
      receiverId,
      message,
    });

    return res.status(201).json({
      messageText : newMessage.message
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while sending the message." });
  }
};

const getMessageUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ambil pesan yang dikirim oleh user dan diterima oleh user
    const messages = await ChatMessage.findAll({
      where: {
        [Sequelize.Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      attributes: ["message"] ,
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["role"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["role"],
        },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found." });
    }

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching messages." });
  }
};

const getMessages = async (req, res) => {
  try {
    // Ambil user dengan role admin
    const admin = await User.findOne({ where: { role: "admin" } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    // Ambil pesan yang melibatkan admin
    const messages = await ChatMessage.findAll({
      where: {
        [Sequelize.Op.or]: [
          { senderId: admin.id }, // Pesan yang dikirim oleh admin
          { receiverId: admin.id }, // Pesan yang diterima oleh admin
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "email"], // Ambil informasi sender
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email"], // Ambil informasi receiver
        },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found." });
    }

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching messages." });
  }
};

export { createMessage, getMessages, getMessageUserId };
