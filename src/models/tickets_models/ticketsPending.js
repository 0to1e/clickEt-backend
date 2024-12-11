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
