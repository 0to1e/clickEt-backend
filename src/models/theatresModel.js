import mongoose from "mongoose";
import {
  contactSchema,
  locationSchema,
} from "../models/fieldTypeSchemas/theatreSchemas/theatreSchemas.js";
const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    location: [locationSchema],
    contact: [contactSchema],
    hallIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "halls",
        required: false,
      },
    ],
    commissionRate: [
      {
        address: {
          type: String,
          required: true,
          unique: true,
        },
        rate: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
      },
    ],
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

export const Theatre = mongoose.model("theatres", theatreSchema);
