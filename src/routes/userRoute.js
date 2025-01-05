// src/routes/userRoute.js
import express from "express";
import {
  authValidationRules,
  registrationValidationRules,
  forgetValidationRules,
  resetValidationRules,
} from "../middleware/validation/authValidation.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  checkExistingAuthCredentials,
  getUserDetails,
  initAuthentication,
  initLogOut,
  initRegistration,
  initTokenRefresh,
  resetPassword,
  sendResetEmail,
} from "../controller/authController.js";
import { protectRoute } from "../middleware/auth/routeProtection.js";
import { resetLimiter } from "../utils/emailUtils.js";
const router = express.Router();

router.post(
  "/register",
  registrationValidationRules,
  commonlyUsedValidationResult,
  initRegistration
);

router.post(
  "/login",
  authValidationRules,
  commonlyUsedValidationResult,
  initAuthentication
);
router.post(
  "/forget-password",
  resetLimiter,
  forgetValidationRules,
  commonlyUsedValidationResult,
  sendResetEmail
);
router.post(
  "/reset-password",
  resetValidationRules,
  commonlyUsedValidationResult,
  resetPassword
);

router.post("/checkUnique", checkExistingAuthCredentials);

router.post("/refresh", protectRoute(), initTokenRefresh);
router.get("/users/me", protectRoute(), getUserDetails);
router.post("/logout", protectRoute(), initLogOut);

export default router;
