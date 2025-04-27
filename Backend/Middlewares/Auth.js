const jwt = require("jsonwebtoken");
const { user } = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded", decoded);

    const userData = await user.findById(decoded.id);
    if (!userData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      name: decoded.name,
      email: decoded.email,
      id: decoded.id,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { auth };
