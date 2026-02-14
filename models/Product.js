const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: Number,
  stock: Number
});

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  price: Number,
  description: String,
  images: [String],
  sizes: [sizeSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
