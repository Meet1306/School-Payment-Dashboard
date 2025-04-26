const express = require("express");
const transactionRouter = express.Router();
const {
  handleCreateTransaction,
  handleVerifyTransaction,
  handleFetchAllTransactions,
  handleFetchSchoolTransactions,
  handleCheckTransactionStatus,
} = require("../controllers/transaction");

transactionRouter.get("/", handleFetchAllTransactions);
transactionRouter.post("/create-payment", handleCreateTransaction);
transactionRouter.get("/verify-payment", handleVerifyTransaction);
transactionRouter.get("/school/:school_id", handleFetchSchoolTransactions);
transactionRouter.get(
  "/transaction-status/:custom_order_id",
  handleCheckTransactionStatus
);

module.exports = { transactionRouter };
