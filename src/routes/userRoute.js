// src/routes/userRoute.js
import express from "express";
import {
  authValidationRules,
  registrationValidationRules,
  forgetValidationRules,
  resetValidationRules
} from "../middleware/validation/authValidation.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  checkExistingAuthCredentials,
  initAuthentication,
  initRegistration,
  initTokenRefresh,
  resetPassword,
  sendResetEmail,
} from "../controller/authController.js";
const router = express.Router();
import { resetLimiter } from "../utils/emailUtils.js";

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

router.post("/refresh", initTokenRefresh);

router.post("/checkUnique", checkExistingAuthCredentials);
export default router;
