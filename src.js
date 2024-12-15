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
  this.password = await bcrypt.hash(this.password, 10);
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





import { contactSchema } from "./schemas/contactSchema";

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: dict,
      required: true,
    },
    contact: {
      type: contactSchema,
      required: true,
      unique: true,
    },
    hallIds: {
      type: Map,
      of: String,
    },
    commissionRate: {
      type: float,
      required: true,
      default: 0.0,
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Theatre = mongoose.model("theatres", theatreSchema);




import mongoose from 'mongoose'

const screeningSchema = new mongoose.Schema({
    movieId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Movie', 
      required: true 
    },
    theatreId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Theatre', 
      required: true 
    },
    distributorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Distributor', 
      required: true 
    },
    hallId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hall', 
      required: true 
    },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    purchasedSeats: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'cancelled'], 
      default: 'active' 
    },
    cancellationReason: { type: String }
  }, { timestamps: true });
  
  export const Screening = mongoose.model('screenings', screeningSchema);
  





  import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modeOfPayment: {
      type: String,
      enum: ["BANK", "CASH", "ESEWA", "KHALTI"],
      required: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    amount: { type: Number, required: true },
    refundState: {
      type: String,
      enum: [null, "INIT", "PENDING", "SUCCESSFUL", "REFUNDED"],
      default: null,
    },
    refundReason: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("payments", paymentSchema);



import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Nepali, Bollywood, Hollywood"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      unique: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },
    duration_min: {
      type: int,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    posterUrl: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("movies", movieSchema);


const hallSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      theatreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theatre",
        required: true,
      },
      totalSeats: { type: Number, required: true },
      isUsed: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    },
    {
      timestamps: true,
    }
  );
  
  export const Hall = mongoose.model("halls", hallSchema);
  
  

  

import { contactSchema } from "./schemas/contactSchema";

const distributorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: dict,
      required: true,
    },
    contact: {
      type: contactSchema,
      required: true,
      unique: true,
    },
    commissionRate: {
      type: float,
      required: true,
      default: 0.0,
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Distributor = mongoose.model("distributors", distributorSchema);





const ticketPurchasedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      required: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
    },
    seats: { type: mongoose.Schema.Types.Mixed },
    price: { type: Number, required: true },
    checkedIn: { type: Boolean, required: true, default: false },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
  },
  { timestamps: true }
);

export const TicketPurchased = mongoose.model(
  "ticketsPurchased",
  ticketPurchasedSchema
);

const ticketArchiveSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, primaryKey: true },
    userId: { type: String },
    movies: [moviesArchiveSchema],
  },
  { timestamps: true }
);

export const TicketArchive = mongoose.model(
  "ticketsArchive",
  ticketArchiveSchema
);

import mongoose from "mongoose";

export const moviesArchiveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    theatreName: {
      type: String,
      required: true,
    },
    distributor: {
      type: String,
      required: true,
    },
    hall: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    seats: { type: [String], required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);


import mongoose from "mongoose";

const ticketAvalilableSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      required: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
    },
    seatsAvailable: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const TicketAvailable = mongoose.model(
  "ticketsAvailable",
  ticketAvalilableSchema
);

import mongoose from "mongoose";

const ticketPendingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, primaryKey: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      required: true,
    },
    screeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screening",
      required: true,
    },
    price: { type: Number, required: true, default: 0.0 },
  },
  { timestamps: true }
);

export const TicketPending = mongoose.model(
  "ticketsPending",
  ticketPendingSchema
);
