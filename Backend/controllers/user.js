const { user } = require("../models/user");

async function handleUserRegister(req, res) {
  const { name, email, password } = req.body;
  try {
    const User = await user.register(name, email, password);
    console.log(User);

    if (!User) {
      return res.status(400).json({ message: "User already exists" });
    }

    res.status(201).json({ message: "User registered successfully", User });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  try {
    const User = await user.login(email, password);
    if (!User) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", User });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  handleUserRegister,
  handleUserLogin,
};
