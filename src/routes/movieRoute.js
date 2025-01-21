// src/routes/movieRoute.js
import express from "express";
import { validationRules } from "../middleware/validation/movieValidation.js";
import { checkAndFormatDate } from "../middleware/utils/dateFormatter.js";
import { commonlyUsedValidationResult } from "../utils/prettyValidationResult.js";
import {
  addMovie,
  deleteMovie,
  updateMovie,
  checkUniqueMovies,
  getAllMovies,
  getMovieByName,
  getMoviesByCategory,
  getMovieById,
  getMoviesByStatus,
} from "../controller/moviesController.js";

const router = express.Router();

router.post("/add", validationRules, commonlyUsedValidationResult , addMovie);

router.get("/getAll", getAllMovies);
router.post("/getByName", getMovieByName);
router.post("/getByCategory", getMoviesByCategory);
router.post("/getById/:movieId",getMovieById); 
router.get("/:status", getMoviesByStatus);

router.put(
  "/update/:id",
  checkAndFormatDate,
  validationRules,
  commonlyUsedValidationResult,
  updateMovie
);

router.delete("/delete/:id", deleteMovie);

router.post("/checkUnique", checkUniqueMovies);
export default router;
