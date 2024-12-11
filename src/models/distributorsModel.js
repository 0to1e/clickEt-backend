import mongoose from "mongoose";
import { contactSchema } from "./fieldTypeSchemas/distributorSchemas/contactSchemas.js";
import { locationSchema } from "./fieldTypeSchemas/distributorSchemas/locationSchema.js";
import { distributionRightSchema } from "./fieldTypeSchemas/distributorSchemas/distributorRights.js";

const distributorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    locations: [locationSchema],
    contacts: [contactSchema],
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    distributionRights: [distributionRightSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
export const Distributor = mongoose.model("distributors", distributorSchema);
