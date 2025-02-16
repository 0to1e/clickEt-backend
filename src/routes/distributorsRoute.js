// src/routes/distributorsRoute.js
import express from "express";
import { validationRules } from "../middleware/validation/distributorsValidation.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  addDistributor,
  checkUniqueDistributors,
  deleteDistributor,
  getAllDistributors,
  getDistributorByName,
  getDistributorsbyStatus,
  updateDistributor,
  uploadDistributorLogo,
} from "../controller/distributorsController.js";
import { protectRoute } from "../middleware/auth/routeProtection.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/add",
  // protectRoute(["ADMIN"]),
  validationRules,
  commonlyUsedValidationResult,
  addDistributor
);

router.get("/getAll", getAllDistributors);
router.get("/", getDistributorByName);
router.get("/getByStatus/:isActive", getDistributorsbyStatus);

router.put(
  "/update/:id",
  validationRules,
  commonlyUsedValidationResult,
  updateDistributor
);
router.post('/upload', protectRoute(), upload.single('image'), uploadDistributorLogo);

router.delete("/delete/:id", deleteDistributor);

router.post("/checkUnique", checkUniqueDistributors);
export default router;
