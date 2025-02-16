import mongoose from "mongoose";

// Phone number schema
const phoneNumberSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Inquiry", "Support"],
    },
    number: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// Email schema
const emailSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Inquiry", "Support"],
    },
    email: {
      type: String,
      required: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
  },
  { _id: false }
);

// Contact schema
export const contactSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },
    phoneNumbers: [phoneNumberSchema],
    emails: [emailSchema],
  },
  { _id: false }
);
