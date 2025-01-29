import { v4 as uuidv4 } from "uuid";
import { Cart, ImagesPayment, Order, OrderItem, Payment, Product, ProductSize, ReturnShipment, Shipment } from "../models/index.js";
import { Sequelize } from "sequelize";

const createOrder = async (req, res) => {
  const {
    userId,
    customerName,
    phoneNumber,
    address,
    products,
    paymentMethod,
    rentalStartDate,
    rentalDuration,
    metodePayment,
    cartIds,
    ongkir
  } = req.body;

  try {
    // Validasi data yang diterima
    if (!userId || !products || products.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Calculate total amount
    const totalAmount = products.reduce(
      (sum, product) => sum + product.price * product.quantity * rentalDuration,
      0
    ) + ongkir;

    // Create order
    const order = await Order.create({
      userId,
      customerName,
      phoneNumber,
      address,
      totalAmount,
      paymentMethod,
      rentalStartDate,
      rentalDuration,
    });

    // Add order items
    const orderItems = products.map((product) => ({
      orderId: order.id,
      productId: product.productId,
      productName: product.productName,
      quantity: product.quantity,
      size: product.size,
      color: product.color,
      price: product.price,
    }));

    await OrderItem.bulkCreate(orderItems);

    // Generate paymentCode
    const generatePaymentCode = () => `PAY-${new Date().getTime()}-${uuidv4().slice(0, 8)}`;

    // Calculate payment logic based on the payment method
    if (paymentMethod === "Two-Installments") {
      const firstInstallment = totalAmount > 200000 ? 100000 : 50000;
      const remainingAmount = totalAmount - firstInstallment;

      // Create first installment payment
      await Payment.create({
        orderId: order.id,
        paymentCode: generatePaymentCode(),
        paymentMethod: metodePayment,
        amount: firstInstallment,
        paymentStatus: "Pending",
      });

      // Schedule second installment payment
      const rentalEndDate = new Date(rentalStartDate);
      rentalEndDate.setDate(rentalEndDate.getDate() + rentalDuration - 1); // 1 day before end date

      await Payment.create({
        orderId: order.id,
        paymentCode: generatePaymentCode(),
        paymentMethod: metodePayment,
        amount: remainingAmount,
        paymentStatus: "Pending",
        paymentDate: rentalEndDate,
      });
    } else {
      // Single payment
      await Payment.create({
        orderId: order.id,
        paymentCode: generatePaymentCode(),
        paymentMethod: metodePayment,
        amount: totalAmount,
        paymentStatus: "Pending",
      });
    }

    // Update stock for each product and size
    for (let product of products) {
      const productSize = await ProductSize.findOne({
        where: {
          productId: product.productId,
          size: product.size,
        },
      });

      if (productSize) {
        // Reduce stock quantity based on the quantity ordered
        await productSize.update({
          stock: productSize.stock - product.quantity,
        });
      }
    }

    // Hapus item dari keranjang berdasarkan cartIds
    if (cartIds && cartIds.length > 0) {
      await Cart.destroy({
        where: { id: cartIds },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params; // Get orderId from the URL params

  try {
    // Find the order by orderId
    const order = await Order.findOne({
      where: { id: orderId },
    });

    // If order doesn't exist, return a 404 response
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is already cancelled
    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    // Update the order status to "Cancelled"
    order.status = "Cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling the order", error: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch order details with related items and payments
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          attributes: [
            "productId",
            "productName",
            "quantity",
            "size",
            "color",
            "price",
          ],
        },
        {
          model: Payment,
          attributes: [
             "id",
            "paymentMethod",
            "amount",
            "paymentStatus",
            "paymentDate",
            "paymentCode"
          ],
          include: [
            {
              model: ImagesPayment,
              as: "images",
              attributes: ["id", "url"], // Menampilkan data gambar pembayaran
            },
          ],
        },
        {
          model: Shipment,
          attributes: [
            "id",
            "trackingNumber",
            "shippingMethod",
            "shippingStatus",
            "estimatedDeliveryDate",
            "actualDeliveryDate",
          ],
        },
        {
          model: ReturnShipment,
        }
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order details fetched successfully",
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order details", error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    // Get page and limit from query params, and convert to integers
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);  // Ensure page is an integer
    limit = parseInt(limit, 10); // Ensure limit is an integer

    // Calculate the offset based on page and limit
    const offset = (page - 1) * limit;

    // Fetch orders and include related items and payments
    const { rows: orders, count: totalOrders } = await Order.findAndCountAll({
      include: [
        {
          model: OrderItem,
          attributes: [
            "productId",
            "productName",
            "quantity",
            "size",
            "color",
            "price",
          ],
        },
        {
          model: Payment,
          attributes: [
            "paymentMethod",
            "amount",
            "paymentStatus",
            "paymentDate",
            "paymentCode",
          ],
        },
        {
          model: Shipment,
          attributes: [
            "id",
            "trackingNumber",
            "shippingMethod",
            "shippingStatus",
            "estimatedDeliveryDate",
            "actualDeliveryDate",
          ],
        },
        {
          model: ReturnShipment,
        }
      ],
      limit, 
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      total: totalOrders, // Include the total count of orders
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit), // Calculate total pages
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          attributes: [
            "productId",
            "productName",
            "quantity",
            "size",
            "color",
            "price",
          ],
        },
        {
          model: Payment,
          attributes: [
            "paymentMethod",
            "amount",
            "paymentStatus",
            "paymentDate",
            "paymentCode",
          ],
        },
        {
          model: Shipment, // Include the Shipment model
          attributes: [
            "id",
            "trackingNumber",
            "shippingMethod",
            "shippingStatus",
            "estimatedDeliveryDate",
            "actualDeliveryDate",
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

const getCompletedOrdersByuserId = async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch all orders with status 'Completed'
    const orders = await Order.findAll({
      where: { status: "Completed", userId }, // Filter by 'Completed' status
      include: [
        {
          model: OrderItem,
          attributes: [
            "productId",
            "productName",
            "quantity",
            "size",
            "color",
            "price",
          ],
        },
        {
          model: Payment,
          attributes: [
            "paymentMethod",
            "amount",
            "paymentStatus",
            "paymentDate",
          ],
        },
      ],
    });

    res.status(200).json({
      message: "Completed orders fetched successfully",
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching completed orders",
      error: error.message,
    });
  }
};

const getCompletedOrders = async (req, res) => {
  try {
    // Get page and limit from query params, and convert to integers
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);  // Ensure page is an integer
    limit = parseInt(limit, 10); // Ensure limit is an integer

    // Calculate the offset based on page and limit
    const offset = (page - 1) * limit;

    // Fetch orders and include related items and payments
    const { rows: orders, count: totalOrders } = await Order.findAndCountAll({
      where: { status: "Completed" },
      include: [
        {
          model: OrderItem,
          attributes: [
            "productId",
            "productName",
            "quantity",
            "size",
            "color",
            "price",
          ],
        },
        {
          model: Payment,
          attributes: [
            "paymentMethod",
            "amount",
            "paymentStatus",
            "paymentDate",
            "paymentCode",
          ],
        },
      ],
      where: { status: "Completed" }, // Filter by status "Completed"
      limit, // Limit number of results per page
      offset, // Apply the offset based on pagination
      order: [["createdAt", "DESC"]], // Optional: Add sorting to your query
    });

    res.status(200).json({
      message: "Orders fetched successfully",
      totalOrders, // Include the total count of orders
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status, orderId } = req.body;

  try {
    // Cari order berdasarkan orderId
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
        },
      ],
    });

    // Jika order tidak ditemukan, kirim respons 404
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Perbarui status order
    order.status = status;
    await order.save();

    // Hanya lakukan pembaruan stok jika status adalah "Completed"
    if (status === "Completed") {
      // Ambil semua OrderItems dari order
      const orderItems = order.OrderItems;

      // Iterasi untuk mendapatkan productId dari setiap OrderItem
      for (const item of orderItems) {
        const { productId, size, quantity } = item;

        // Cari ukuran produk berdasarkan productId dan size
        const productSize = await ProductSize.findOne({
          where: {
            productId: productId,
            size: size, // Sesuaikan key "size" dengan skema database Anda
          },
        });

        // Jika ProductSize ditemukan, perbarui stoknya
        if (productSize) {
          productSize.stock += quantity; // Tambahkan kuantitas ke stok
          await productSize.save();
        } else {
          return res.status(400).json({
            message: `Product size not found for productId: ${productId}, size: ${size}`,
          });
        }
      }
    }

    res.status(200).json({
      message: "Order status and product stock updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status and product stock",
      error: error.message,
    });
  }
};

const getOrdersByMonth = async (req, res) => {
  try {
    // Ambil data pesanan dengan status "Completed", grup berdasarkan bulan
    const ordersByMonth = await Order.findAll({
      where: { status: "Completed" },
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "monthNumber"], // Ambil nomor bulan
        [Sequelize.fn("MONTHNAME", Sequelize.col("createdAt")), "monthName"], // Ambil nama bulan
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalOrders"], // Hitung total pesanan
      ],
      group: [
        Sequelize.fn("MONTH", Sequelize.col("createdAt")), // Grup berdasarkan bulan dalam angka
        Sequelize.fn("MONTHNAME", Sequelize.col("createdAt")), // Menambahkan grup berdasarkan nama bulan
      ],
      order: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"], // Urutkan berdasarkan bulan
      ],
    });

    // Daftar semua bulan dalam setahun
    const allMonths = [
      { monthNumber: 1, monthName: "January" },
      { monthNumber: 2, monthName: "February" },
      { monthNumber: 3, monthName: "March" },
      { monthNumber: 4, monthName: "April" },
      { monthNumber: 5, monthName: "May" },
      { monthNumber: 6, monthName: "June" },
      { monthNumber: 7, monthName: "July" },
      { monthNumber: 8, monthName: "August" },
      { monthNumber: 9, monthName: "September" },
      { monthNumber: 10, monthName: "October" },
      { monthNumber: 11, monthName: "November" },
      { monthNumber: 12, monthName: "December" },
    ];

    // Gabungkan data hasil query dengan defaultData
    const formattedResponse = allMonths.map((defaultMonth) => {
      const matchingData = ordersByMonth.find(
        (order) =>
          parseInt(order.dataValues.monthNumber, 10) === defaultMonth.monthNumber
      );
      return {
        month: defaultMonth.monthName,
        totalOrders: matchingData
          ? parseInt(matchingData.dataValues.totalOrders, 10)
          : 0, // Gunakan 0 jika tidak ada transaksi
      };
    });

    // Kirimkan respons
    res.status(200).json({
      message: "Orders by month fetched successfully",
      ordersByMonth: formattedResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders by month",
      error: error.message,
    });
  }
};

