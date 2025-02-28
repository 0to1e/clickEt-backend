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
  getMovieById,
  getMoviesByStatus,
  updateMoviesWithSlugs,
  getMovieBySlug,
} from "../controller/moviesController.js";

const router = express.Router();

router.post("/add", validationRules, commonlyUsedValidationResult, addMovie);

router.get("/getAll", getAllMovies);
router.get("/:slug", getMovieBySlug);
router.post("/getById/:movieId", getMovieById);
router.get("/status/:status", getMoviesByStatus);

router.put(
  "/update/:id",
  checkAndFormatDate,
  validationRules,
  commonlyUsedValidationResult,
  updateMovie
);

router.post("/updateAll", updateMoviesWithSlugs);

router.delete("/delete/:id", deleteMovie);

router.delete("/delete/:id", deleteMovie);

router.post("/checkUnique", checkUniqueMovies);
export default router;
