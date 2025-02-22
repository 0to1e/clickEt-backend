// routes/hallRoutes.js
import express from "express";
import {
  createHall,
  getAllHalls,
  getHallById,
  updateHall,
  deleteHall,
  toggleHallStatus,
  getHallsByTheatre,
} from "../controller/hallController.js";

const router = express.Router();

router.post("/add", createHall);
router.get("/getAll", getAllHalls);
router.get("/theatre/:theatreId", getHallsByTheatre);
router.get("/:id", getHallById);
router.patch("/update/:id", updateHall);
router.patch('/toggle/:id', toggleHallStatus);
router.delete("/delete/:id", deleteHall);

export default router;