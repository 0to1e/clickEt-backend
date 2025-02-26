// src/routes/paymentRoutes.js
import express from "express";
import khaltiController from "../controller/khaltiController.js";
import { protectRoute } from "../middleware/auth/routeProtection.js";

const router = express.Router();

// Khalti payment routes
router.post("/khalti/initiate",protectRoute(), khaltiController.initiatePayment);
router.post("/khalti/verify", protectRoute(), khaltiController.verifyPayment);
router.get("/khalti/status/:pidx", protectRoute(), khaltiController.getPaymentStatus);

export default router;