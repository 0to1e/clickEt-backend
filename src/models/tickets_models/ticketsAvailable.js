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
