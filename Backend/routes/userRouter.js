const express = require("express");
const userRouter = express.Router();
const { handleUserRegister, handleUserLogin } = require("../controllers/user");

userRouter.post("/register", handleUserRegister);
userRouter.post("/login", handleUserLogin);

module.exports = { userRouter };
