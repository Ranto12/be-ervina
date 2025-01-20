import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  Product,
  ProductColor,
  ProductSize,
  ProductImage,
} from "../models/index.js";

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: "dyv7frz3h",
  api_key: "341577725213344",
  api_secret: "oDWpvnA5eilDr6fC6p_uQMeFRCY",
});


// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer();
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

const addProduct = async (req, res) => {
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error processing files", error: err.message });
    }

    const { name, category, price, details, status, colors, sizes } = req.body;

    try {
      // Simpan produk ke database
      const product = await Product.create({
        name,
        category,
        price,
        details,
        status,
      });

      // Simpan warna produk
      if (colors) {
        const colorRecords = colors.split(",").map((color) => ({
          productId: product.id,
          color,
        }));
        await ProductColor.bulkCreate(colorRecords);
      }

      // Simpan ukuran produk
      if (sizes) {
        const sizeRecords = JSON.parse(sizes).map((size) => ({
          productId: product.id,
          size: size.size,
          stock: size.stock,
        }));
        await ProductSize.bulkCreate(sizeRecords);
      }

      console.log(req.files, "cek")

      // Unggah gambar ke Cloudinary dan simpan URL-nya
      if (req.files && req.files.length) {
        const imageRecords = [];
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, "products");
          imageRecords.push({
            productId: product.id,
            imagePath: result.secure_url,
          });
        }
        await ProductImage.bulkCreate(imageRecords);
      }

      res.status(201).json({
        message: "Product added successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({ message: "Error adding product", error: error.message });
    }
  });
};

const updateProduct = async (req, res) => {
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading files", error: err.message });
    }

    const { id } = req.params; // Ambil ID produk dari parameter URL
    const { name, category, price, details, status, colors, sizes, removeProductSize, removeImages } = req.body;

    try {
      // Cari produk berdasarkan ID
      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update data utama produk
      await product.update({ name, category, price, details, status });

      // Update warna produk
      if (colors) {
        await ProductColor.destroy({ where: { productId: id } }); // Hapus warna lama
        const colorRecords = colors.split(",").map((color) => ({
          productId: id,
          color,
        }));
        await ProductColor.bulkCreate(colorRecords); // Tambahkan warna baru
      }

      // Update ukuran produk
      if (sizes) {
        const sizeData = JSON.parse(sizes); // Parsing data ukuran dari request

        // Tambahkan ukuran baru (id === 0)
        const sizesToAdd = sizeData.filter((size) => size.id === 0);
        if (sizesToAdd.length > 0) {
          const sizeRecords = sizesToAdd.map((size) => ({
            productId: id,
            size: size.size,
            stock: size.stock,
          }));
          await ProductSize.bulkCreate(sizeRecords); // Tambahkan ukuran baru
        }

        // Perbarui ukuran lama (id !== 0)
        const sizesToUpdate = sizeData.filter((size) => size.id !== 0);
        for (const size of sizesToUpdate) {
          await ProductSize.update(
            { size: size.size, stock: size.stock },
            { where: { id: size.id, productId: id } }
          );
        }
      }

      // Hapus ukuran berdasarkan `removeProductSize`
      if (removeProductSize) {
        const removeIds = JSON.parse(removeProductSize);
        if (removeIds.length > 0) {
          await ProductSize.destroy({
            where: { id: removeIds, productId: id },
          });
        }
      }

      // Hapus gambar berdasarkan URL (removeImages)
      if (removeImages) {
        const removeImagePaths = JSON.parse(removeImages);
        for (const imagePath of removeImagePaths) {
          const imageRecord = await ProductImage.findOne({
            where: { imagePath, productId: id },
          });

          if (imageRecord) {
            // Hapus gambar dari Cloudinary
            const publicId = imagePath.split("/").pop().split(".")[0]; // Ekstrak publicId dari URL
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error(`Failed to delete image from Cloudinary: ${imagePath}`, error);
            }

            // Hapus dari database
            await ProductImage.destroy({ where: { id: imageRecord.id } });
          }
        }
      }

      // Tambahkan gambar baru (images)
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.buffer, "products");
          await ProductImage.create({
            productId: id,
            imagePath: result.secure_url,
          });
        }
      }

      res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product", error: error.message });
    }
  });
};

const getProductById = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL

  try {
    // Cari produk berdasarkan ID
    const product = await Product.findByPk(id, {
      include: [
        {
          model: ProductColor,
          attributes: ["color"], // Ambil warna produk
        },
        {
          model: ProductSize,
          attributes: ["size", "stock", "id"], // Ambil ukuran dan stok
        },
        {
          model: ProductImage,
          attributes: ["imagePath"], // Ambil path gambar
        },
      ],
    });

    // Jika produk tidak ditemukan
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Jika produk ditemukan, kembalikan data produk
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  const { category = "all", limit = 10, page = 1 } = req.query;

  try {
    const offset = (page - 1) * limit; 
    const whereClause = category !== "all" ? { category } : {}; 

    // Query produk dari database
    const products = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10), 
      offset: parseInt(offset, 10), 
      include: [
        { model: ProductColor, attributes: ["color"] },
        { model: ProductSize, attributes: ["size", "stock", "productId", "id"] },
        { model: ProductImage, attributes: ["imagePath"] },
      ],
      distinct: true
    });

    res.status(200).json({
      message: "Products fetched successfully",
      total: products.count, 
      products: products.rows, 
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params; // Ambil ID produk dari parameter

  try {
    // Cari produk berdasarkan ID
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Periksa apakah produk terkait dengan order
    const existingOrders = await Order.findOne({ where: { productId: id } });
    if (existingOrders) {
      return res.status(400).json({
        message: "Product cannot be deleted because it is associated with an order",
      });
    }

    // Hapus produk
    await product.destroy();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

export { addProduct, updateProduct, getProductById, getAllProducts, deleteProduct };
