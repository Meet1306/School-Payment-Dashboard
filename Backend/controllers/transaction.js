const jwt = require("jsonwebtoken");
const { order } = require("../models/order");
const { orderStatus } = require("../models/orderStatus");
const axios = require("axios");
const { transactionRouter } = require("../routes/transactionRouter");

const handleCreateTransaction = async (req, res) => {
  try {
    const { school_id, trustee_id, amount, gateway_name } = req.body;
    //school_id, trustee_id, gateway_name
    const user = req.user;

    if (!school_id || !trustee_id || !amount || !gateway_name) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const payload = {
      school_id: school_id.toString(),
      amount: amount.toString(),
      callback_url: process.env.CALLBACK_URL,
    };
    const sign = jwt.sign(payload, process.env.pg_key);

    const response = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      {
        school_id: school_id.toString(),
        amount: amount.toString(),
        callback_url: process.env.CALLBACK_URL,
        sign,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );

    const newOrder = new order({
      txId: response.data.collect_request_id,
      school_id,
      trustee_id,
      student_info: user,
      gateway_name,
    });
    await newOrder.save();

    return res.json({
      collect_request_id: response.data.collect_request_id,
      collect_request_url: response.data.collect_request_url,
      sign: response.data.sign,
    });
  } catch (error) {
    // console.log("Error creating payment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleVerifyTransaction = async (req, res) => {
  try {
    const { collect_request_id, school_id } = req.query;
    if (!collect_request_id || !school_id) {
      return res
        .status(400)
        .json({ message: "Invalid url for verifying the transaction" });
    }
    const payload = {
      school_id,
      collect_request_id,
    };
    const sign = jwt.sign(payload, process.env.pg_key);
    const response = await axios.get(
      `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
      }
    );
    return res.json(response.data);
  } catch (error) {
    console.log("Error verifying payment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleFetchAllTransactions = async (req, res) => {
  try {
    const transactions = await orderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id", // OrderStatus.collect_id (ObjectId)
          foreignField: "txId", // Matches Order.txId
          as: "details",
        },
      },
      { $unwind: "$details" }, // Convert the array to an object
      {
        $project: {
          collect_id: "$collect_id",
          custom_order_id: "$details._id", // Using Order._id as custom ID
          school_id: "$details.school_id",
          gateway: "$details.gateway_name",
          // From OrderStatus:
          order_amount: 1,
          transaction_amount: 1,
          status: 1,
          payment_time: 1,
        },
      },
    ]);

    res.json(transactions);
  } catch (error) {
    console.log("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleFetchSchoolTransactions = async (req, res) => {
  const { school_id } = req.params;
  try {
    const SchoolTransactions = await order.find({ school_id });
    if (!SchoolTransactions) {
      return res.status(404).json({ message: "No transactions found" });
    }
    return res.json(SchoolTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleCheckTransactionStatus = async (req, res) => {
  const { custom_order_id } = req.params;

  try {
    const Order = await order.findById(custom_order_id);
    if (!Order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const transactionId = Order.txId;
    const OrderStatus = await orderStatus.findOne({
      collect_id: transactionId,
    });
    if (!OrderStatus) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    return res.json(OrderStatus);
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleCreateTransaction,
  handleVerifyTransaction,
  handleFetchAllTransactions,
  handleFetchSchoolTransactions,
  handleCheckTransactionStatus,
};
