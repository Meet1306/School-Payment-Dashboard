const jwt = require("jsonwebtoken");
const { order } = require("../models/order");
const { orderStatus } = require("../models/orderStatus");
const axios = require("axios");


const handleCreateTransaction = async (req, res) => {
  try {
    const {
      school_id,
      trustee_id,
      student_name,
      student_id,
      student_email,
      amount,
      gateway_name,
    } = req.body;

    if (
      !school_id ||
      !trustee_id ||
      !amount ||
      !gateway_name ||
      !student_name ||
      !student_id ||
      !student_email
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number" });
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
      student_info: {
        name: student_name,
        id: student_id,
        email: student_email,
      },
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

const handleFetchAllTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;

    const skip = (page - 1) * limit;
    const totalTransactions = await orderStatus.countDocuments({});
    const totalPages = Math.ceil(totalTransactions / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    const nextPage = hasNextPage ? page + 1 : null;
    const previousPage = hasPreviousPage ? page - 1 : null;
    const pagination = {
      totalTransactions,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage,
      previousPage,
    };

    const transactions = await orderStatus
      .aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "collect_id",
            foreignField: "txId",
            as: "orderData",
          },
        },
        {
          $unwind: "$orderData",
        },
        {
          $project: {
            collect_id: 1,
            school_id: "$orderData.school_id",
            gateway: "$orderData.gateway_name",
            order_amount: 1,
            transaction_amount: 1,
            status: 1,
            payment_time: 1,
            custom_order_id: "$orderData._id",
          },
        },
        {
          $sort: {
            payment_time: -1,
          },
        },
      ])
      .skip(skip)
      .limit(limit);

    res.json({ transactions, pagination });
  } catch (error) {
    console.log("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const handleFetchSchoolTransactions = async (req, res) => {
  const { school_id } = req.params;

  try {
    const limit = parseInt(req.query.limit) || 5;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const totalTransactions = await order.countDocuments({ school_id });
    const totalPages = Math.ceil(totalTransactions / limit);

    const transactions = await order.aggregate([
      {
        $lookup: {
          from: "orderstatuses",
          localField: "txId",
          foreignField: "collect_id",
          as: "orderData",
        },
      },
      {
        $unwind: "$orderData",
      },
      {
        $project: {
          txId: 1,
          student_info: 1,
          gateway: 1,
          status: "$orderData.status",
          trustee_id: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    return res.json({
      transactions,
      pagination: {
        totalTransactions,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
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
      return res.status(404).json({ message: "Transaction was not initated" });
    }
    return res.json(OrderStatus);
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleCreateTransaction,

  handleFetchAllTransactions,
  handleFetchSchoolTransactions,
  handleCheckTransactionStatus,
};
