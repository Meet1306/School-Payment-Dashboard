const express = require("express");
const webhookRouter = express.Router();
const { orderStatus } = require("../models/orderStatus");
const { order } = require("../models/order");

webhookRouter.post("/", async (req, res) => {
  const orderInfo = req.body.order_info;
  // console.log("Webhook received:", orderInfo);

  try {
    const Order = await order.findOne({
      txId: orderInfo.order_id,
    });

    if (!Order) {
      return res.status(404).json({ error: "Payment Order was not made" });
    }

    const newOrderStatus = new orderStatus({
      collect_id: orderInfo.order_id,
      order_amount: orderInfo.order_amount,
      transaction_amount: orderInfo.transaction_amount,
      payment_mode: orderInfo.payment_mode,
      payment_details: orderInfo.payment_details,
      bank_reference: orderInfo.bank_reference,
      payment_message: orderInfo.payment_message,
      status: orderInfo.status,
      error_message: orderInfo.error_message,
      payment_time: orderInfo.payment_time,
    });
    await newOrderStatus.save();

    const gateway = orderInfo.gateway;
    await Order.updateOne(
      { txId: orderInfo.order_id },
      { gateway_name: gateway }
    );

    const transaction = {
      collect_id: orderInfo.order_id,
      school_id: Order.school_id,
      gateway,
      order_amount: orderInfo.order_amount,
      transaction_amount: orderInfo.transaction_amount,
      status: orderInfo.status,
      payment_time: orderInfo.payment_time,
      custom_order_id: Order._id,
    };

    const io = req.app.get("io");

    if (io) {
      io.emit("transaction", transaction); // Emit the transaction event to all connected clients
    } else {
      console.log("Socket.io instance not found in app settings.");
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { webhookRouter };
