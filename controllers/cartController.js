import { Cart, Product, ProductImage, ProductSize } from "../models/index.js";

// Add a product to the cart
const addToCart = async (req, res) => {
  const { userId, productId, sizeId, quantity, color } = req.body;

  try {
    // Validate input data
    if (!userId || !productId || !sizeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "  " });
    }

    // Get product size details (to check stock)
    const productSize = await ProductSize.findOne({
      where: {
        id: sizeId,
        productId, // Ensure the size is linked to the correct product
      },
    });

    if (!productSize) {
      return res.status(404).json({ message: "Product size not found" });
    }

    const availableStock = productSize.stock;

    // Check if the product already exists in the cart
    const existingCartItem = await Cart.findOne({
      where: {
        userId,
        productId,
        sizeId,
      },
    });

    if (existingCartItem) {
      // Calculate new quantity
      const newQuantity = existingCartItem.quantity + quantity;

      // Validate new quantity against stock
      if (newQuantity > availableStock) {
        return res.status(400).json({
          message: "Requested quantity exceeds available stock",
          availableStock,
        });
      }

      // Update the quantity in the cart
      await existingCartItem.update({
        quantity: newQuantity,
      });

      return res.status(200).json({
        message: "Product quantity updated in cart",
        cartItem: existingCartItem,
      });
    } else {
      // Validate if new item exceeds stock
      if (quantity > availableStock) {
        return res.status(400).json({
          message: "Requested quantity exceeds available stock",
          availableStock,
        });
      }

      // Add a new item to the cart
      const newCartItem = await Cart.create({
        userId,
        productId,
        sizeId,
        quantity,
        color,
      });

      return res.status(201).json({
        message: "Product added to cart",
        cartItem: newCartItem,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};

// Get cart data by user ID
const getCartDataByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Retrieve cart data for the user
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product, // Include product details
          attributes: ["id", "name", "price"], // Include necessary attributes
          include: [
            {
              model : ProductImage,
              attributes: ["imagePath"]
            }
          ]
        },
        {
          model: ProductSize, // Include size details
          // attributes: ["id", "size"], // Include necessary attributes
        },
        
      ],
    });

    res.status(200).json({
      message: "Cart data retrieved successfully",
      cartItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving cart data",
      error: error.message,
    });
  }
};

// Delete cart items by IDs
const deleteCartByIds = async (req, res) => {
  const { userId, cartIds } = req.body;

  try {
    // Validasi input
    if (!userId || !cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return res.status(400).json({ message: "Invalid userId or cartIds array" });
    }

    // Validasi apakah semua cartIds milik userId yang diberikan
    const cartItems = await Cart.findAll({
      where: {
        id: cartIds,
        userId, // Pastikan item milik pengguna yang sesuai
      },
    });

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "No cart items found for the provided userId and cartIds" });
    }

    // Hapus item keranjang yang cocok
    const deletedCount = await Cart.destroy({
      where: {
        id: cartItems.map((item) => item.id),
      },
    });

    res.status(200).json({
      message: "Cart items deleted successfully",
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting cart items",
      error: error.message,
    });
  }
};

// Update cart quantity
const updateCartQuantity = async (req, res) => {
  const { cartId, quantity } = req.body;

  try {
    // Validate input
    if (!cartId || quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Find cart item by ID and include related size
    const cartItem = await Cart.findOne({
      where: { id: cartId },
      include: [
        {
          model: ProductSize,
          attributes: ["id", "stock"], // Include stock details
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const availableStock = cartItem.ProductSize.stock;

    // Validate against stock
    if (quantity > availableStock) {
      return res.status(400).json({
        message: "Quantity exceeds available stock",
        availableStock,
      });
    }

    if (quantity === 0) {
      // If quantity is 0, remove the cart item
      await Cart.destroy({ where: { id: cartId } });
      return res.status(200).json({ message: "Cart item removed" });
    }

    // Update cart quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      message: "Cart quantity updated successfully",
      cartItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating cart quantity",
      error: error.message,
    });
  }
};

const getCartDetailById = async (req, res) => {
  const { cartId } = req.params;

  try {
    // Validasi input
    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    // Ambil detail item keranjang berdasarkan cartId
    const cartDetail = await Cart.findOne({
      where: { id: cartId },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "details", "status"], // Tambahkan atribut produk yang diperlukan
          include: [
            {
              model: ProductImage,
              attributes: ["imagePath"], // Sertakan gambar produk
            },
          ],
        },
        {
          model: ProductSize,
          attributes: ["id", "size", "stock"], // Sertakan informasi ukuran dan stok
        },
       
      ],
    });

    // Periksa apakah item keranjang ditemukan
    if (!cartDetail) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({
      message: "Cart detail retrieved successfully",
      cartDetail,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving cart detail",
      error: error.message,
    });
  }
};


export { addToCart, getCartDataByUserId, deleteCartByIds, updateCartQuantity, getCartDetailById };
