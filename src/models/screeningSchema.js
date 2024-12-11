import mongoose from 'mongoose'

const screeningSchema = new mongoose.Schema({
    movieId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Movie', 
      required: true 
    },
    theatreId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Theatre', 
      required: true 
    },
    distributorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Distributor', 
      required: true 
    },
    hallId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Hall', 
      required: true 
    },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    purchasedSeats: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'cancelled'], 
      default: 'active' 
    },
    cancellationReason: { type: String }
  }, { timestamps: true });
  
  export const Screening = mongoose.model('screenings', screeningSchema);
  