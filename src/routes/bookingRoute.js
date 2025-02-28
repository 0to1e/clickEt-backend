// src/routes/bookingRoute.js
import express from "express";
import { bookingController } from "../controller/bookingController.js";
import { protectRoute } from "../middleware/auth/routeProtection.js";

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
  "/history",
  protectRoute(),
  bookingController.getBookingHistory
);

router.delete("/delete/:id", bookingController.deleteBookingById)

export default router;
