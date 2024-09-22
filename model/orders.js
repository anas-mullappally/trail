const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    min: 1,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
  },
});

// Address Schema
const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  state: String,
  postcode: String,
  email: String,
  phone: String,
});

// Orders Schema
const ordersSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: false,
      trim: true,
    },
    products: [productSchema],
    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    payment: {
      method: {
        type: String,
        enum: ["cod", "online"],
        required: true,
      },
      paymentId: String,
    },
    address: {
      type: addressSchema,
      required: true,
    },
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", ordersSchema);

module.exports = Orders;
