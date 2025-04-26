const jwt = require("jsonwebtoken");
const { order } = require("../models/order");
const axios = require("axios");

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

module.exports = { handleCreateTransaction, handleVerifyTransaction };
