import express from "express";
import {
  authValidationRules,
  registrationValidationRules,
} from "../middleware/validation/authValidation.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  checkExistingAuthCredentials,
  initAuthentication,
  initRegistration,
} from "../controller/authController.js";
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

router.post("/checkUnique", checkExistingAuthCredentials);
export default router;
