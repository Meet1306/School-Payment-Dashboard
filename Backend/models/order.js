const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  txId: {
    type: String,
    required: true,
  },
  school_id: {
    type: String,
    required: true,
  },
  trustee_id: {
    type: String,
    required: true,
  },
  student_info: {
    type: Object,
    required: true,
  },
  gateway_name: {
    type: String,
    required: true,
  },
});

const order = mongoose.model("order", orderSchema);

module.exports = { order };
