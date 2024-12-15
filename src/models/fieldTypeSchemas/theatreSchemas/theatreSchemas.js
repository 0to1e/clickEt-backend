import { coordinatesSchema } from "../common/coordinateSchema.js";

export const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    coordinates: {
      type: coordinatesSchema,
      required: true,
    },
  },
  { _id: false }
);

export const contactSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    phoneNumbers: [
      {
        type: { type: String, required: true },
        number: { type: String, required: true, unique: true },
      },
    ],
    emails: [
      {
        type: {
          type: String,
          enum: ["Support", "Inquiry"],
          required: true,
        },
        email: {
          type: String,
          required: true,
          unique: true,
        },
      },
    ],
  },
  { _id: false }
);
