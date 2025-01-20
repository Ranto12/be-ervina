import Product from "./Product.js";
import ProductColor from "./ProductColor.js";
import ProductSize from "./ProductSize.js";
import ProductImage from "./ProductImage.js";
import ProductReview from "./ProductReview.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Payment from "./Payment.js";
import Cart from "./Cart.js";
import User from "./User.js"; // Assuming User model exists
import Shipment from "./Shipment.js";

// Define relationships
Product.hasMany(ProductColor, { foreignKey: "productId" });
ProductColor.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(ProductSize, { foreignKey: "productId" });
ProductSize.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(ProductImage, { foreignKey: "productId" });
ProductImage.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(ProductReview, { foreignKey: "productId" });
ProductReview.belongsTo(Product, { foreignKey: "productId" });

// Define relationships for Order and OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

// Define relationships for Order and Payment
Order.hasMany(Payment, { foreignKey: "orderId" });
Payment.belongsTo(Order, { foreignKey: "orderId" });

// Define relationships for Cart and Product
Cart.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Cart, { foreignKey: "productId" });

// Define relationships for Cart and ProductSize
Cart.belongsTo(ProductSize, { foreignKey: "sizeId" }); // Assuming a `sizeId` column in Cart
ProductSize.hasMany(Cart, { foreignKey: "sizeId" });

// Define relationships for Cart and User (if User model exists)
Cart.belongsTo(User, { foreignKey: "userId" }); // Assuming User model exists
User.hasMany(Cart, { foreignKey: "userId" }); // Assuming User model exists

Order.hasOne(Shipment, { foreignKey: "orderId" });
Shipment.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(ProductSize, { foreignKey: "productSizeId" });
ProductSize.hasMany(OrderItem, { foreignKey: "productSizeId" });

User.hasMany(ProductReview, { foreignKey: 'userId', as: 'reviews' });
ProductReview.belongsTo(User, { foreignKey: 'userId', as: 'user' });


// models/OrderItem.js
// OrderItem.belongsTo(ProductSize, {
//   as: "ProductSize", // Alias di sini
//   foreignKey: "productSizeId",
// });

// // models/ProductSize.js
// ProductSize.hasMany(OrderItem, {
//   as: "OrderItems", // Alias untuk relasi balik
//   foreignKey: "productSizeId",
// });


export {
  Product,
  ProductColor,
  ProductSize,
  ProductImage,
  ProductReview,
  Order,
  OrderItem,
  Payment,
  Cart,
  User,
  Shipment,
};
