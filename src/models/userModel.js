import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MODERATOR", "EDITOR", "USER"],
      default: "USER",
    },
    password_reset_Token: { type: String, default: null },
    password_reset_expiry: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJWTToken = async function () {
  return jwt.sign({ id: this._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY,
  });
};

userSchema.methods.generateRecoveryToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.password_reset_Token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.password_reset_expiry = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("users", userSchema);

export default User;