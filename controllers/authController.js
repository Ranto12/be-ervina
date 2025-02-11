import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// Generate Token
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

// Login untuk User
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email, role: "user" } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.cookie("accessToken", token, { httpOnly: true });
    res.json({
      message: "User login successful",
      token,
      userId: user.id,
      userData: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login untuk Admin
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ where: { email, role: "admin" } });
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);
    res.cookie("accessToken", token, { httpOnly: true });
    res.json({ message: "Admin login successful", token, userId: admin.id });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Register untuk User
const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error });
  }
};

// Register untuk Admin
const adminRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin" });
  }
};

// Get all users (only accessible by admin)
const getUsersByRole = async (req, res) => {
  const { role } = req.query;

  try {
    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role" });
    }

    // Menemukan semua pengguna berdasarkan role
    const users = await User.findAll({
      where: {
        role: role,
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Get user by ID (only accessible by admin)
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      attributes: ["name", "email", "address", "about", "sub_district", "district"],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, address, about, sub_district, district } = req.body;

  try {
    // Find user by id
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields (filtering undefined values to prevent updating with null/undefined)
    const updatedUser = await user.update({
      name: name || user.name,
      email: email || user.email,
      address: address || user.address,
      about: about || user.about,
      district: district || user.district,
      sub_district: sub_district || user.sub_district,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating user" });
  }
};

export {
  userLogin,
  adminLogin,
  userRegister,
  adminRegister,
  getUsersByRole,
  getUserById,
  updateUser,
};
