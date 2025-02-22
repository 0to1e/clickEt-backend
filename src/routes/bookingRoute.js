// src/routes/bookingRoute.js
import express from "express";
import { bookingController } from "../controller/bookingController.js";
import { protectRoute } from "../middleware/auth/routeProtection.js";
import generatePdf from "../utils/pdfUtils/pdfGenerator.js";

const router = express.Router();

router.post("/hold", protectRoute(), bookingController.holdSeats);

router.post("/confirm", protectRoute(), bookingController.confirmBooking);
router.post("/download", protectRoute(), bookingController.downloadTicket);

router.get("/holds/getAll", protectRoute(), bookingController.getActiveHolds);
router.delete(
  "/hold/release/:holdId",
  protectRoute(),
  bookingController.releaseHold
);
router.get(
  "/bookings/history",
  protectRoute(),
  bookingController.getBookingHistory
);

export default router;
