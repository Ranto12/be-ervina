
import {User, Product, ProductReview} from '../models/index.js'

// Create Review
const createReview = async (req, res) => {
  const { userId, orderId, reviewText, productIds } = req.body; // `productIds` adalah array

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      message: "productIds must be a non-empty array.",
    });
  }

  try {
    // Iterasi untuk mengecek setiap productId
    for (let productId of productIds) {
      // Cek apakah user sudah memberikan ulasan untuk productId di orderId tertentu
      const existingReview = await ProductReview.findOne({
        where: {
          productId,
          userId,
          orderId,
        },
      });

      if (existingReview) {
        return res.status(400).json({
          message: `Anda sudah pernah memberikan komentar untuk produk dengan ID ${productId}`,
        });
      }

      // Jika belum ada ulasan, buat ulasan baru untuk setiap produk
      await ProductReview.create({ productId, userId, orderId, reviewText });
    }

    res.status(201).json({
      message: "Reviews created successfully for the given products",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating reviews",
      error: error.message,
    });
  }
};

// Get Reviews by User ID
const getReviewsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await ProductReview.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }], // Opsional: Tambahkan produk terkait
    });

    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reviews",
      error: error.message,
    });
  }
};

// Get Reviews by Product ID
const getReviewsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await ProductReview.findAll({
      where: { productId },
      attributes : ["reviewText"],
      include: [{ model: User, as: "user", attributes: ["name", "id"] }], // Opsional: Tambahkan pengguna terkait
    });

    res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reviews",
      error: error.message,
    });
  }
};

// Remove Review
const removeReview = async (req, res) => {
  const { reviewId } = req.params;

  try {
    const deletedReview = await ProductReview.destroy({
      where: { id: reviewId },
    });

    if (deletedReview) {
      res.status(200).json({ message: "Review deleted successfully" });
    } else {
      res.status(404).json({ message: "Review not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error deleting review",
      error: error.message,
    });
  }
};

// Update Review
const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { reviewText } = req.body;

  try {
    const review = await ProductReview.findByPk(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.reviewText = reviewText;
    await review.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating review",
      error: error.message,
    });
  }
};

const getReviewByProductAndOrder = async (req, res) => {
  const { orderId } = req.params; 
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      message: "productIds must be a non-empty array.",
    });
  }

  try {
    // Cari ulasan berdasarkan productIds dan orderId
    const reviews = await ProductReview.findAll({
      where: {
        orderId,
        productId: 1,
      },
    });

    // Kembalikan ulasan yang ditemukan
    res.status(200).json({
      message: "Reviews found",
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving reviews",
      error: error.message,
    });
  }
};

const getAllProductReview = async (req, res) => {
  const { category = "all", limit = 10, page = 1 } = req.query;

  try {
    const offset = (page - 1) * limit; 
    const whereClause = category !== "all" ? { category } : {}; // Filter reviews by category if provided

    // Query reviews from the database
    const reviews = await ProductReview.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10), 
      offset: parseInt(offset, 10),
      attributes: ["reviewText", "id"],
      include: [
        { model: Product, attributes: ["name"]},
        { model: User, as: "user", attributes: ["name"] }
      ],
      distinct: true
    });

    res.status(200).json({
      message: "Reviews fetched successfully",
      total: reviews.count,
      reviews: reviews.rows,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(reviews.count / limit),
      totalReviews: reviews.count,
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};



export {createReview, updateReview, removeReview, getReviewsByProductId, getReviewsByUserId, getReviewByProductAndOrder, getAllProductReview}