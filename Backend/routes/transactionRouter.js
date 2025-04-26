const express = require("express");
const transactionRouter = express.Router();
const {
  handleCreateTransaction,
  handleVerifyTransaction,
} = require("../controllers/transaction");

transactionRouter.post("/create-payment", handleCreateTransaction);
transactionRouter.get("/verify-payment", handleVerifyTransaction);

module.exports = { transactionRouter };
