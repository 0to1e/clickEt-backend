// src/controllers/bookingController.js
import { Booking } from "../models/bookingModel.js";
import { Screening } from "../models/screeningModel.js";
import crypto from "crypto";
import { getUserIdFromToken, isValidObjectId } from "../utils/tokenUtils.js";
import {
  cleanupExpiredHolds,
  updateScreeningSeats,
} from "../utils/bookingSchemaUtils/bookingUtils.js";
import generatePdf from "../utils/pdfUtils/pdfGenerator.js";

export const bookingController = {
  // Hold seats
  holdSeats: async (request, response) => {
    try {
      // First cleanup any expired holds
      await cleanupExpiredHolds();

      const { screeningId, seats } = request.body;
      const holdDuration = 600; // 10 minutes in seconds
      const holdId = crypto.randomUUID();

      const token = request.cookies.access_token;
      if (!token) {
        return response.status(401).json({ message: "Token not available" });
      }

      const userId = getUserIdFromToken(token);
      if (!isValidObjectId(userId)) {
        return response.status(401).json({ message: "Invalid user ID" });
      }

      // Check existing holds
      const existingHold = await Booking.findOne({
        userId,
        screeningId,
        status: "held",
        holdExpiresAt: { $gt: new Date() },
      });

      if (existingHold) {
        return response.status(400).json({
          message: "You already have seats on hold for this screening",
        });
      }

      // Find screening and verify seats
      const screening = await Screening.findOne({ _id: screeningId });
      if (!screening) {
        return response.status(404).json({ message: "Screening not found" });
      }

      // Validate seat coordinates and availability
      const unavailableSeats = [];
      const invalidSeats = [];

      for (const seat of seats) {
        const { section, row, seatNumber } = seat;

        if (!screening.seatGrid[section]) {
          invalidSeats.push(`Section ${section} does not exist`);
          continue;
        }

        if (!screening.seatGrid[section].rows[row]) {
          invalidSeats.push(`Row ${row} in section ${section} does not exist`);
          continue;
        }

        if (!screening.seatGrid[section].rows[row][seatNumber]) {
          invalidSeats.push(
            `Seat ${seatNumber} in row ${row}, section ${section} does not exist`
          );
          continue;
        }

        const seatStatus = screening.seatGrid[section].rows[row][seatNumber];
        if (seatStatus.code !== "a") {
          unavailableSeats.push(`${section}-${row}-${seatNumber}`);
        }
      }

      if (invalidSeats.length > 0) {
        return response.status(400).json({
          message: "Invalid seat selections",
          errors: invalidSeats,
        });
      }

      if (unavailableSeats.length > 0) {
        return response.status(400).json({
          message: `Seats ${unavailableSeats.join(", ")} are not available`,
        });
      }

      // Create hold booking
      const holdExpiry = new Date(Date.now() + holdDuration * 1000);
      const booking = await Booking.create({
        userId,
        screeningId,
        seats,
        status: "held",
        holdId,
        holdExpiresAt: holdExpiry,
        totalPrice: seats.length * screening.finalPrice,
      });

      // Update screening seats
      const updatedScreening = await updateScreeningSeats(
        screeningId,
        seats,
        "h",
        holdId,
        booking._id,
        holdExpiry
      );

      if (!updatedScreening) {
        // Rollback: delete the booking if seat update failed
        await Booking.findByIdAndDelete(booking._id);
        return response.status(409).json({
          message: "Seats no longer available",
        });
      }

      response.json({
        message: "Seats held successfully",
        holdId,
        bookingId: booking._id,
        expiresAt: holdExpiry,
      });
    } catch (error) {
      console.error("Hold seats error:", error);
      response.status(500).json({
        message: "An error occurred while processing your request",
        error: error.message,
      });
    }
  },

  releaseHold: async (request, response) => {
    try {
      const { holdId } = request.params;
      const token = request.cookies.access_token;
      if (!token) {
        return response.status(401).json({ message: "Token not available" });
      }

      const userId = getUserIdFromToken(token);
      if (!isValidObjectId(userId)) {
        return response.status(401).json({ message: "Invalid user ID" });
      }

      const booking = await Booking.findOne({
        holdId,
        userId,
        status: "held",
        holdExpiresAt: { $gt: new Date() },
      });

      if (!booking) {
        return response.status(404).json({ message: "No active hold found" });
      }

      // Update screening seats back to available
      const updatedScreening = await updateScreeningSeats(
        booking.screeningId,
        booking.seats,
        "a",
        null,
        null,
        null
      );

      if (!updatedScreening) {
        return response.status(500).json({
          message: "Failed to update screening",
        });
      }

      // Update booking status
      booking.status = "cancelled";
      booking.holdExpiresAt = new Date();
      await booking.save();

      response.json({ message: "Hold released successfully" });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },

  confirmBooking: async (request, response) => {
    try {
      const { holdId } = request.body;
      const token = request.cookies.access_token;
      if (!token) {
        return response.status(401).json({ message: "Token not available" });
      }

      const userId = getUserIdFromToken(token);
      if (!isValidObjectId(userId)) {
        return response.status(401).json({ message: "Invalid user ID" });
      }

      // Find the booking with populated screening details
      const booking = await Booking.findOne({
        holdId,
        userId,
        status: "held",
        holdExpiresAt: { $gt: new Date() },
      });

      if (!booking) {
        return response.status(404).json({
          message: "No active hold found or hold has expired",
        });
      }

      // Get all required details in a single query
      const screening = await Screening.findById(booking.screeningId)
        .populate("movieId", "name")
        .populate("distributorId", "name")
        .populate("theatreId", "name")
        .populate("hallId", "name");

      if (!screening) {
        return response.status(404).json({
          message: "Screening not found",
        });
      }

      // Update screening seats
      const updatedScreening = await Screening.findOneAndUpdate(
        {
          _id: booking.screeningId,
          // Verify seats are still held by this booking
          ...booking.seats.reduce((acc, { section, row, seatNumber }) => {
            acc[`seatGrid.${section}.rows.${row}.${seatNumber}.holdId`] =
              holdId;
            return acc;
          }, {}),
        },
        {
          $set: {
            ...booking.seats.reduce((acc, { section, row, seatNumber }) => {
              acc[`seatGrid.${section}.rows.${row}.${seatNumber}`] = {
                code: "r",
                holdExpiresAt: null,
                holdId: null,
                bookingId: booking._id,
              };
              return acc;
            }, {}),
          },
          $inc: { version: 1 },
        },
        { new: true }
      );

      if (!updatedScreening) {
        return response.status(409).json({
          message: "Seats no longer held",
        });
      }

      // Update booking details
      booking.status = "confirmed";
      booking.holdExpiresAt = null;
      booking.confirmationDetails = {
        confirmedAt: new Date(),
        confirmationCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
      };
      await booking.save();

      // Format seats for response
      const formattedSeats = booking.seats.map((seat) => ({
        section: seat.section,
        row: String.fromCharCode(65 + seat.row), // Convert row number to letter (0 = A, 1 = B, etc.)
        seatNumber: seat.seatNumber + 1, // If your seat numbers are 0-based
      }));

      // Format date and time
      const screeningDate = new Date(screening.startTime);
      const formattedDate = screeningDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = screeningDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      response.json({
        message: "Booking confirmed successfully",
        confirmationCode: booking.confirmationDetails.confirmationCode,
        bookingDetails: {
          movieName: screening.movieId.name,
          date: formattedDate,
          startTime: formattedTime,
          distributorName: screening.distributorId.name,
          theatreName: screening.theatreId.name,
          hallName: screening.hallId.name,
          seats: formattedSeats,
          totalPrice: booking.totalPrice,
        },
      });
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },

  // Get user's active holds
  getActiveHolds: async (request, response) => {
    try {
      const token = request.cookies.access_token;
      if (!token) {
        return response.status(401).json({ message: "Token not available" });
      }

      const userId = getUserIdFromToken(token);
      if (!isValidObjectId(userId)) {
        return response.status(401).json({ message: "Invalid user ID" });
      }

      const activeHolds = await Booking.find({
        userId,
        status: "held",
        holdExpiresAt: { $gt: new Date() },
      })
        .populate("screeningId", "movieId startTime")
        .select("-paymentInfo");

      response.json(activeHolds);
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },

  // Get user's booking history
  getBookingHistory: async (request, response) => {
    try {
      const token = request.cookies.access_token;
      if (!token) {
        return response.status(401).json({ message: "Token not available" });
      }

      const userId = getUserIdFromToken(token);
      if (!isValidObjectId(userId)) {
        return response.status(401).json({ message: "Invalid user ID" });
      }

      const bookings = await Booking.find({
        userId,
        status: { $in: ["confirmed", "cancelled"] },
      })
        .populate("screeningId", "movieId startTime")
        .sort({ createdAt: -1 });

      response.json(bookings);
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  },
  downloadTicket: async (request, response) => {
    try {
      // Simulate booking confirmation data
      const bookingData = {
        message: "Booking confirmed successfully",
        confirmationCode: "92ADEF38",
        bookingDetails: {
          movieName: "Purna Bahadur ko Sarangi",
          date: "Saturday, February 22, 2025",
          startTime: "12:19 AM",
          distributorName: "Rohan",
          theatreName: "KL Tower",
          hallName: "Hall Platinum",
          seats: [
            { section: 1, row: "E", seatNumber: 3 },
            { section: 1, row: "E", seatNumber: 4 },
          ],
          totalPrice: 696,
        },
      };

      // Generate PDF
      const pdfPath = "booking_confirmation.pdf";
      await generatePdf(bookingData, pdfPath);

      // Send the PDF as a downloadable file
      response.download(pdfPath, "booking_confirmation.pdf", (err) => {
        if (err) {
          console.error("Error sending PDF:", err);
          response.status(500).json({ message: "Error generating PDF" });
        }
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      response.status(500).json({ message: "Error confirming booking" });
    }
  },
};
