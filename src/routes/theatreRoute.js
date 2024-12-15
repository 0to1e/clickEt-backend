import express from "express";
import { validateTheatre } from "../middleware/validation/theatreValidation.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  addTheatre,
  getAllTheatres,
  getTheatreByName,
  getTheatresbyStatus,
  getTheatresByAddress,
  updateTheatre,
  deleteTheatre,
} from "../controller/theatreController.js";
const router = express.Router();

router.post("/add", validateTheatre, commonlyUsedValidationResult, addTheatre);

router.get("/getAll", getAllTheatres);
router.post("/getByName", getTheatreByName);
router.post("/getByStatus/:isActive", getTheatresbyStatus);
router.post("/getByAddress", getTheatresByAddress);

router.put(
  "/update/:id",
  validateTheatre,
  commonlyUsedValidationResult,
  updateTheatre
);

router.delete("/delete/:id", deleteTheatre);

export default router;
