import multer from "multer";
import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";
import { ImagesPayment } from "../models/index.js";
import Payment from "../models/Payment.js";

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: "dxkl9jrkp",
  api_key: "696654727616992",
  api_secret: "dzXRs_VY1hZXmaxuHb8heTh26WE",
});

// Middleware multer untuk memproses file
const upload = multer();

// Fungsi untuk upload ke Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// API untuk upload gambar payment (hanya 1 gambar)
const uploadImagePayment = async (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error processing file", error: err.message });
    }

    const { paymentId } = req.body;

    try {
      // Validasi paymentId
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Validasi file
      if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
      }

      // Unggah gambar ke Cloudinary dan simpan URL-nya
      const result = await uploadToCloudinary(req.file.buffer, "payment-images");

      await ImagesPayment.create({
        paymentId: payment.id,
        url: result.secure_url,
      });

      res.status(201).json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error uploading image", error: error.message });
    }
  });
};

export default uploadImagePayment;