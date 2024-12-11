import mongoose from "mongoose";
import { moviesArchiveSchema } from "../schemas/movieArchiveSchema.js";
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
