import mongoose from "mongoose";

// Phone number schema
const phoneNumberSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Inquiry", "Support"],
  },
  number: {
    type: String,
    required: true,
  },
});

// Email schema
const emailSchema = new mongoose.Schema({
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
});

// Contact schema
export const contactSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Branch", "HQ"], // Allowed types for contact
    },
    location: {
      type: String,
      required: function () {
        return this.type === "Branch";
      }, // Only required if 'Branch'
    },
    phoneNumbers: [phoneNumberSchema],
    emails: [emailSchema],
  },
  { _id: false }
);
