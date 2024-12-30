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
} from "../controller/distributorsController.js";

const router = express.Router();

router.post("/add", validationRules, 
  commonlyUsedValidationResult
  , addDistributor);

router.get("/getAll", getAllDistributors);
router.post("/getByName", getDistributorByName);
router.post("/getByStatus/:isActive", getDistributorsbyStatus);

router.put(
  "/update/:id",
  validationRules,
  commonlyUsedValidationResult,
  updateDistributor
);

router.delete("/delete/:id", deleteDistributor);

router.post("/checkUnique", checkUniqueDistributors);
export default router;
