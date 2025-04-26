const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema(
  {
    collect_id: {
      type: String,
      required: true,
    },
    order_amount: {
      type: Number,
    },
    transaction_amount: {
      type: Number,
    },
    payment_mode: {
      type: String,
    },
    payment_details: {
      type: String,
    },
    back_reference: {
      type: String,
    },
    payment_message: {
      type: String,
    },
    status: {
      type: String,
    },
    error_message: {
      type: String,
    },
    payment_time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const orderStatus = mongoose.model("OrderStatus", orderStatusSchema);

module.exports = { orderStatus };