const updateStockByOrderId = async (req, res) => {
  const { orderId } = req.body;

  try {
    // Cari order berdasarkan orderId
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
          include: [
            {
              model: ProductSize,
              as: "ProductSize",
            },
          ],
        },
      ],
    });


    // Jika order tidak ditemukan, kirim respons 404
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Debugging: Log order data untuk memastikan struktur benar
    console.log(JSON.stringify(order, null, 2));

    // Perbarui stok untuk setiap item dalam order
    const orderItems = order.OrderItems;
    for (const item of orderItems) {
      // Validasi jika ProductSize ada
      if (!item.ProductSize) {
        return res.status(400).json({
          message: `ProductSize not found for order item ${item.id}`,
        });
      }

      const productSize = await ProductSize.findOne({
        where: {
          id: item.ProductSize.id,
          size: item.ProductSize.size,
        },
      });

      if (productSize) {
        // Tambahkan stok berdasarkan quantity dari order item
        await productSize.update({
          stock: productSize.stock + item.quantity,
        });
      } else {
        return res.status(400).json({
          message: `ProductSize not found for size ${item.ProductSize.size}`,
        });
      }
    }

    res.status(200).json({
      message: "Stock updated successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating stock",
      error: error.message,
    });
  }
};

export {
  getOrders,
  cancelOrder,
  createOrder,
  getOrderDetails,
  getOrdersByUserId,
  updateOrderStatus,
  getCompletedOrders,
  getCompletedOrdersByuserId,
  getOrdersByMonth,
  updateStockByOrderId,
};
