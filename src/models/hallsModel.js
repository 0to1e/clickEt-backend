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


