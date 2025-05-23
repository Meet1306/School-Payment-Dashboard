const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.statics.register = async function (name, email, password) {
  try {
    //validate the email and password using validator
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
      );
    }

    const existingUser = await this.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this({ name, email, password: hashedPassword });
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

userSchema.statics.login = async function (email, password) {
  try {
    if (!validator.isEmail(email)) {
      throw new Error("Invalid email format");
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol"
      );
    }
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("Invalid email ");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const payload = {
      name: user.name,
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { token, user: payload };
  } catch (error) {
    throw new Error(error.message);
  }
};

const user = mongoose.model("user", userSchema);

module.exports = { user };
