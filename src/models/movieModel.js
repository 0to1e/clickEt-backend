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
      enum: ["Nepali", "Bollywood", "Hollywood"],
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
      type: Number,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    posterURL: {
      type: String,
      required: true,
    },
    trailerURL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("movies", movieSchema);
